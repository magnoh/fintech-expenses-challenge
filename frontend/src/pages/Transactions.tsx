import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, Edit, Trash2, X, AlertCircle, Filter, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { transactionsApi, categoriesApi } from '../api';
import { useToast } from '../context/ToastContext';
import { Transaction, TransactionType } from '../types';

const transactionSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória').max(255, 'Máximo 255 caracteres'),
  amount: z.number({ invalid_type_error: 'O valor deve ser um número' }).positive('O valor deve ser maior que zero'),
  type: z.enum(['income', 'expense'] as const, { errorMap: () => ({ message: 'Escolha o tipo' }) }),
  date: z.string().min(1, 'A data é obrigatória'),
  categoryId: z.string().uuid('Selecione uma categoria válida'),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export const Transactions: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  // Paginação e filtros de busca
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Estados dos Modais
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Buscar categorias para dropdowns de filtros/formulários
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Buscar transações paginadas e filtradas
  const { data: responseData, isLoading } = useQuery({
    queryKey: ['transactions', page, limit, filterType, filterCategory, filterStartDate, filterEndDate],
    queryFn: () => transactionsApi.getAll({
      page,
      limit,
      type: filterType || undefined,
      categoryId: filterCategory || undefined,
      startDate: filterStartDate || undefined,
      endDate: filterEndDate || undefined,
    }),
  });

  const transactions = responseData?.data || [];
  const meta = responseData?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Formulário de Criação
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
    }
  });

  // Formulário de Edição
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
  });

  // Mutações
  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Transação registrada com sucesso!');
      setIsCreateOpen(false);
      resetCreate();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao registrar transação.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionFormValues }) =>
      transactionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Transação atualizada com sucesso!');
      setEditingTransaction(null);
      resetEdit();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao atualizar transação.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showToast('Transação excluída com sucesso!');
      setDeletingId(null);
      
      // Ajustar página atual caso o último item da página tenha sido excluído
      if (transactions.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erro ao excluir transação.';
      showToast(Array.isArray(msg) ? msg[0] : msg, 'error');
      setDeletingId(null);
    },
  });

  // Handlers
  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    resetEdit({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.date).toISOString().split('T')[0],
      categoryId: transaction.categoryId,
    });
  };

  const handleCreateSubmit = (values: TransactionFormValues) => {
    createMutation.mutate(values);
  };

  const handleEditSubmit = (values: TransactionFormValues) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, data: values });
    }
  };

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleClearFilters = () => {
    setFilterType('');
    setFilterCategory('');
    setFilterStartDate('');
    setFilterEndDate('');
    setPage(1);
    showToast('Filtros de transação limpos.');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    // Ajustar fuso horário local para renderizar corretamente a data informada
    return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(d.toISOString().substring(0, 10)));
  };

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="title-large">Transações</h1>
          <p className="text-secondary-label">Monitore e gerencie entradas e saídas de caixa da empresa.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} />
          <span>Lançar Transação</span>
        </button>
      </div>

      {/* FILTER BAR PANEL */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          <Filter size={14} />
          <span>Filtros de busca</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end'
        }} className="filters-grid">
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo</label>
            <select 
              className="form-control" 
              value={filterType} 
              onChange={(e) => { setFilterType(e.target.value as any); setPage(1); }}
            >
              <option value="">Todos</option>
              <option value="income">Entrada (+)</option>
              <option value="expense">Saída (-)</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Categoria</label>
            <select 
              className="form-control" 
              value={filterCategory} 
              onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            >
              <option value="">Todas</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>De</label>
            <input 
              type="date" 
              className="form-control" 
              value={filterStartDate} 
              onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Até</label>
            <input 
              type="date" 
              className="form-control" 
              value={filterEndDate} 
              onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', minWidth: '100px' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '0.625rem' }} 
              onClick={handleClearFilters}
              title="Limpar filtros"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
          <p>Carregando movimentações...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Nenhuma transação encontrada</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tente alterar os filtros ou lance uma nova transação de caixa.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            Lançar primeira transação
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 500 }}>{t.description}</td>
                    <td style={{ 
                      fontWeight: 600, 
                      color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' 
                    }}>
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {t.type === 'income' ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <span className="badge badge-neutral">
                        {t.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                        <button 
                          className="btn-icon" 
                          title="Editar lançamento"
                          onClick={() => handleOpenEdit(t)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-icon-danger" 
                          title="Excluir lançamento"
                          onClick={() => setDeletingId(t.id)}
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

          {/* PAGINATION PANEL */}
          <div className="flex-between" style={{ marginTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Mostrando {transactions.length} de {meta.total} transações (Pág. {meta.page} de {meta.totalPages})
            </span>
            <div className="flex-gap-2">
              <button 
                className="btn btn-secondary" 
                onClick={() => setPage((p) => Math.max(p - 1, 1))} 
                disabled={page === 1}
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <ChevronLeft size={16} />
                <span>Anterior</span>
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))} 
                disabled={page === meta.totalPages}
                style={{ padding: '0.5rem 0.75rem' }}
              >
                <span>Próxima</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* MODAL: CRIAR LANÇAMENTO */}
      {isCreateOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Novo Lançamento</h2>
              <button className="btn-icon" onClick={() => setIsCreateOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitCreate(handleCreateSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="desc-t">Descrição</label>
                  <input
                    id="desc-t"
                    type="text"
                    placeholder="Ex: Pagamento AWS, Faturamento Cliente..."
                    className="form-control"
                    style={{ borderColor: errorsCreate.description ? 'var(--color-danger)' : undefined }}
                    {...registerCreate('description')}
                  />
                  {errorsCreate.description && <p className="form-error">{errorsCreate.description.message}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="amount-t">Valor (R$)</label>
                    <input
                      id="amount-t"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="form-control"
                      style={{ borderColor: errorsCreate.amount ? 'var(--color-danger)' : undefined }}
                      {...registerCreate('amount', { valueAsNumber: true })}
                    />
                    {errorsCreate.amount && <p className="form-error">{errorsCreate.amount.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="type-t">Tipo</label>
                    <select
                      id="type-t"
                      className="form-control"
                      style={{ borderColor: errorsCreate.type ? 'var(--color-danger)' : undefined }}
                      {...registerCreate('type')}
                    >
                      <option value="expense">Saída (Despesa)</option>
                      <option value="income">Entrada (Receita)</option>
                    </select>
                    {errorsCreate.type && <p className="form-error">{errorsCreate.type.message}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="date-t">Data</label>
                    <input
                      id="date-t"
                      type="date"
                      className="form-control"
                      style={{ borderColor: errorsCreate.date ? 'var(--color-danger)' : undefined }}
                      {...registerCreate('date')}
                    />
                    {errorsCreate.date && <p className="form-error">{errorsCreate.date.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="cat-t">Categoria</label>
                    <select
                      id="cat-t"
                      className="form-control"
                      style={{ borderColor: errorsCreate.categoryId ? 'var(--color-danger)' : undefined }}
                      {...registerCreate('categoryId')}
                    >
                      <option value="">Selecione...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errorsCreate.categoryId && <p className="form-error">{errorsCreate.categoryId.message}</p>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Lançando...' : 'Lançar Transação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR LANÇAMENTO */}
      {editingTransaction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Editar Lançamento</h2>
              <button className="btn-icon" onClick={() => setEditingTransaction(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitEdit(handleEditSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-desc-t">Descrição</label>
                  <input
                    id="edit-desc-t"
                    type="text"
                    className="form-control"
                    style={{ borderColor: errorsEdit.description ? 'var(--color-danger)' : undefined }}
                    {...registerEdit('description')}
                  />
                  {errorsEdit.description && <p className="form-error">{errorsEdit.description.message}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-amount-t">Valor (R$)</label>
                    <input
                      id="edit-amount-t"
                      type="number"
                      step="0.01"
                      className="form-control"
                      style={{ borderColor: errorsEdit.amount ? 'var(--color-danger)' : undefined }}
                      {...registerEdit('amount', { valueAsNumber: true })}
                    />
                    {errorsEdit.amount && <p className="form-error">{errorsEdit.amount.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-type-t">Tipo</label>
                    <select
                      id="edit-type-t"
                      className="form-control"
                      style={{ borderColor: errorsEdit.type ? 'var(--color-danger)' : undefined }}
                      {...registerEdit('type')}
                    >
                      <option value="expense">Saída (Despesa)</option>
                      <option value="income">Entrada (Receita)</option>
                    </select>
                    {errorsEdit.type && <p className="form-error">{errorsEdit.type.message}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-date-t">Data</label>
                    <input
                      id="edit-date-t"
                      type="date"
                      className="form-control"
                      style={{ borderColor: errorsEdit.date ? 'var(--color-danger)' : undefined }}
                      {...registerEdit('date')}
                    />
                    {errorsEdit.date && <p className="form-error">{errorsEdit.date.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-cat-t">Categoria</label>
                    <select
                      id="edit-cat-t"
                      className="form-control"
                      style={{ borderColor: errorsEdit.categoryId ? 'var(--color-danger)' : undefined }}
                      {...registerEdit('categoryId')}
                    >
                      <option value="">Selecione...</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errorsEdit.categoryId && <p className="form-error">{errorsEdit.categoryId.message}</p>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingTransaction(null)}>
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

      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {deletingId && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
                <AlertCircle size={20} />
                Excluir Lançamento
              </h2>
            </div>
            <div className="modal-body" style={{ padding: '0 1.5rem 1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Tem certeza que deseja excluir esta movimentação financeira? Esta ação não pode ser desfeita.
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
