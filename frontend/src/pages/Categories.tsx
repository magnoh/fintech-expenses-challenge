import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tag, Plus, Edit, Trash2, X, AlertCircle } from 'lucide-react';
import { categoriesApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Category } from '../types';

const categorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(255, 'Máximo 255 caracteres').optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const Categories: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  // Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Buscar categorias
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Formulário de Criação
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Formulário de Edição
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  // Mutações
  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('Categoria criada com sucesso!');
      setIsCreateOpen(false);
      resetCreate();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao criar categoria.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryFormValues }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('Categoria atualizada com sucesso!');
      setEditingCategory(null);
      resetEdit();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao atualizar categoria.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      showToast('Categoria excluída com sucesso!');
      setDeletingId(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao excluir categoria.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      setDeletingId(null);
    },
  });

  // Handlers
  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    resetEdit({
      name: category.name,
      description: category.description || '',
    });
  };

  const handleCreateSubmit = (values: CategoryFormValues) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = (values: CategoryFormValues) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: values });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="title-large">Categorias</h1>
          <p className="text-secondary-label">Cadastre categorias de movimentação para fins de classificação e relatórios.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>Nova Categoria</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
          Carregando categorias...
        </div>
      ) : categories.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Tag size={40} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Nenhuma categoria cadastrada</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Crie categorias (ex: Alimentação, Serviços) para associar às suas transações.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)} style={{ marginTop: '0.5rem' }}>
            Criar primeira categoria
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td style={{ fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={16} color="var(--color-brand)" />
                      {category.name}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {category.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem descrição</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                      <button 
                        className="btn-icon" 
                        title="Editar categoria"
                        onClick={() => handleOpenEdit(category)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-danger" 
                        title="Excluir categoria"
                        onClick={() => setDeletingId(category.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CRIAR CATEGORIA */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Nova Categoria</h2>
              <button className="btn-icon" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate(handleCreateSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="create-name">Nome da Categoria</label>
                  <input
                    id="create-name"
                    type="text"
                    placeholder="Ex: Alimentação, Transporte..."
                    className="form-control"
                    style={{ borderColor: errorsCreate.name ? 'var(--color-danger)' : undefined }}
                    {...registerCreate('name')}
                  />
                  {errorsCreate.name && <p className="form-error">{errorsCreate.name.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="create-desc">Descrição (opcional)</label>
                  <textarea
                    id="create-desc"
                    placeholder="Breve descrição sobre o que entra nesta categoria"
                    className="form-control"
                    rows={3}
                    style={{ resize: 'none', borderColor: errorsCreate.description ? 'var(--color-danger)' : undefined }}
                    {...registerCreate('description')}
                  />
                  {errorsCreate.description && <p className="form-error">{errorsCreate.description.message}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Criando...' : 'Salvar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR CATEGORIA */}
      {editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Categoria</h2>
              <button className="btn-icon" onClick={() => setEditingCategory(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit(handleEditSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-name">Nome da Categoria</label>
                  <input
                    id="edit-name"
                    type="text"
                    placeholder="Ex: Alimentação..."
                    className="form-control"
                    style={{ borderColor: errorsEdit.name ? 'var(--color-danger)' : undefined }}
                    {...registerEdit('name')}
                  />
                  {errorsEdit.name && <p className="form-error">{errorsEdit.name.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-desc">Descrição (opcional)</label>
                  <textarea
                    id="edit-desc"
                    placeholder="Breve descrição"
                    className="form-control"
                    rows={3}
                    style={{ resize: 'none', borderColor: errorsEdit.description ? 'var(--color-danger)' : undefined }}
                    {...registerEdit('description')}
                  />
                  {errorsEdit.description && <p className="form-error">{errorsEdit.description.message}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCategory(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXCLUSÃO */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                <AlertCircle size={20} />
                Confirmar exclusão
              </h2>
            </div>
            <div className="modal-body" style={{ padding: '0 1.5rem 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Nota: Se houver transações vinculadas a esta categoria, o banco de dados impedirá a exclusão para preservar o histórico.
              </p>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none' }}>
              <button className="btn btn-secondary" onClick={() => setDeletingId(null)}>
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
