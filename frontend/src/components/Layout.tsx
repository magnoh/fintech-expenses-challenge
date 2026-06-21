import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Receipt, Tag, LogOut, Menu, X, User, CreditCard, ChevronLeft, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Initialize theme from document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/transactions', label: 'Transações', icon: <Receipt size={20} /> },
    { to: '/categories', label: 'Categorias', icon: <Tag size={20} /> },
  ];

  return (
    <div className="app-container" style={{ '--sidebar-width': isExpanded ? '260px' : '80px' } as React.CSSProperties}>
      {/* Mobile Header */}
      <header style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 1.5rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 100,
      }} className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-brand-glow)',
            color: 'var(--color-brand)',
            padding: '0.5rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            <CreditCard size={20} />
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '-0.025em' }}>Fintech</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        transform: mobileMenuOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s ease'
      }} className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Sidebar Logo & Toggle */}
        <div style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: isExpanded ? '0 1.5rem' : '0',
          borderBottom: '1px solid var(--border-color)',
          transition: 'all 0.3s ease'
        }}>
          {isExpanded ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--color-brand-glow)',
                  color: 'var(--color-brand)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <CreditCard size={20} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.025em' }}>Fintech</span>
              </div>
              <button onClick={() => setIsExpanded(false)} className="btn-icon" title="Recolher Menu">
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setIsExpanded(true)} className="btn-icon" title="Expandir Menu">
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: isExpanded ? '0.75rem' : '0',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                transition: 'all 0.2s ease',
              })}
              className="nav-link"
              title={item.label}
            >
              {item.icon}
              {isExpanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User profile details and logout */}
        <div style={{
          padding: isExpanded ? '1.5rem' : '1.5rem 0',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isExpanded ? 'stretch' : 'center',
          gap: '1rem',
          backgroundColor: 'transparent'
        }}>
          {isExpanded ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)'
              }}>
                <User size={18} />
              </div>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.name}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</p>
              </div>
            </div>
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }} title={user?.name}>
              <User size={18} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              style={{
                width: isExpanded ? '100%' : 'auto',
                padding: '0.5rem',
                fontSize: '0.75rem',
                border: isExpanded ? '1px solid var(--border-color)' : 'none'
              }}
              title={isDarkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
            >
              {isDarkMode ? <Sun size={isExpanded ? 14 : 20} /> : <Moon size={isExpanded ? 14 : 20} />}
              {isExpanded && <span>{isDarkMode ? "Tema Claro" : "Tema Escuro"}</span>}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{
                width: isExpanded ? '100%' : 'auto',
                padding: '0.5rem',
                fontSize: '0.75rem',
                border: isExpanded ? '1px solid var(--border-color)' : 'none'
              }}
              title="Sair da Conta"
            >
              <LogOut size={isExpanded ? 14 : 20} />
              {isExpanded && <span>Sair da Conta</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        <div className="content-body" style={{ marginTop: mobileMenuOpen ? 'var(--header-height)' : 0 }}>
          {children}
        </div>
      </main>

      {/* CSS adjustments for mobile styling */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
          .sidebar {
            transform: translateX(-100%) !important;
            padding-top: var(--header-height);
          }
          .sidebar.open {
            transform: translateX(0) !important;
          }
          .content-body {
            padding: 1.5rem !important;
            margin-top: calc(var(--header-height) + 0.5rem) !important;
          }
        }
        
        .nav-link:not(.active):hover {
          background-color: var(--bg-tertiary) !important;
          color: var(--text-primary) !important;
        }
      `}} />
    </div>
  );
};
