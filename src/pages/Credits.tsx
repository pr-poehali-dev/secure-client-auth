import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import SmsModal from '../components/SmsModal';
import CreateAccountModal from '../components/CreateAccountModal';
import { generateCreditCheck } from '../utils/documents';
import Icon from '@/components/ui/icon';

export default function Credits() {
  const { state, addCredit, addTransaction } = useBank();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [showCreateAcc, setShowCreateAcc] = useState(false);
  const [form, setForm] = useState({
    passport: '', fullName: '', account: '', amount: '', rate: '12.5', term: '12', type: 'credit' as 'credit' | 'installment',
  });
  const [foundClient, setFoundClient] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [foundAccount, setFoundAccount] = useState<string>('');
  const [accNotFound, setAccNotFound] = useState(false);
  const [pendingCredit, setPendingCredit] = useState<typeof form | null>(null);

  const searchClient = () => {
    const client = state.clients.find(c => c.passport === form.passport);
    if (client) {
      setFoundClient({ id: client.id, name: client.fullName, phone: client.phone });
      setForm(f => ({ ...f, fullName: client.fullName }));
    } else {
      toast({ title: 'Клиент не найден', description: 'Паспорт не найден в базе', variant: 'destructive' });
    }
  };

  const searchAccount = () => {
    const acc = state.accounts.find(a => a.number === form.account.replace(/\s/g, ''));
    if (acc) { setFoundAccount(acc.number); setAccNotFound(false); }
    else { setFoundAccount(''); setAccNotFound(true); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundClient) { toast({ title: 'Найдите клиента по паспорту', variant: 'destructive' }); return; }
    if (!foundAccount) { toast({ title: 'Найдите или создайте счёт', variant: 'destructive' }); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsCode(code);
    setPendingCredit(form);
    setShowSms(true);
  };

  const onSmsConfirm = async () => {
    setShowSms(false);
    if (!pendingCredit || !foundClient || !state.currentUser) return;
    const amt = parseFloat(pendingCredit.amount);
    const rate = parseFloat(pendingCredit.rate);
    const term = parseInt(pendingCredit.term);
    const monthly = Math.round((amt * (rate / 100 / 12)) / (1 - Math.pow(1 + rate / 100 / 12, -term)));
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + term);

    await addCredit({
      clientId: foundClient.id, clientName: foundClient.name,
      accountId: foundAccount,
      amount: amt, rate, term, monthlyPayment: monthly,
      type: pendingCredit.type, status: 'active',
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      remainingAmount: amt,
    });

    await addTransaction({
      type: 'credit_issue', amount: amt, currency: 'RUB',
      toAccount: foundAccount,
      clientId: foundClient.id, clientName: foundClient.name,
      employeeId: state.currentUser.id, employeeName: state.currentUser.name,
      status: 'completed',
      description: pendingCredit.type === 'credit' ? 'Выдача кредита' : 'Выдача рассрочки',
    });

    generateCreditCheck({
      clientName: foundClient.name, passport: pendingCredit.passport,
      account: foundAccount, amount: amt, rate, term, monthlyPayment: monthly,
      type: pendingCredit.type === 'credit' ? 'Кредит' : 'Рассрочка',
      employeeName: state.currentUser.name,
    });

    toast({ title: '✅ Кредит оформлен', description: `${amt.toLocaleString('ru-RU')} ₽ зачислено на счёт` });
    setShowForm(false);
    setForm({ passport: '', fullName: '', account: '', amount: '', rate: '12.5', term: '12', type: 'credit' });
    setFoundClient(null); setFoundAccount('');
  };

  const statusBadge: Record<string, string> = { active: 'badge-green', closed: 'badge-blue', overdue: 'badge-red', pending: 'badge-yellow' };
  const statusLabel: Record<string, string> = { active: 'Активен', closed: 'Закрыт', overdue: 'Просрочен', pending: 'Ожидание' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FEF3C7' }}>
            <Icon name="CreditCard" size={22} style={{ color: '#D97706' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Кредиты и рассрочка</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>{state.credits.length} договоров</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
          <Icon name="Plus" size={18} />Оформить кредит
        </button>
      </div>

      <div className="sber-card overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ background: '#F5F7FA' }}>
            <tr>
              {['Клиент', 'Тип', 'Сумма', 'Ставка', 'Срок', 'Платёж/мес', 'Остаток', 'Дата', 'Статус'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#6B7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.credits.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-12" style={{ color: '#9CA3AF' }}>Кредиты не оформлены</td></tr>
            ) : state.credits.map(c => (
              <tr key={c.id} className="table-row-hover" style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td className="px-4 py-3 font-medium" style={{ color: '#1A1A2E' }}>{c.clientName}</td>
                <td className="px-4 py-3"><span className={c.type === 'credit' ? 'badge-yellow' : 'badge-blue'}>{c.type === 'credit' ? 'Кредит' : 'Рассрочка'}</span></td>
                <td className="px-4 py-3 font-bold" style={{ color: '#D97706' }}>{c.amount.toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3" style={{ color: '#6B7280' }}>{c.rate}%</td>
                <td className="px-4 py-3" style={{ color: '#6B7280' }}>{c.term} мес.</td>
                <td className="px-4 py-3 font-medium" style={{ color: '#1A1A2E' }}>{c.monthlyPayment.toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3 font-medium" style={{ color: '#DC2626' }}>{c.remainingAmount.toLocaleString('ru-RU')} ₽</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{c.startDate}</td>
                <td className="px-4 py-3"><span className={statusBadge[c.status]}>{statusLabel[c.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Оформление кредита / рассрочки</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Тип</label>
                <div className="flex gap-3">
                  {['credit', 'installment'].map(t => (
                    <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t as 'credit' | 'installment' }))}
                      className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                      style={{ background: form.type === t ? '#21A038' : '#F5F7FA', color: form.type === t ? '#fff' : '#374151', border: `1px solid ${form.type === t ? '#21A038' : '#E5E7EB'}` }}>
                      {t === 'credit' ? 'Кредит' : 'Рассрочка'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Паспорт клиента</label>
                <div className="flex gap-2">
                  <input className="input-sber flex-1" value={form.passport} onChange={e => setForm(f => ({ ...f, passport: e.target.value }))} placeholder="4510 123456" />
                  <button type="button" onClick={searchClient} className="sber-btn-primary px-4"><Icon name="Search" size={16} /></button>
                </div>
                {foundClient && <p className="text-xs mt-1" style={{ color: '#21A038' }}>✓ {foundClient.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>ФИО клиента</label>
                <input className="input-sber" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Автозаполнение по паспорту" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Счёт/карта зачисления</label>
                <div className="flex gap-2">
                  <input className="input-sber flex-1" value={form.account} onChange={e => { setForm(f => ({ ...f, account: e.target.value })); setAccNotFound(false); }} placeholder="40817810..." />
                  <button type="button" onClick={searchAccount} className="sber-btn-primary px-4"><Icon name="Search" size={16} /></button>
                </div>
                {foundAccount && <p className="text-xs mt-1" style={{ color: '#21A038' }}>✓ Счёт найден: ...{foundAccount.slice(-6)}</p>}
                {accNotFound && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs" style={{ color: '#DC2626' }}>Счёт не найден</p>
                    <button type="button" onClick={() => setShowCreateAcc(true)} className="text-xs underline" style={{ color: '#21A038' }}>Создать счёт</button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Сумма (₽)</label>
                  <input className="input-sber" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="100000" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Ставка (%)</label>
                  <input className="input-sber" type="number" step="0.1" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Срок (мес)</label>
                  <input className="input-sber" type="number" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} />
                </div>
              </div>
              {form.amount && form.rate && form.term && (
                <div className="p-3 rounded-lg" style={{ background: '#E8F5EC', border: '1px solid #21A038' }}>
                  <p className="text-sm font-medium" style={{ color: '#1C3B2A' }}>
                    Ежемесячный платёж: <strong>
                    {Math.round((parseFloat(form.amount) * (parseFloat(form.rate) / 100 / 12)) / (1 - Math.pow(1 + parseFloat(form.rate) / 100 / 12, -parseInt(form.term)))).toLocaleString('ru-RU')} ₽
                    </strong>
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" className="sber-btn-primary flex-1 py-2.5">Оформить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSms && (
        <SmsModal
          phone={foundClient?.phone || '+7 (***) ***-**-**'}
          sentCode={smsCode}
          onConfirm={onSmsConfirm}
          onCancel={() => setShowSms(false)}
        />
      )}

      {showCreateAcc && foundClient && (
        <CreateAccountModal
          clientId={foundClient.id}
          clientName={foundClient.name}
          onCreated={acc => {
            setFoundAccount(acc.number);
            setForm(f => ({ ...f, account: acc.number }));
            setAccNotFound(false);
            setShowCreateAcc(false);
          }}
          onCancel={() => setShowCreateAcc(false)}
        />
      )}
    </div>
  );
}