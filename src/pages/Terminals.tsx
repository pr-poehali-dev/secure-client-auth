import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import Icon from '@/components/ui/icon';

export default function Terminals() {
  const { state, addTerminal, updateTerminal } = useBank();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', ipAddress: '', port: '8080', type: 'Платёжный', branch: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTerminal({ ...form, port: parseInt(form.port), status: 'offline', lastPing: new Date().toISOString() });
    toast({ title: '✅ Терминал добавлен', description: `${form.name} (${form.ipAddress})` });
    setShowAdd(false);
    setForm({ name: '', ipAddress: '', port: '8080', type: 'Платёжный', branch: '' });
  };

  const ping = (id: string, ip: string) => {
    toast({ title: '🔄 Пинг отправлен', description: `Проверяю ${ip}...` });
    setTimeout(async () => {
      const ok = Math.random() > 0.3;
      await updateTerminal(id, { status: ok ? 'online' : 'error', lastPing: new Date().toISOString() });
      toast({ title: ok ? '✅ Терминал доступен' : '❌ Терминал недоступен', description: ip });
    }, 1500);
  };

  const statusBadge: Record<string, string> = { online: 'badge-green', offline: 'badge-red', error: 'badge-yellow' };
  const statusLabel: Record<string, string> = { online: 'Онлайн', offline: 'Офлайн', error: 'Ошибка' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
            <Icon name="Monitor" size={22} style={{ color: '#1565C0' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Терминалы Сбер</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>Подключение по IP-адресу</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
          <Icon name="Plus" size={18} />Добавить терминал
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.terminals.map(t => (
          <div key={t.id} className="sber-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.status === 'online' ? '#E8F5EC' : '#F5F7FA' }}>
                  <Icon name="Monitor" size={20} style={{ color: t.status === 'online' ? '#21A038' : '#9CA3AF' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: '#6B7280' }}>{t.branch}</div>
                </div>
              </div>
              <span className={statusBadge[t.status]}>{statusLabel[t.status]}</span>
            </div>
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#F5F7FA' }}>
                <Icon name="Wifi" size={14} style={{ color: '#9CA3AF' }} />
                <span className="font-mono text-xs font-medium" style={{ color: '#1A1A2E' }}>{t.ipAddress}:{t.port}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#F5F7FA' }}>
                <Icon name="Tag" size={14} style={{ color: '#9CA3AF' }} />
                <span className="text-xs" style={{ color: '#6B7280' }}>{t.type}</span>
              </div>
              <div className="text-xs" style={{ color: '#9CA3AF' }}>
                Последний пинг: {new Date(t.lastPing).toLocaleTimeString('ru-RU')}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => ping(t.id, t.ipAddress)} className="sber-btn-secondary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                <Icon name="Activity" size={14} />Пинг
              </button>
              <button onClick={async () => await updateTerminal(t.id, { status: t.status === 'online' ? 'offline' : 'online' })}
                className="px-3 py-2 rounded-lg text-xs"
                style={{ background: t.status === 'online' ? '#FEE2E2' : '#E8F5EC', color: t.status === 'online' ? '#DC2626' : '#21A038' }}>
                {t.status === 'online' ? 'Откл.' : 'Вкл.'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Подключить терминал Сбер</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              {[
                { key: 'name', label: 'Название', placeholder: 'Терминал Сбер #4' },
                { key: 'ipAddress', label: 'IP-адрес', placeholder: '192.168.1.104' },
                { key: 'port', label: 'Порт', placeholder: '8080' },
                { key: 'type', label: 'Тип', placeholder: 'Платёжный' },
                { key: 'branch', label: 'Отделение', placeholder: 'Головной офис' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>{f.label}</label>
                  <input className="input-sber" value={(form as Record<string, string>)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required />
                </div>
              ))}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAdd(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" className="sber-btn-primary flex-1 py-2.5">Подключить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}