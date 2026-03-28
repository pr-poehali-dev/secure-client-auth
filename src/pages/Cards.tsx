import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import SmsModal from '../components/SmsModal';
import Icon from '@/components/ui/icon';

export default function Cards() {
  const { state, addCard, addTransaction } = useBank();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [form, setForm] = useState({ passport: '', fullName: '', phone: '', cardNumber: '', expiry: '', type: 'debit' as 'debit' | 'credit', accountId: '' });
  const [foundClient, setFoundClient] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [pendingCard, setPendingCard] = useState<typeof form | null>(null);

  const searchClient = () => {
    const c = state.clients.find(cl => cl.passport === form.passport);
    if (c) {
      setFoundClient({ id: c.id, name: c.fullName, phone: c.phone });
      setForm(f => ({ ...f, fullName: c.fullName, phone: c.phone }));
    } else {
      toast({ title: 'Клиент не найден', variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundClient) { toast({ title: 'Найдите клиента по паспорту', variant: 'destructive' }); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsCode(code);
    setPendingCard(form);
    setShowSms(true);
  };

  const onConfirm = () => {
    setShowSms(false);
    if (!pendingCard || !foundClient || !state.currentUser) return;
    const acc = state.accounts.find(a => a.clientId === foundClient.id);
    addCard({
      clientId: foundClient.id,
      accountId: acc?.id || '',
      cardNumber: pendingCard.cardNumber || `4276 **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      cardHolder: pendingCard.fullName.toUpperCase().split(' ').slice(0, 2).join(' '),
      expiry: pendingCard.expiry || `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() % 100 + 4}`,
      type: pendingCard.type,
      status: 'active',
    });
    addTransaction({
      type: 'card_issue', amount: 0, currency: 'RUB',
      clientId: foundClient.id, clientName: foundClient.name,
      employeeId: state.currentUser.id, employeeName: state.currentUser.name,
      status: 'completed', description: `Выпуск ${pendingCard.type === 'debit' ? 'дебетовой' : 'кредитной'} карты`,
    });
    toast({ title: '✅ Карта выпущена', description: foundClient.name });
    setShowForm(false);
    setFoundClient(null);
    setForm({ passport: '', fullName: '', phone: '', cardNumber: '', expiry: '', type: 'debit', accountId: '' });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <Icon name="Wallet" size={22} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Банковские карты</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>{state.cards.length} карт выпущено</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
          <Icon name="Plus" size={18} />Выпустить карту
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.cards.map(card => {
          const client = state.clients.find(c => c.id === card.clientId);
          return (
            <div key={card.id} className="rounded-2xl p-5 text-white" style={{ background: card.type === 'debit' ? 'linear-gradient(135deg, #1C3B2A 0%, #21A038 100%)' : 'linear-gradient(135deg, #1E3A8A 0%, #1565C0 100%)' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-xs opacity-60">АС ЕФС СБОЛ.про</div>
                  <div className="text-xs font-medium">{card.type === 'debit' ? 'Дебетовая' : 'Кредитная'}</div>
                </div>
                <Icon name="Wifi" size={24} className="opacity-60" />
              </div>
              <div className="font-mono text-lg tracking-widest mb-4">{card.cardNumber}</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-60">ДЕРЖАТЕЛЬ</div>
                  <div className="text-sm font-medium">{card.cardHolder}</div>
                  {client && <div className="text-xs opacity-60">{client.phone}</div>}
                </div>
                <div>
                  <div className="text-xs opacity-60">ДО</div>
                  <div className="text-sm font-medium">{card.expiry}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={card.status === 'active' ? 'badge-green' : 'badge-red'} style={{ fontSize: 11 }}>{card.status === 'active' ? 'Активна' : 'Заблокирована'}</span>
              </div>
            </div>
          );
        })}
        {state.cards.length === 0 && (
          <div className="col-span-3 text-center py-12" style={{ color: '#9CA3AF' }}>
            <Icon name="CreditCard" size={48} className="mx-auto mb-2" />
            <p>Нет карт</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Выпуск банковской карты</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Паспорт клиента</label>
                <div className="flex gap-2">
                  <input className="input-sber flex-1" value={form.passport} onChange={e => setForm(f => ({ ...f, passport: e.target.value }))} placeholder="4510 123456" />
                  <button type="button" onClick={searchClient} className="sber-btn-primary px-4"><Icon name="Search" size={16} /></button>
                </div>
                {foundClient && <p className="text-xs mt-1" style={{ color: '#21A038' }}>✓ {foundClient.name}</p>}
              </div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>ФИО</label><input className="input-sber" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Автозаполнение по паспорту" required /></div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Телефон</label><input className="input-sber" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (___) ___-__-__" /></div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Номер карты (опционально)</label><input className="input-sber" value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: e.target.value }))} placeholder="4276 **** **** (генерируется авто)" /></div>
              <div><label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Срок действия (мм/гг)</label><input className="input-sber" value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: e.target.value }))} placeholder="12/28" /></div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Тип карты</label>
                <div className="flex gap-3">
                  {['debit', 'credit'].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t as 'debit' | 'credit' }))}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                      style={{ background: form.type === t ? '#21A038' : '#F5F7FA', color: form.type === t ? '#fff' : '#374151', border: `1px solid ${form.type === t ? '#21A038' : '#E5E7EB'}` }}>
                      {t === 'debit' ? 'Дебетовая' : 'Кредитная'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" className="sber-btn-primary flex-1 py-2.5">Выпустить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSms && (
        <SmsModal
          phone={foundClient?.phone || '+7 (***) ***-**-**'}
          sentCode={smsCode}
          onConfirm={onConfirm}
          onCancel={() => setShowSms(false)}
        />
      )}
    </div>
  );
}
