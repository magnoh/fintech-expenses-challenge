import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().min(1, 'O e-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(1, 'A confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: authRegister } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await authRegister({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      showToast('Cadastro realizado com sucesso! Bem-vindo.');
      navigate('/');
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Erro ao realizar cadastro. Tente outro e-mail.';
      showToast(Array.isArray(apiError) ? apiError[0] : apiError, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-brand-glow)',
            color: 'var(--color-brand)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem'
          }}>
            <CreditCard size={28} />
          </div>
          <h1 className="auth-title">Criar uma conta</h1>
          <p className="text-secondary-label">Cadastre-se para acompanhar seu fluxo financeiro</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Nome completo</label>
            <input
              id="name"
              type="text"
              placeholder="Digite seu nome"
              className="form-control"
              style={{ borderColor: errors.name ? 'var(--color-danger)' : undefined }}
              {...formRegister('name')}
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail corporativo</label>
            <input
              id="email"
              type="email"
              placeholder="seuemail@empresa.com"
              className="form-control"
              style={{ borderColor: errors.email ? 'var(--color-danger)' : undefined }}
              {...formRegister('email')}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                className="form-control"
                style={{
                  borderColor: errors.password ? 'var(--color-danger)' : undefined,
                  paddingRight: '2.5rem'
                }}
                {...formRegister('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repita sua senha"
              className="form-control"
              style={{ borderColor: errors.confirmPassword ? 'var(--color-danger)' : undefined }}
              {...formRegister('confirmPassword')}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '42px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cadastrando...</span>
              </>
            ) : (
              'Criar Minha Conta'
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Já possui conta? <Link to="/login" style={{ fontWeight: 600 }}>Faça login</Link>
        </p>
      </div>
    </div>
  );
};
