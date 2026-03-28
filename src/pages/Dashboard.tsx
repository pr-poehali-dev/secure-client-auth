import { useBank } from '../context/BankContext';
import Icon from '@/components/ui/icon';

export default function Dashboard() {
  const { state, navigate } = useBank();

  const totalBalance = state.accounts.reduce((s, a) => s + a.balance, 0);
  const todayTx = state.transactions.filter(t => t.createdAt.startsWith(new Date().toISOString().slice(0, 10)));
  const activeCredits = state.credits.filter(c => c.status === 'active');
  const waitingQueue = state.queue.filter(q => q.status === 'waiting');

  const quickActions = [
    { id: 'cashout', label: 'Выдача наличных', icon: 'ArrowUpFromLine', color: '#21A038', bg: '#E8F5EC' },
    { id: 'cashin', label: 'Взнос наличных', icon: 'ArrowDownToLine', color: '#1565C0', bg: '#DBEAFE' },
    { id: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight', color: '#7C3AED', bg: '#EDE9FE' },
    { id: 'queue', label: 'Очередь', icon: 'ListOrdered', color: '#D97706', bg: '#FEF3C7' },
    { id: 'clients', label: 'Клиенты', icon: 'Users', color: '#DC2626', bg: '#FEE2E2' },
    { id: 'credits', label: 'Кредиты', icon: 'CreditCard', color: '#0891B2', bg: '#CFFAFE' },
  ];

  const stats = [
    { label: 'Клиентов', value: state.clients.length, icon: 'Users', color: '#21A038', delta: '+2 сегодня' },
    { label: 'Операций сегодня', value: todayTx.length, icon: 'Activity', color: '#1565C0', delta: 'обработано' },
    { label: 'В очереди', value: waitingQueue.length, icon: 'ListOrdered', color: '#D97706', delta: 'ожидают' },
    { label: 'Активных кредитов', value: activeCredits.length, icon: 'CreditCard', color: '#7C3AED', delta: 'действующих' },
  ];

  const recentTx = state.transactions.slice(0, 6);

  const txTypeLabel: Record<string, string> = {
    cashin: 'Взнос наличных', cashout: 'Выдача наличных',
    transfer: 'Перевод', credit_issue: 'Кредит', card_issue: 'Карта', payment: 'Платёж',
  };
  const txStatusBadge: Record<string, string> = {
    completed: 'badge-green', pending: 'badge-yellow', failed: 'badge-red', cancelled: 'badge-red',
  };
  const txStatusLabel: Record<string, string> = {
    completed: 'Выполнено', pending: 'Обработка', failed: 'Ошибка', cancelled: 'Отменено',
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Welcome */}
      <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #21A038 0%, #1C3B2A 100%)', color: '#fff' }}>
        <div>
          <p className="text-sm opacity-70 mb-1">Добро пожаловать,</p>
          <h2 className="text-2xl font-bold mb-1">{state.currentUser?.name}</h2>
          <p className="text-sm opacity-80">{state.currentUser?.position} • {state.currentUser?.branch}</p>
        </div>
        <div className="hidden md:flex flex-col items-end gap-2">
          <div className="text-xs opacity-60">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="text-3xl font-bold">{new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="security-badge" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
            <Icon name="ShieldCheck" size={11} />Сессия защищена
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: '#6B7280' }}>{s.label}</span>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '18' }}>
                <Icon name={s.icon as 'Users'} size={18} style={{ color: s.color }} />
              </div>
            </div>
            <div className="text-3xl font-bold" style={{ color: '#1A1A2E' }}>{s.value}</div>
            <div className="text-xs" style={{ color: s.color }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Быстрые операции</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(a => (
              <button key={a.id} onClick={() => navigate(a.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105"
                style={{ background: a.bg, border: `1px solid ${a.color}22` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: a.color }}>
                  <Icon name={a.icon as 'ArrowUpFromLine'} size={20} className="text-white" />
                </div>
                <span className="text-xs font-medium text-center leading-tight" style={{ color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Total balance */}
        <div className="sber-card p-5">
          <h3 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Общий баланс счетов</h3>
          <div className="text-3xl font-bold mb-1" style={{ color: '#21A038' }}>
            {totalBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽
          </div>
          <div className="text-sm mb-4" style={{ color: '#6B7280' }}>По {state.accounts.length} счетам</div>
          <div className="flex flex-col gap-2">
            {state.accounts.slice(0, 4).map(acc => {
              const client = state.clients.find(c => c.id === acc.clientId);
              return (
                <div key={acc.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: '#F5F7FA' }}>
                  <div>
                    <div className="text-xs font-medium" style={{ color: '#374151' }}>{client?.fullName?.split(' ')[0] || '—'}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>...{acc.number.slice(-4)}</div>
                  </div>
                  <div className="text-sm font-semibold" style={{ color: '#1A1A2E' }}>
                    {acc.balance.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Queue status */}
        <div className="sber-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>Очередь</h3>
            <button onClick={() => navigate('queue')} className="text-xs" style={{ color: '#21A038' }}>Открыть →</button>
          </div>
          {waitingQueue.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#9CA3AF' }}>
              <Icon name="CheckCircle" size={32} className="mx-auto mb-2" style={{ color: '#21A038' }} />
              <p className="text-sm">Очередь пуста</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {waitingQueue.slice(0, 5).map(q => (
                <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: '#F5F7FA' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0" style={{ background: '#21A038' }}>
                    {q.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate" style={{ color: '#374151' }}>{q.clientName || 'Клиент'}</div>
                    <div className="text-xs" style={{ color: '#9CA3AF' }}>{q.operation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="sber-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>Последние операции</h3>
          <button onClick={() => navigate('history')} className="text-xs" style={{ color: '#21A038' }}>Все операции →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Дата', 'Тип', 'Клиент', 'Сумма', 'Сотрудник', 'Статус'].map(h => (
                  <th key={h} className="pb-2 text-left text-xs font-medium" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTx.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-6" style={{ color: '#9CA3AF' }}>Нет операций</td></tr>
              ) : recentTx.map(tx => (
                <tr key={tx.id} className="table-row-hover" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="py-2.5" style={{ color: '#6B7280' }}>{new Date(tx.createdAt).toLocaleDateString('ru-RU')}</td>
                  <td className="py-2.5 font-medium" style={{ color: '#1A1A2E' }}>{txTypeLabel[tx.type] || tx.type}</td>
                  <td className="py-2.5" style={{ color: '#374151' }}>{tx.clientName || '—'}</td>
                  <td className="py-2.5 font-semibold" style={{ color: tx.type === 'cashin' ? '#21A038' : '#DC2626' }}>
                    {tx.type === 'cashin' ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="py-2.5" style={{ color: '#6B7280' }}>{tx.employeeName}</td>
                  <td className="py-2.5">
                    <span className={txStatusBadge[tx.status]}>{txStatusLabel[tx.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
