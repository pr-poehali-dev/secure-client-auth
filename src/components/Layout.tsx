import { useState } from 'react';
import { useBank } from '../context/BankContext';
import Icon from '@/components/ui/icon';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'profile', label: 'Личный кабинет', icon: 'UserCircle' },
  { id: 'cashout', label: 'Выдача наличных', icon: 'ArrowUpFromLine' },
  { id: 'cashin', label: 'Взнос наличных', icon: 'ArrowDownToLine' },
  { id: 'transfer', label: 'Переводы', icon: 'ArrowLeftRight' },
  { id: 'history', label: 'История операций', icon: 'History' },
  { id: 'reports', label: 'Отчёты и аналитика', icon: 'BarChart3' },
  { id: 'clients', label: 'Клиентская база', icon: 'Users' },
  { id: 'credits', label: 'Кредиты и рассрочка', icon: 'CreditCard' },
  { id: 'queue', label: 'Электронная очередь', icon: 'ListOrdered' },
  { id: 'cards', label: 'Банковские карты', icon: 'Wallet' },
  { id: 'terminals', label: 'Терминалы Сбер', icon: 'Monitor' },
  { id: 'employees', label: 'Сотрудники', icon: 'UserCog' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { state, navigate, logout } = useBank();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F7FA' }}>
      {/* Sidebar */}
      <aside
        className="sber-sidebar flex flex-col transition-all duration-300 flex-shrink-0"
        style={{ width: collapsed ? 64 : 260 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)', minHeight: 64 }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#21A038' }}>
            <Icon name="Building2" size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-white text-sm leading-tight truncate">АС ЕФС СБОЛ.про</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Банковская система</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5" style={{ scrollbarWidth: 'none' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`sber-nav-item w-full flex items-center gap-3 px-3 py-2.5 text-left ${state.currentPage === item.id ? 'active' : ''}`}
            >
              <Icon name={item.icon as 'LayoutDashboard'} size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: '#21A038', color: '#fff' }}>
                {state.currentUser?.name?.slice(0, 1)}
              </div>
              <div className="overflow-hidden flex-1">
                <div className="text-xs font-medium text-white truncate">{state.currentUser?.name}</div>
                <div className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{state.currentUser?.position}</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="sber-nav-item w-full flex items-center gap-3 px-3 py-2"
          >
            <Icon name="LogOut" size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm">Выйти</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sber-nav-item w-full flex items-center justify-center px-3 py-2 mt-1"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="sber-header flex items-center justify-between px-6" style={{ height: 64, flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <h1 className="font-semibold text-white text-lg">
              {NAV_ITEMS.find(n => n.id === state.currentPage)?.label || 'Главная'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="security-badge">
              <Icon name="Shield" size={11} />
              Защищённое соединение
            </div>
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.2)' }}>
                {state.currentUser?.name?.slice(0, 1)}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-xs font-medium">{state.currentUser?.name}</span>
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{state.currentUser?.position}</span>
              </div>
            </div>
            <div className="text-xs text-white opacity-60">{new Date().toLocaleDateString('ru-RU')}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
