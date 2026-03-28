import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import { generateQueueTicket } from '../utils/documents';
import Icon from '@/components/ui/icon';
import type { QueueTicket } from '../types/bank';

const OPERATIONS = [
  { id: 'cashout', label: 'Выдача наличных', icon: 'ArrowUpFromLine', color: '#21A038' },
  { id: 'cashin', label: 'Взнос наличных', icon: 'ArrowDownToLine', color: '#1565C0' },
  { id: 'transfer', label: 'Перевод', icon: 'ArrowLeftRight', color: '#7C3AED' },
  { id: 'credits', label: 'Кредит/рассрочка', icon: 'CreditCard', color: '#D97706' },
  { id: 'cards', label: 'Выпуск карты', icon: 'Wallet', color: '#DC2626' },
  { id: 'other', label: 'Другое', icon: 'MoreHorizontal', color: '#6B7280' },
];

function genTicketNumber() {
  const letters = 'АБВГДЕ';
  return letters[Math.floor(Math.random() * letters.length)] + Math.floor(1 + Math.random() * 99).toString().padStart(3, '0');
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  return Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function Queue() {
  const { state, addQueueTicket, updateQueueTicket, navigate } = useBank();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedOp, setSelectedOp] = useState('');
  const [currentTicket, setCurrentTicket] = useState<QueueTicket | null>(null);
  const [showOpChoice, setShowOpChoice] = useState(false);

  const waiting = state.queue.filter(q => q.status === 'waiting');
  const serving = state.queue.filter(q => q.status === 'serving');
  const done = state.queue.filter(q => q.status === 'done').slice(0, 10);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const op = OPERATIONS.find(o => o.id === selectedOp);
    if (!op) return;
    const number = genTicketNumber();
    const code = genCode();
    const ticket = addQueueTicket({
      number, code,
      clientName: clientName || undefined,
      clientPhone: clientPhone || undefined,
      operation: op.label,
      operationType: selectedOp,
      status: 'waiting',
    });
    generateQueueTicket({ number, code, operation: op.label, clientName: clientName || undefined, date: ticket.createdAt });
    toast({ title: '🎫 Талон выдан', description: `Номер: ${number} • Код: ${code}` });
    setShowAdd(false); setClientName(''); setClientPhone(''); setSelectedOp('');
  };

  const takeNext = () => {
    if (waiting.length === 0) { toast({ title: 'Очередь пуста', description: 'Нет клиентов в ожидании' }); return; }
    const next = waiting[0];
    updateQueueTicket(next.id, { status: 'serving' });
    setCurrentTicket({ ...next, status: 'serving' });
    setShowOpChoice(true);
  };

  const completeTicket = (ticket: QueueTicket) => {
    updateQueueTicket(ticket.id, { status: 'done', servedAt: new Date().toISOString() });
    setCurrentTicket(null);
    setShowOpChoice(false);
    toast({ title: '✅ Клиент обслужен', description: `Талон ${ticket.number} закрыт` });
  };

  const cancelTicket = (ticket: QueueTicket) => {
    updateQueueTicket(ticket.id, { status: 'cancelled' });
    setCurrentTicket(null);
    setShowOpChoice(false);
  };

  const goToOperation = (opId: string) => {
    setShowOpChoice(false);
    navigate(opId);
  };

  const opColors: Record<string, string> = { cashout: '#21A038', cashin: '#1565C0', transfer: '#7C3AED', credits: '#D97706', cards: '#DC2626', other: '#6B7280' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FEF3C7' }}>
            <Icon name="ListOrdered" size={22} style={{ color: '#D97706' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Электронная очередь</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>В ожидании: {waiting.length} • Обслуживается: {serving.length}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={takeNext} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
            <Icon name="UserCheck" size={18} />Взять следующего
          </button>
          <button onClick={() => setShowAdd(true)} className="sber-btn-secondary px-5 py-2.5 flex items-center gap-2">
            <Icon name="Plus" size={18} />Добавить в очередь
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waiting */}
        <div className="sber-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>Ожидание</h3>
            <span className="badge-yellow">{waiting.length}</span>
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {waiting.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>Очередь пуста</div>
            ) : waiting.map(q => (
              <div key={q.id} className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#F5F7FA', border: '1px solid #E5E7EB' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: opColors[q.operationType] || '#6B7280' }}>
                  {q.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#1A1A2E' }}>{q.clientName || 'Клиент'}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{q.operation}</div>
                  <div className="text-xs" style={{ color: '#9CA3AF' }}>{new Date(q.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <button onClick={() => cancelTicket(q)} style={{ color: '#DC2626' }}>
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Serving */}
        <div className="sber-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>Обслуживается</h3>
            <span className="badge-green">{serving.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {serving.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>Нет активных</div>
            ) : serving.map(q => (
              <div key={q.id} className="p-4 rounded-xl" style={{ background: '#E8F5EC', border: '2px solid #21A038' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl text-white" style={{ background: '#21A038' }}>
                    {q.number}
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: '#1C3B2A' }}>{q.clientName || 'Клиент'}</div>
                    <div className="text-sm" style={{ color: '#21A038' }}>{q.operation}</div>
                    {q.clientPhone && <div className="text-xs" style={{ color: '#6B7280' }}>{q.clientPhone}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => completeTicket(q)} className="sber-btn-primary flex-1 py-2 text-sm">Завершить ✓</button>
                  <button onClick={() => cancelTicket(q)} className="px-3 py-2 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>Отменить</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Done */}
        <div className="sber-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold" style={{ color: '#1A1A2E' }}>Обслужены (сегодня)</h3>
            <span className="badge-blue">{done.length}</span>
          </div>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {done.length === 0 ? (
              <div className="text-center py-8 text-sm" style={{ color: '#9CA3AF' }}>Нет</div>
            ) : done.map(q => (
              <div key={q.id} className="p-2 rounded-lg flex items-center gap-2" style={{ background: '#F5F7FA' }}>
                <span className="font-bold text-xs" style={{ color: '#6B7280' }}>{q.number}</span>
                <span className="text-xs flex-1 truncate" style={{ color: '#9CA3AF' }}>{q.operation}</span>
                <Icon name="CheckCircle2" size={14} style={{ color: '#21A038' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add to queue modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Добавить в очередь</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Имя клиента (необязательно)</label>
                <input className="input-sber" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="ФИО клиента" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Телефон (необязательно)</label>
                <input className="input-sber" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>Вид операции *</label>
                <div className="grid grid-cols-2 gap-2">
                  {OPERATIONS.map(op => (
                    <button key={op.id} type="button" onClick={() => setSelectedOp(op.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: selectedOp === op.id ? op.color + '18' : '#F5F7FA',
                        border: `1.5px solid ${selectedOp === op.id ? op.color : '#E5E7EB'}`,
                      }}>
                      <Icon name={op.icon as 'ArrowUpFromLine'} size={16} style={{ color: op.color, marginBottom: 4 }} />
                      <div className="text-xs font-medium" style={{ color: selectedOp === op.id ? op.color : '#374151' }}>{op.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg text-xs" style={{ background: '#F0FBF3', border: '1px solid #21A038', color: '#1C3B2A' }}>
                🎫 Талон с номером и QR-кодом будет автоматически скачан
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" disabled={!selectedOp} className="sber-btn-primary flex-1 py-2.5">Выдать талон</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Operation choice modal */}
      {showOpChoice && currentTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl text-white" style={{ background: opColors[currentTicket.operationType] || '#6B7280' }}>
                {currentTicket.number}
              </div>
              <div>
                <div className="font-bold" style={{ color: '#1A1A2E' }}>{currentTicket.clientName || 'Клиент'}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>Запрошено: {currentTicket.operation}</div>
              </div>
            </div>
            <p className="text-sm mb-4 font-medium" style={{ color: '#374151' }}>Выберите операцию для клиента:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {OPERATIONS.filter(o => o.id !== 'other').map(op => (
                <button key={op.id} onClick={() => goToOperation(op.id)}
                  className="p-3 rounded-xl flex items-center gap-2 transition-all hover:scale-105"
                  style={{ background: op.color + '12', border: `1px solid ${op.color}30` }}>
                  <Icon name={op.icon as 'ArrowUpFromLine'} size={16} style={{ color: op.color }} />
                  <span className="text-xs font-medium" style={{ color: op.color }}>{op.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => completeTicket(currentTicket)} className="sber-btn-primary flex-1 py-2.5 text-sm">Завершить без операции</button>
              <button onClick={() => cancelTicket(currentTicket)} className="px-4 py-2.5 rounded-lg text-sm" style={{ background: '#FEE2E2', color: '#DC2626' }}>Отменить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
