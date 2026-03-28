import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import Icon from '@/components/ui/icon';
import type { Account } from '../types/bank';

interface Props {
  clientId: string;
  clientName: string;
  onCreated: (acc: Account) => void;
  onCancel: () => void;
}

export default function CreateAccountModal({ clientId, clientName, onCreated, onCancel }: Props) {
  const { addAccount } = useBank();
  const { toast } = useToast();
  const [type, setType] = useState<Account['type']>('checking');
  const [currency, setCurrency] = useState('RUB');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    const number = '40817810' + Math.floor(10000000000000 + Math.random() * 89999999999999).toString().slice(0, 12);
    const acc = addAccount({ clientId, number, type, currency, balance: 0, isActive: true });
    toast({ title: '✅ Счёт открыт', description: `Счёт ${number.slice(-6)} создан для ${clientName}` });
    onCreated(acc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#E8F5EC' }}>
            <Icon name="PlusCircle" size={20} style={{ color: '#21A038' }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: '#1A1A2E' }}>Открытие счёта</h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>{clientName}</p>
          </div>
        </div>

        <form onSubmit={handle} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Тип счёта</label>
            <select className="input-sber" value={type} onChange={e => setType(e.target.value as Account['type'])}>
              <option value="checking">Расчётный</option>
              <option value="savings">Сберегательный</option>
              <option value="credit">Кредитный</option>
              <option value="card">Карточный</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Валюта</label>
            <select className="input-sber" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="RUB">RUB — Российский рубль</option>
              <option value="USD">USD — Доллар США</option>
              <option value="EUR">EUR — Евро</option>
            </select>
          </div>
          <div className="p-3 rounded-lg" style={{ background: '#F0FBF3', border: '1px solid #21A038' }}>
            <p className="text-xs" style={{ color: '#1C3B2A' }}>
              Номер счёта будет сгенерирован автоматически в соответствии с форматом ЦБ РФ
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
            <button type="submit" className="sber-btn-primary flex-1 py-2.5">Открыть счёт</button>
          </div>
        </form>
      </div>
    </div>
  );
}
