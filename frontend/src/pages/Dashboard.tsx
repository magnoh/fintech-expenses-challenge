import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, TrendingDown, DollarSign, RefreshCw, BarChart2 
} from 'lucide-react';
import { dashboardApi } from '../api';
import { useToast } from '../context/ToastContext';

export const Dashboard: React.FC = () => {
  const { showToast } = useToast();

  // Obter primeiro dia do mês atual e o dia de hoje
  const getFirstDayOfMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getToday());

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard', startDate, endDate],
    queryFn: () => dashboardApi.getStats({ 
      startDate: startDate || undefined, 
      endDate: endDate || undefined 
    }),
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    showToast('Filtro de período limpo. Exibindo histórico completo.');
  };

  if (isError) {
    showToast('Erro ao carregar dados do painel.', 'error');
  }

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="title-large">Painel Geral</h1>
          <p className="text-secondary-label">Visão geral do seu fluxo de caixa e principais saídas.</p>
        </div>

        {/* Date Filter Form */}
        <form onSubmit={handleApplyFilter} style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '1rem',
          flexWrap: 'wrap',
          backgroundColor: 'var(--bg-secondary)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>De</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                className="form-control"
                style={{ paddingRight: '2rem', minWidth: '150px' }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Até</label>
            <input
              type="date"
              className="form-control"
              style={{ minWidth: '150px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex-gap-2">
            <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 1rem' }} disabled={isLoading}>
              Filtrar
            </button>
            {(startDate || endDate) && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClearFilters}
                style={{ padding: '0.625rem' }}
              >
                Limpar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        <div className="card metric-card" style={{ padding: '1.75rem' }}>
          <div className="flex-between">
            <span className="text-secondary-label" style={{ fontWeight: 600 }}>Saldo Atual</span>
            <div style={{
              color: 'var(--color-brand)',
              backgroundColor: 'var(--color-brand-glow)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="metric-value">
            {isLoading ? '...' : formatCurrency(stats?.currentBalance || 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem'
          }}>
            Saldo global acumulado na conta
          </p>
        </div>

        <div className="card metric-card income" style={{ padding: '1.75rem' }}>
          <div className="flex-between">
            <span className="text-secondary-label" style={{ fontWeight: 600 }}>Entradas no Período</span>
            <div style={{
              color: 'var(--color-success)',
              backgroundColor: 'var(--color-success-glow)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-success)' }}>
            {isLoading ? '...' : formatCurrency(stats?.totalIncome || 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem'
          }}>
            Faturamento acumulado no período filtrado
          </p>
        </div>

        <div className="card metric-card expense" style={{ padding: '1.75rem' }}>
          <div className="flex-between">
            <span className="text-secondary-label" style={{ fontWeight: 600 }}>Saídas no Período</span>
            <div style={{
              color: 'var(--color-danger)',
              backgroundColor: 'var(--color-danger-glow)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)'
            }}>
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--color-danger)' }}>
            {isLoading ? '...' : formatCurrency(stats?.totalExpenses || 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem'
          }}>
            Gastos e pagamentos efetuados no período
          </p>
        </div>
      </div>

      {/* Main Dashboard Panel layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '1.5rem',
        marginTop: '2rem'
      }} className="dashboard-charts-layout">
        
        {/* Visual summary card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} color="var(--color-brand)" />
            <span>Fluxo de Caixa</span>
          </h2>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <p className="text-secondary-label" style={{ marginBottom: '0.5rem' }}>Proporção de Saídas em relação às Entradas</p>
                <div style={{
                  height: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '999px',
                  overflow: 'hidden',
                  display: 'flex'
                }}>
                  {stats && stats.totalIncome + stats.totalExpenses > 0 ? (
                    <>
                      <div style={{
                        width: `${(stats.totalIncome / (stats.totalIncome + stats.totalExpenses)) * 100}%`,
                        backgroundColor: 'var(--color-success)',
                        transition: 'width 0.5s ease'
                      }} title="Entradas" />
                      <div style={{
                        width: `${(stats.totalExpenses / (stats.totalIncome + stats.totalExpenses)) * 100}%`,
                        backgroundColor: 'var(--color-danger)',
                        transition: 'width 0.5s ease'
                      }} title="Saídas" />
                    </>
                  ) : (
                    <div style={{ width: '100%', backgroundColor: 'var(--border-color)' }} />
                  )}
                </div>
                <div className="flex-between" style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                    Entradas: {stats && stats.totalIncome + stats.totalExpenses > 0 ? ((stats.totalIncome / (stats.totalIncome + stats.totalExpenses)) * 100).toFixed(0) : 0}%
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} />
                    Saídas: {stats && stats.totalIncome + stats.totalExpenses > 0 ? ((stats.totalExpenses / (stats.totalIncome + stats.totalExpenses)) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-primary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                fontSize: '0.875rem'
              }}>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Dica de Saúde Financeira:</p>
                {stats && stats.totalExpenses > stats.totalIncome ? (
                  <p style={{ color: 'var(--color-danger)' }}>
                    Alerta: Suas saídas estão superando as entradas neste período! Analise as maiores categorias de despesas abaixo para reduzir custos supérfluos.
                  </p>
                ) : stats && stats.totalIncome > 0 ? (
                  <p style={{ color: 'var(--color-success)' }}>
                    Parabéns! Sua empresa está operando no azul neste período. O saldo líquido restante é de {formatCurrency(stats.totalIncome - stats.totalExpenses)}.
                  </p>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Nenhuma movimentação registrada no período selecionado. Crie algumas transações para visualizar o diagnóstico de caixa.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Categories volume of expenses */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Maiores Saídas</h2>
          
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
            </div>
          ) : !stats || stats.topCategories.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}>
              Nenhuma saída no período.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {stats.topCategories.map((category, index) => {
                const totalExpensesVal = stats.totalExpenses || 1;
                const percentage = Math.min(((category.amount / totalExpensesVal) * 100), 100);

                return (
                  <div key={category.name}>
                    <div className="flex-between" style={{ marginBottom: '0.375rem', fontSize: '0.875rem' }}>
                      <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>{index + 1}</span>
                        {category.name}
                      </span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(category.amount)}</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div style={{
                      height: '8px',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        backgroundColor: index === 0 ? 'var(--color-danger)' : index === 1 ? '#f59e0b' : '#3b82f6',
                        height: '100%',
                        borderRadius: '999px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {percentage.toFixed(1)}% do total de saídas
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .dashboard-charts-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
    </div>
  );
};
