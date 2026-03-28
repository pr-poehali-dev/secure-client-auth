import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import SmsModal from '../components/SmsModal';
import CreateAccountModal from '../components/CreateAccountModal';
import { generateOKUD0402008 } from '../utils/documents';
import Icon from '@/components/ui/icon';
import type { Account } from '../types/bank';

export default function Cashin() {
  const { state, addTransaction } = useBank();
  const { toast } = useToast();

  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [foundAccount, setFoundAccount] = useState<Account | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showSms, setShowSms] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCountModal, setShowCountModal] = useState(false);
  const [pendingTx, setPendingTx] = useState<{ account: Account; amt: number } | null>(null);
  const [done, setDone] = useState(false);
  const [lastTxId, setLastTxId] = useState('');

  const searchAccount = () => {
    const acc = state.accounts.find(a => a.number === accountNumber.replace(/\s/g, ''));
    if (acc) { setFoundAccount(acc); setNotFound(false); }
    else { setFoundAccount(null); setNotFound(true); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundAccount) return;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: 'Ошибка', description: 'Введите корректную сумму', variant: 'destructive' });
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsCode(code);
    setPendingTx({ account: foundAccount, amt });
    setShowSms(true);
  };

  const onSmsConfirm = () => { setShowSms(false); setShowCountModal(true); };

  const onCountConfirm = () => {
    if (!pendingTx || !state.currentUser) return;
    setShowCountModal(false);
    const client = state.clients.find(c => c.id === pendingTx.account.clientId);
    const tx = addTransaction({
      type: 'cashin',
      amount: pendingTx.amt,
      currency: pendingTx.account.currency,
      toAccount: pendingTx.account.number,
      clientId: pendingTx.account.clientId,
      clientName: client?.fullName || '—',
      employeeId: state.currentUser.id,
      employeeName: state.currentUser.name,
      status: 'completed',
      description: 'Взнос наличных',
      okudCode: '0402008',
    });
    setLastTxId(tx.id);
    setDone(true);
    toast({ title: '✅ Взнос принят', description: `${pendingTx.amt.toLocaleString('ru-RU')} ₽ зачислено на счёт` });
    generateOKUD0402008({
      ...tx,
      clientName: client?.fullName || '—',
      clientPassport: client?.passport,
      accountNumber: pendingTx.account.number,
      cashierName: state.currentUser.name,
    });
  };

  const reset = () => {
    setAccountNumber(''); setAmount(''); setFoundAccount(null);
    setNotFound(false); setDone(false); setPendingTx(null); setLastTxId('');
  };

  const clientOfAccount = foundAccount ? state.clients.find(c => c.id === foundAccount.clientId) : null;

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
          <Icon name="ArrowDownToLine" size={22} style={{ color: '#1565C0' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Взнос наличных</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>ОКУД 0402008 — Приходный кассовый ордер</p>
        </div>
      </div>

      {done ? (
        <div className="sber-card p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DBEAFE' }}>
            <Icon name="CheckCircle2" size={32} style={{ color: '#1565C0' }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: '#1A1A2E' }}>Взнос принят</h3>
          <p className="mb-2" style={{ color: '#6B7280' }}>Средства зачислены на счёт</p>
          <p className="text-sm font-bold mb-6" style={{ color: '#1565C0' }}>+{pendingTx?.amt.toLocaleString('ru-RU')} ₽</p>
          <p className="text-xs mb-6" style={{ color: '#9CA3AF' }}>Документ ОКУД 0402008 загружен автоматически</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => {
              const tx = state.transactions.find(t => t.id === lastTxId);
              const client = state.clients.find(c => c.id === pendingTx?.account.clientId);
              if (tx) generateOKUD0402008({ ...tx, clientName: client?.fullName || '—', clientPassport: client?.passport, accountNumber: pendingTx?.account.number || '', cashierName: state.currentUser?.name || '' });
            }} className="sber-btn-secondary px-6 py-2.5 flex items-center gap-2">
              <Icon name="Download" size={16} />Скачать ОКУД 0402008
            </button>
            <button onClick={reset} className="sber-btn-primary px-6 py-2.5">Новая операция</button>
          </div>
        </div>
      ) : (
        <div className="sber-card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Номер счёта клиента</label>
              <div className="flex gap-2">
                <input className="input-sber flex-1" value={accountNumber}
                  onChange={e => { setAccountNumber(e.target.value); setFoundAccount(null); setNotFound(false); }}
                  placeholder="40817810000000000000" />
                <button type="button" onClick={searchAccount} className="sber-btn-primary px-4 py-2.5 flex items-center gap-2">
                  <Icon name="Search" size={16} />Найти
                </button>
              </div>
            </div>

            {notFound && (
              <div className="p-3 rounded-lg flex items-start gap-3" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
                <Icon name="AlertCircle" size={18} style={{ color: '#DC2626' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#DC2626' }}>Счёт не найден</p>
                  <p className="text-xs mb-2" style={{ color: '#991B1B' }}>Счёт с таким номером не существует в системе</p>
                  <button type="button" onClick={() => setShowCreateAccount(true)} className="sber-btn-primary text-xs px-3 py-1.5">Открыть новый счёт</button>
                </div>
              </div>
            )}

            {foundAccount && (
              <div className="p-4 rounded-xl" style={{ background: '#DBEAFE', border: '1px solid #1565C0' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="CheckCircle" size={18} style={{ color: '#1565C0' }} />
                  <span className="font-semibold text-sm" style={{ color: '#1E3A8A' }}>Счёт найден</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span style={{ color: '#6B7280' }}>Клиент: </span><span className="font-medium">{clientOfAccount?.fullName}</span></div>
                  <div><span style={{ color: '#6B7280' }}>Баланс: </span><span className="font-bold" style={{ color: '#1565C0' }}>{foundAccount.balance.toLocaleString('ru-RU')} ₽</span></div>
                  <div><span style={{ color: '#6B7280' }}>Счёт: </span><span className="font-medium">...{foundAccount.number.slice(-8)}</span></div>
                  <div><span style={{ color: '#6B7280' }}>Тип: </span><span className="font-medium">{foundAccount.type === 'checking' ? 'Расчётный' : foundAccount.type}</span></div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Сумма взноса (₽)</label>
              <input className="input-sber" type="number" value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00" min="1" step="0.01" />
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <Icon name="Shield" size={16} style={{ color: '#D97706' }} />
              <span className="text-xs" style={{ color: '#92400E' }}>Операция требует подтверждения по SMS</span>
            </div>

            <button type="submit" disabled={!foundAccount || !amount} className="sber-btn-primary py-3 flex items-center justify-center gap-2" style={{ background: '#1565C0' }}>
              <Icon name="ArrowDownToLine" size={18} />Принять взнос
            </button>
          </form>
        </div>
      )}

      {showSms && (
        <SmsModal
          phone={clientOfAccount?.phone || '+7 (***) ***-**-**'}
          sentCode={smsCode}
          onConfirm={onSmsConfirm}
          onCancel={() => setShowSms(false)}
        />
      )}

      {showCountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-8 max-w-sm mx-4 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#DBEAFE' }}>
              <Icon name="Banknote" size={32} style={{ color: '#1565C0' }} />
            </div>
            <h3 className="text-lg font-bold mb-3" style={{ color: '#1A1A2E' }}>Пересчитайте деньги и положите в кассу</h3>
            <p className="text-2xl font-bold mb-6" style={{ color: '#1565C0' }}>{pendingTx?.amt.toLocaleString('ru-RU')} ₽</p>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Убедитесь, что сумма верна, и разместите наличные в кассовом лотке</p>
            <button onClick={onCountConfirm} className="sber-btn-primary w-full py-3">Деньги в кассе ✓</button>
          </div>
        </div>
      )}

      {showCreateAccount && (
        <CreateAccountModal
          clientId={state.clients[0]?.id || ''}
          clientName="Новый клиент"
          onCreated={acc => { setShowCreateAccount(false); setFoundAccount(acc); setAccountNumber(acc.number); }}
          onCancel={() => setShowCreateAccount(false)}
        />
      )}
    </div>
  );
}
