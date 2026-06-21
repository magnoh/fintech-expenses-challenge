import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(values);
      showToast('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.';
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
          <h1 className="auth-title">Entrar na plataforma</h1>
          <p className="text-secondary-label">Gerencie as despesas corporativas da sua empresa</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
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

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '42px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Entrando...</span>
              </>
            ) : (
              'Acessar Conta'
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)'
        }}>
          Não possui conta? <Link to="/register" style={{ fontWeight: 600 }}>Cadastre-se</Link>
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
