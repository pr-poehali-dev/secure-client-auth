import { useState } from 'react';
import { useBank } from '../context/BankContext';
import Icon from '@/components/ui/icon';

const TX_TYPES: Record<string, string> = {
  cashin: 'Взнос наличных', cashout: 'Выдача наличных',
  transfer: 'Перевод', credit_issue: 'Кредит', card_issue: 'Карта', payment: 'Платёж',
};
const STATUS_BADGE: Record<string, string> = { completed: 'badge-green', pending: 'badge-yellow', failed: 'badge-red', cancelled: 'badge-red' };
const STATUS_LABEL: Record<string, string> = { completed: 'Выполнено', pending: 'Обработка', failed: 'Ошибка', cancelled: 'Отменено' };

export default function History() {
  const { state } = useBank();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = state.transactions.filter(t => {
    const matchSearch = !search || t.clientName?.toLowerCase().includes(search.toLowerCase()) || t.employeeName.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchFrom = !dateFrom || t.createdAt >= dateFrom;
    const matchTo = !dateTo || t.createdAt <= dateTo + 'T23:59:59';
    return matchSearch && matchType && matchStatus && matchFrom && matchTo;
  });

  const totalIn = filtered.filter(t => t.type === 'cashin').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === 'cashout').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
          <Icon name="History" size={22} style={{ color: '#7C3AED' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>История операций</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>{state.transactions.length} всего операций</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="stat-card text-center">
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>Показано операций</div>
          <div className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{filtered.length}</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>Взносы</div>
          <div className="text-2xl font-bold" style={{ color: '#21A038' }}>+{totalIn.toLocaleString('ru-RU')} ₽</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-xs mb-1" style={{ color: '#6B7280' }}>Выдачи</div>
          <div className="text-2xl font-bold" style={{ color: '#DC2626' }}>-{totalOut.toLocaleString('ru-RU')} ₽</div>
        </div>
      </div>

      {/* Filters */}
      <div className="sber-card p-4 mb-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <input className="input-sber text-sm col-span-2 lg:col-span-1" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." />
          <select className="input-sber text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">Все типы</option>
            {Object.entries(TX_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input-sber text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Все статусы</option>
            <option value="completed">Выполнено</option>
            <option value="pending">Обработка</option>
            <option value="failed">Ошибка</option>
          </select>
          <input className="input-sber text-sm" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input className="input-sber text-sm" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="sber-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#F5F7FA' }}>
              <tr>
                {['ID', 'Дата/Время', 'Тип', 'Клиент', 'Счёт', 'Сумма', 'Сотрудник', 'ОКУД', 'Статус'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12" style={{ color: '#9CA3AF' }}>Операции не найдены</td></tr>
              ) : filtered.map(tx => (
                <tr key={tx.id} className="table-row-hover" style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>{tx.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>
                    <div>{new Date(tx.createdAt).toLocaleDateString('ru-RU')}</div>
                    <div>{new Date(tx.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: '#1A1A2E' }}>{TX_TYPES[tx.type] || tx.type}</td>
                  <td className="px-4 py-3" style={{ color: '#374151' }}>{tx.clientName || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>
                    {tx.fromAccount ? `...${tx.fromAccount.slice(-6)}` : tx.toAccount ? `...${tx.toAccount.slice(-6)}` : '—'}
                  </td>
                  <td className="px-4 py-3 font-bold" style={{ color: tx.type === 'cashin' ? '#21A038' : '#DC2626' }}>
                    {tx.type === 'cashin' ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{tx.employeeName}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>{tx.okudCode || '—'}</td>
                  <td className="px-4 py-3"><span className={STATUS_BADGE[tx.status]}>{STATUS_LABEL[tx.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
