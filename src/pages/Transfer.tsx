import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import SmsModal from '../components/SmsModal';
import CreateAccountModal from '../components/CreateAccountModal';
import { generateTransferCheck } from '../utils/documents';
import Icon from '@/components/ui/icon';
import type { Account } from '../types/bank';

export default function Transfer() {
  const { state, addTransaction } = useBank();
  const { toast } = useToast();

  const [fromNum, setFromNum] = useState('');
  const [toNum, setToNum] = useState('');
  const [amount, setAmount] = useState('');
  const [fromAcc, setFromAcc] = useState<Account | null>(null);
  const [toAcc, setToAcc] = useState<Account | null>(null);
  const [fromNotFound, setFromNotFound] = useState(false);
  const [toNotFound, setToNotFound] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState<'from' | 'to' | null>(null);
  const [done, setDone] = useState(false);
  const [pendingData, setPendingData] = useState<{ from: Account; to: Account; amt: number } | null>(null);

  const search = (num: string, which: 'from' | 'to') => {
    const acc = state.accounts.find(a => a.number === num.replace(/\s/g, ''));
    if (which === 'from') {
      if (acc) { setFromAcc(acc); setFromNotFound(false); } else { setFromAcc(null); setFromNotFound(true); }
    } else {
      if (acc) { setToAcc(acc); setToNotFound(false); } else { setToAcc(null); setToNotFound(true); }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAcc || !toAcc) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) { toast({ title: 'Ошибка', description: 'Неверная сумма', variant: 'destructive' }); return; }
    if (amt > fromAcc.balance) { toast({ title: 'Недостаточно средств', variant: 'destructive' }); return; }
    if (fromAcc.number === toAcc.number) { toast({ title: 'Ошибка', description: 'Нельзя переводить на тот же счёт', variant: 'destructive' }); return; }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsCode(code);
    setPendingData({ from: fromAcc, to: toAcc, amt });
    setShowSms(true);
  };

  const onConfirm = () => {
    setShowSms(false);
    if (!pendingData || !state.currentUser) return;
    const clientFrom = state.clients.find(c => c.id === pendingData.from.clientId);
    const tx = addTransaction({
      type: 'transfer',
      amount: pendingData.amt,
      currency: 'RUB',
      fromAccount: pendingData.from.number,
      toAccount: pendingData.to.number,
      clientId: pendingData.from.clientId,
      clientName: clientFrom?.fullName || '—',
      employeeId: state.currentUser.id,
      employeeName: state.currentUser.name,
      status: 'completed',
      description: 'Перевод между счетами',
    });
    setDone(true);
    toast({ title: '✅ Перевод выполнен', description: `${pendingData.amt.toLocaleString('ru-RU')} ₽ переведено` });
    generateTransferCheck({
      fromAccount: pendingData.from.number,
      toAccount: pendingData.to.number,
      amount: pendingData.amt,
      clientName: clientFrom?.fullName || '—',
      employeeName: state.currentUser.name,
    });
    void tx;
  };

  const clientFrom = fromAcc ? state.clients.find(c => c.id === fromAcc.clientId) : null;
  const clientTo = toAcc ? state.clients.find(c => c.id === toAcc.clientId) : null;

  const reset = () => { setFromNum(''); setToNum(''); setAmount(''); setFromAcc(null); setToAcc(null); setFromNotFound(false); setToNotFound(false); setDone(false); setPendingData(null); };

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#EDE9FE' }}>
          <Icon name="ArrowLeftRight" size={22} style={{ color: '#7C3AED' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Перевод со счёта на счёт</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>Внутрибанковский перевод</p>
        </div>
      </div>

      {done ? (
        <div className="sber-card p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#EDE9FE' }}>
            <Icon name="CheckCircle2" size={32} style={{ color: '#7C3AED' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Перевод выполнен</h3>
          <p className="text-2xl font-bold mb-6" style={{ color: '#7C3AED' }}>{pendingData?.amt.toLocaleString('ru-RU')} ₽</p>
          <p className="text-sm mb-2" style={{ color: '#6B7280' }}>Чек перевода загружен автоматически</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={reset} className="sber-btn-primary px-6 py-2.5">Новый перевод</button>
          </div>
        </div>
      ) : (
        <div className="sber-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* From account */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Счёт списания</label>
              <div className="flex gap-2">
                <input className="input-sber flex-1" value={fromNum} onChange={e => { setFromNum(e.target.value); setFromAcc(null); setFromNotFound(false); }} placeholder="40817810..." />
                <button type="button" onClick={() => search(fromNum, 'from')} className="sber-btn-primary px-4 py-2.5"><Icon name="Search" size={16} /></button>
              </div>
              {fromNotFound && (
                <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: '#FEE2E2' }}>
                  <Icon name="AlertCircle" size={14} style={{ color: '#DC2626' }} />
                  <span className="text-xs" style={{ color: '#DC2626' }}>Счёт не найден</span>
                  <button type="button" onClick={() => setShowCreateAccount('from')} className="text-xs underline ml-auto" style={{ color: '#21A038' }}>Создать</button>
                </div>
              )}
              {fromAcc && (
                <div className="mt-2 p-3 rounded-lg" style={{ background: '#F5F7FA' }}>
                  <span className="text-xs font-medium" style={{ color: '#374151' }}>{clientFrom?.fullName} • ...{fromAcc.number.slice(-6)} • </span>
                  <span className="text-xs font-bold" style={{ color: '#21A038' }}>{fromAcc.balance.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#EDE9FE' }}>
                <Icon name="ArrowDown" size={16} style={{ color: '#7C3AED' }} />
              </div>
              <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            </div>

            {/* To account */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Счёт зачисления</label>
              <div className="flex gap-2">
                <input className="input-sber flex-1" value={toNum} onChange={e => { setToNum(e.target.value); setToAcc(null); setToNotFound(false); }} placeholder="40817810..." />
                <button type="button" onClick={() => search(toNum, 'to')} className="sber-btn-primary px-4 py-2.5"><Icon name="Search" size={16} /></button>
              </div>
              {toNotFound && (
                <div className="mt-2 p-2 rounded-lg flex items-center gap-2" style={{ background: '#FEE2E2' }}>
                  <Icon name="AlertCircle" size={14} style={{ color: '#DC2626' }} />
                  <span className="text-xs" style={{ color: '#DC2626' }}>Счёт не найден</span>
                  <button type="button" onClick={() => setShowCreateAccount('to')} className="text-xs underline ml-auto" style={{ color: '#21A038' }}>Создать</button>
                </div>
              )}
              {toAcc && (
                <div className="mt-2 p-3 rounded-lg" style={{ background: '#F5F7FA' }}>
                  <span className="text-xs font-medium" style={{ color: '#374151' }}>{clientTo?.fullName} • ...{toAcc.number.slice(-6)} • </span>
                  <span className="text-xs font-bold" style={{ color: '#1565C0' }}>{toAcc.balance.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Сумма перевода (₽)</label>
              <input className="input-sber" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="1" />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <Icon name="Shield" size={16} style={{ color: '#D97706' }} />
              <span className="text-xs" style={{ color: '#92400E' }}>Требуется подтверждение по SMS и будет выдан чек</span>
            </div>

            <button type="submit" disabled={!fromAcc || !toAcc || !amount} className="sber-btn-primary py-3 flex items-center justify-center gap-2" style={{ background: '#7C3AED' }}>
              <Icon name="ArrowLeftRight" size={18} />Выполнить перевод
            </button>
          </form>
        </div>
      )}

      {showSms && (
        <SmsModal
          phone={clientFrom?.phone || '+7 (***) ***-**-**'}
          sentCode={smsCode}
          onConfirm={onConfirm}
          onCancel={() => setShowSms(false)}
        />
      )}

      {showCreateAccount && (
        <CreateAccountModal
          clientId={state.clients[0]?.id || ''}
          clientName="Новый клиент"
          onCreated={acc => {
            if (showCreateAccount === 'from') { setFromAcc(acc); setFromNum(acc.number); }
            else { setToAcc(acc); setToNum(acc.number); }
            setShowCreateAccount(null);
          }}
          onCancel={() => setShowCreateAccount(null)}
        />
      )}
    </div>
  );
}
