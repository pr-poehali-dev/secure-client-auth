import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import CreateAccountModal from '../components/CreateAccountModal';
import Icon from '@/components/ui/icon';
import type { Client, Account } from '../types/bank';

export default function Clients() {
  const { state, addClient, updateClient, addAccount } = useBank();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showCreateAcc, setShowCreateAcc] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', passport: '', email: '', address: '', birthDate: '' });
  const [editForm, setEditForm] = useState<Partial<Client>>({});

  const filtered = state.clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.passport.includes(search)
  );

  const clientAccounts = selected ? state.accounts.filter(a => a.clientId === selected.id) : [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addClient(form);
    toast({ title: '✅ Клиент добавлен', description: form.fullName });
    setShowAdd(false);
    setForm({ fullName: '', phone: '', passport: '', email: '', address: '', birthDate: '' });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await updateClient(selected.id, editForm);
    toast({ title: '✅ Данные обновлены' });
    setEditMode(false);
    setSelected({ ...selected, ...editForm });
  };

  const accTypeLabel: Record<Account['type'], string> = { checking: 'Расчётный', savings: 'Сберегательный', credit: 'Кредитный', card: 'Карточный' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
            <Icon name="Users" size={22} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Клиентская база</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>{state.clients.length} клиентов</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
          <Icon name="UserPlus" size={18} />Добавить клиента
        </button>
      </div>

      <div className="sber-card p-4 mb-4">
        <input className="input-sber" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск по ФИО, телефону, паспорту..." />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clients list */}
        <div className="sber-card p-4">
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12" style={{ color: '#9CA3AF' }}>
                <Icon name="UserX" size={32} className="mx-auto mb-2" />
                <p className="text-sm">Клиенты не найдены</p>
              </div>
            ) : filtered.map(c => {
              const accs = state.accounts.filter(a => a.clientId === c.id);
              return (
                <button key={c.id} onClick={() => { setSelected(c); setEditForm(c); setEditMode(false); }}
                  className={`p-4 rounded-xl text-left transition-all ${selected?.id === c.id ? 'ring-2' : ''}`}
                  style={{
                    background: selected?.id === c.id ? '#E8F5EC' : '#F5F7FA',
                    border: `1px solid ${selected?.id === c.id ? '#21A038' : '#E5E7EB'}`,
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0" style={{ background: '#21A038' }}>
                      {c.fullName.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate" style={{ color: '#1A1A2E' }}>{c.fullName}</div>
                      <div className="text-xs" style={{ color: '#6B7280' }}>{c.phone}</div>
                      <div className="text-xs" style={{ color: '#9CA3AF' }}>{accs.length} счёт(ов)</div>
                    </div>
                    <span className={accs.length > 0 ? 'badge-green' : 'badge-red'}>{accs.length > 0 ? 'Активен' : 'Нет счетов'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Client detail */}
        {selected ? (
          <div className="sber-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: '#1A1A2E' }}>{selected.fullName}</h3>
              <div className="flex gap-2">
                <button onClick={() => { setEditMode(!editMode); setEditForm(selected); }} className="sber-btn-secondary px-3 py-1.5 text-sm flex items-center gap-1">
                  <Icon name="Pencil" size={14} />{editMode ? 'Отмена' : 'Редакт.'}
                </button>
                <button onClick={() => setShowAccounts(!showAccounts)} className="sber-btn-primary px-3 py-1.5 text-sm flex items-center gap-1">
                  <Icon name="Wallet" size={14} />Счета
                </button>
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleEdit} className="flex flex-col gap-3">
                {[
                  { key: 'fullName', label: 'ФИО', placeholder: 'Иванов Иван Иванович' },
                  { key: 'phone', label: 'Телефон', placeholder: '+7 (___) ___-__-__' },
                  { key: 'passport', label: 'Паспорт', placeholder: '4510 123456' },
                  { key: 'email', label: 'Email', placeholder: 'email@mail.ru' },
                  { key: 'address', label: 'Адрес', placeholder: 'г. Москва...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>{f.label}</label>
                    <input className="input-sber text-sm" value={(editForm as Record<string, string>)[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.placeholder} />
                  </div>
                ))}
                <button type="submit" className="sber-btn-primary py-2.5 mt-2">Сохранить</button>
              </form>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3 mb-4">
                  {[
                    { label: 'Телефон', value: selected.phone, icon: 'Phone' },
                    { label: 'Паспорт', value: selected.passport, icon: 'IdCard' },
                    { label: 'Email', value: selected.email, icon: 'Mail' },
                    { label: 'Адрес', value: selected.address, icon: 'MapPin' },
                    { label: 'Дата рождения', value: selected.birthDate ? new Date(selected.birthDate).toLocaleDateString('ru-RU') : '—', icon: 'Calendar' },
                    { label: 'Клиент с', value: new Date(selected.createdAt).toLocaleDateString('ru-RU'), icon: 'Clock' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: '#F5F7FA' }}>
                      <Icon name={f.icon as 'Phone'} size={16} style={{ color: '#9CA3AF' }} />
                      <div>
                        <div className="text-xs" style={{ color: '#9CA3AF' }}>{f.label}</div>
                        <div className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{f.value || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {showAccounts && (
                  <div className="border-t pt-4" style={{ borderColor: '#E5E7EB' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm" style={{ color: '#1A1A2E' }}>Счета клиента</h4>
                      <button onClick={() => setShowCreateAcc(true)} className="sber-btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                        <Icon name="Plus" size={12} />Открыть счёт
                      </button>
                    </div>
                    {clientAccounts.length === 0 ? (
                      <div className="text-center py-4" style={{ color: '#9CA3AF' }}>
                        <p className="text-sm">Нет счетов</p>
                        <button onClick={() => setShowCreateAcc(true)} className="sber-btn-primary text-xs px-4 py-2 mt-2">Открыть первый счёт</button>
                      </div>
                    ) : clientAccounts.map(acc => (
                      <div key={acc.id} className="p-3 rounded-xl mb-2 flex items-center justify-between" style={{ background: '#F5F7FA', border: '1px solid #E5E7EB' }}>
                        <div>
                          <div className="text-xs font-medium" style={{ color: '#374151' }}>...{acc.number.slice(-8)}</div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>{accTypeLabel[acc.type]} • {acc.currency}</div>
                        </div>
                        <div className="text-sm font-bold" style={{ color: acc.balance >= 0 ? '#21A038' : '#DC2626' }}>
                          {acc.balance.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="sber-card p-5 flex flex-col items-center justify-center" style={{ minHeight: 300 }}>
            <Icon name="UserCircle" size={48} className="mb-3" style={{ color: '#D1D5DB' }} />
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Выберите клиента для просмотра</p>
          </div>
        )}
      </div>

      {/* Add client modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Новый клиент</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              {[
                { key: 'fullName', label: 'ФИО *', placeholder: 'Иванов Иван Иванович', required: true },
                { key: 'phone', label: 'Телефон *', placeholder: '+7 (___) ___-__-__', required: true },
                { key: 'passport', label: 'Паспорт *', placeholder: '4510 123456', required: true },
                { key: 'email', label: 'Email', placeholder: 'email@mail.ru' },
                { key: 'address', label: 'Адрес', placeholder: 'г. Москва, ул. ...' },
                { key: 'birthDate', label: 'Дата рождения', placeholder: '', type: 'date' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
                  <input
                    className="input-sber"
                    type={f.type || 'text'}
                    value={(form as Record<string, string>)[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" className="sber-btn-primary flex-1 py-2.5">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateAcc && selected && (
        <CreateAccountModal
          clientId={selected.id}
          clientName={selected.fullName}
          onCreated={acc => { setShowCreateAcc(false); void acc; }}
          onCancel={() => setShowCreateAcc(false)}
        />
      )}
    </div>
  );
}