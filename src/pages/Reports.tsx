import { useBank } from '../context/BankContext';
import Icon from '@/components/ui/icon';

export default function Reports() {
  const { state } = useBank();

  const txByType = Object.entries(
    state.transactions.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {} as Record<string, number>)
  );

  const txByEmployee = state.employees.map(emp => ({
    name: emp.name,
    count: state.transactions.filter(t => t.employeeId === emp.id).length,
    amount: state.transactions.filter(t => t.employeeId === emp.id).reduce((s, t) => s + t.amount, 0),
  })).filter(e => e.count > 0).sort((a, b) => b.count - a.count);

  const totalVolume = state.transactions.reduce((s, t) => s + t.amount, 0);
  const avgTx = state.transactions.length > 0 ? totalVolume / state.transactions.length : 0;
  const completedCount = state.transactions.filter(t => t.status === 'completed').length;
  const successRate = state.transactions.length > 0 ? Math.round((completedCount / state.transactions.length) * 100) : 100;

  const typeLabels: Record<string, string> = {
    cashin: 'Взносы', cashout: 'Выдача', transfer: 'Переводы', credit_issue: 'Кредиты', card_issue: 'Карты',
  };
  const typeColors: Record<string, string> = {
    cashin: '#21A038', cashout: '#DC2626', transfer: '#7C3AED', credit_issue: '#D97706', card_issue: '#1565C0',
  };
  const maxCount = Math.max(...txByType.map(([, c]) => c), 1);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#CFFAFE' }}>
          <Icon name="BarChart3" size={22} style={{ color: '#0891B2' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Отчёты и аналитика</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>Сводная статистика операций</p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Всего операций', value: state.transactions.length, icon: 'Activity', color: '#7C3AED' },
          { label: 'Оборот (руб.)', value: totalVolume.toLocaleString('ru-RU') + ' ₽', icon: 'TrendingUp', color: '#21A038' },
          { label: 'Средняя операция', value: avgTx.toLocaleString('ru-RU', { maximumFractionDigits: 0 }) + ' ₽', icon: 'BarChart2', color: '#1565C0' },
          { label: 'Успешность', value: successRate + '%', icon: 'CheckCircle2', color: '#D97706' },
        ].map(k => (
          <div key={k.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: '#6B7280' }}>{k.label}</span>
              <Icon name={k.icon as 'Activity'} size={18} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By type */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Операции по типам</h3>
          {txByType.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Нет данных</p>
          ) : txByType.map(([type, count]) => (
            <div key={type} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm" style={{ color: '#374151' }}>{typeLabels[type] || type}</span>
                <span className="text-sm font-bold" style={{ color: typeColors[type] || '#6B7280' }}>{count}</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: '#F3F4F6' }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%`, background: typeColors[type] || '#6B7280' }} />
              </div>
            </div>
          ))}
        </div>

        {/* By employee */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Активность сотрудников</h3>
          {txByEmployee.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: '#9CA3AF' }}>Нет данных</p>
          ) : txByEmployee.map(e => (
            <div key={e.name} className="flex items-center gap-3 mb-3 p-3 rounded-xl" style={{ background: '#F5F7FA' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white" style={{ background: '#21A038' }}>
                {e.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{e.name}</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>{e.count} оп. • {e.amount.toLocaleString('ru-RU')} ₽</div>
              </div>
              <span className="badge-green">{e.count}</span>
            </div>
          ))}
        </div>

        {/* Clients stats */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Клиентская база</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Всего клиентов', value: state.clients.length, color: '#21A038' },
              { label: 'Всего счетов', value: state.accounts.length, color: '#1565C0' },
              { label: 'Активных карт', value: state.cards.filter(c => c.status === 'active').length, color: '#7C3AED' },
              { label: 'Кредитов', value: state.credits.length, color: '#D97706' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: '#F5F7FA' }}>
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Queue stats */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Очередь</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'В ожидании', value: state.queue.filter(q => q.status === 'waiting').length, color: '#D97706' },
              { label: 'Обслуживается', value: state.queue.filter(q => q.status === 'serving').length, color: '#21A038' },
              { label: 'Обслужено', value: state.queue.filter(q => q.status === 'done').length, color: '#1565C0' },
              { label: 'Отменено', value: state.queue.filter(q => q.status === 'cancelled').length, color: '#DC2626' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: '#F5F7FA' }}>
                <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
