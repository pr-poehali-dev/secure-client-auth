import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface SmsModalProps {
  phone: string;
  sentCode: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SmsModal({ phone, sentCode, onConfirm, onCancel }: SmsModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === sentCode || code === '000000') {
      onConfirm();
    } else {
      setError('Неверный код. Попробуйте ещё раз или используйте 000000 для теста.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="animate-scale-in sber-card p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F5EC' }}>
            <Icon name="MessageSquare" size={22} style={{ color: '#21A038' }} />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: '#1A1A2E' }}>Подтверждение SMS</h3>
            <p className="text-xs" style={{ color: '#6B7280' }}>Верификация операции</p>
          </div>
        </div>

        <p className="text-sm mb-1" style={{ color: '#374151' }}>
          SMS-код отправлен на номер:
        </p>
        <p className="font-bold mb-3" style={{ color: '#21A038' }}>{phone}</p>
        <p className="text-xs mb-4 p-2 rounded-lg" style={{ color: '#D97706', background: '#FEF3C7' }}>
          ⚠️ В тестовом режиме используйте код: <strong>000000</strong>
        </p>

        <form onSubmit={handle}>
          <input
            className="input-sber text-center text-2xl tracking-widest font-bold mb-3"
            value={code}
            onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }}
            placeholder="• • • • • •"
            maxLength={6}
            autoFocus
          />
          {error && <p className="text-xs mb-3" style={{ color: '#DC2626' }}>{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
            <button type="submit" className="sber-btn-primary flex-1 py-2.5">Подтвердить</button>
          </div>
        </form>
      </div>
    </div>
  );
}
