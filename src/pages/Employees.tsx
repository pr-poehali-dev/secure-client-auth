import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import Icon from '@/components/ui/icon';
import type { UserRole } from '../types/bank';

const ROLE_LABELS: Record<UserRole, string> = {
  employee: 'Операционист',
  senior_operator: 'Старший операционист',
  admin: 'Администратор',
  client: 'Клиент',
};

export default function Employees() {
  const { state, addEmployee, updateEmployee } = useBank();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ identifier: '', password: '', name: '', role: 'employee' as UserRole, position: '', branch: '', phone: '', email: '' });
  const [editForm, setEditForm] = useState<Partial<typeof form>>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addEmployee(form);
    toast({ title: '✅ Сотрудник добавлен', description: form.name });
    setShowAdd(false);
    setForm({ identifier: '', password: '', name: '', role: 'employee', position: '', branch: '', phone: '', email: '' });
  };

  const handleEdit = async (e: React.FormEvent, empId: string) => {
    e.preventDefault();
    await updateEmployee(empId, editForm);
    toast({ title: '✅ Данные обновлены' });
    setSelected(null);
  };

  const roleColors: Record<UserRole, string> = {
    admin: 'badge-red', senior_operator: 'badge-yellow', employee: 'badge-green', client: 'badge-blue',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#F3E8FF' }}>
            <Icon name="UserCog" size={22} style={{ color: '#7C3AED' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Сотрудники</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>{state.employees.length} сотрудников</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="sber-btn-primary px-5 py-2.5 flex items-center gap-2">
          <Icon name="UserPlus" size={18} />Добавить сотрудника
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {state.employees.map(emp => (
          <div key={emp.id} className="sber-card p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0" style={{ background: emp.role === 'senior_operator' ? '#D97706' : emp.role === 'admin' ? '#DC2626' : '#21A038' }}>
                {emp.name.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="font-semibold" style={{ color: '#1A1A2E' }}>{emp.name}</div>
                <div className="text-sm" style={{ color: '#6B7280' }}>{emp.position || ROLE_LABELS[emp.role]}</div>
              </div>
              <div className="flex gap-2">
                <span className={roleColors[emp.role]}>{ROLE_LABELS[emp.role]}</span>
                <button onClick={() => { setSelected(selected === emp.id ? null : emp.id); setEditForm({ name: emp.name, position: emp.position, branch: emp.branch, phone: emp.phone, email: emp.email }); }}
                  className="p-1.5 rounded-lg" style={{ background: '#F5F7FA' }}>
                  <Icon name="Pencil" size={14} style={{ color: '#6B7280' }} />
                </button>
              </div>
            </div>

            {selected === emp.id ? (
              <form onSubmit={e => handleEdit(e, emp.id)} className="flex flex-col gap-2 pt-3 border-t" style={{ borderColor: '#E5E7EB' }}>
                {[
                  { key: 'name', label: 'ФИО', placeholder: 'Имя сотрудника' },
                  { key: 'position', label: 'Должность', placeholder: 'Операционист' },
                  { key: 'branch', label: 'Отделение', placeholder: 'Головной офис' },
                  { key: 'phone', label: 'Телефон', placeholder: '+7 (___) ___-__-__' },
                  { key: 'email', label: 'Email', placeholder: 'email@sbol.pro' },
                ].map(f => (
                  <div key={f.key} className="flex items-center gap-2">
                    <label className="text-xs w-20 flex-shrink-0" style={{ color: '#6B7280' }}>{f.label}</label>
                    <input className="input-sber text-sm flex-1" value={(editForm as Record<string, string>)[f.key] || ''} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.placeholder} />
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => setSelected(null)} className="sber-btn-secondary flex-1 py-2 text-sm">Отмена</button>
                  <button type="submit" className="sber-btn-primary flex-1 py-2 text-sm">Сохранить</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  <Icon name="Key" size={12} />
                  <span className="font-mono">{emp.identifier}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  <Icon name="Building2" size={12} />
                  <span>{emp.branch || '—'}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  <Icon name="Phone" size={12} />
                  <span>{emp.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-1" style={{ color: '#9CA3AF' }}>
                  <Icon name="Mail" size={12} />
                  <span className="truncate">{emp.email || '—'}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="animate-scale-in sber-card p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4" style={{ color: '#1A1A2E' }}>Новый сотрудник</h3>
            <form onSubmit={handleAdd} className="flex flex-col gap-3">
              {[
                { key: 'name', label: 'ФИО *', placeholder: 'Иванов Иван Иванович', required: true },
                { key: 'identifier', label: 'Идентификатор *', placeholder: 'user123', required: true },
                { key: 'password', label: 'Пароль *', placeholder: '••••••', required: true },
                { key: 'position', label: 'Должность', placeholder: 'Операционист' },
                { key: 'branch', label: 'Отделение', placeholder: 'Головной офис' },
                { key: 'phone', label: 'Телефон', placeholder: '+7 (___) ___-__-__' },
                { key: 'email', label: 'Email', placeholder: 'email@sbol.pro' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>{f.label}</label>
                  <input className="input-sber" value={(form as Record<string, string>)[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} required={f.required} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Роль</label>
                <select className="input-sber" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as UserRole })}>
                  <option value="employee">Операционист</option>
                  <option value="senior_operator">Старший операционист</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="sber-btn-secondary flex-1 py-2.5">Отмена</button>
                <button type="submit" className="sber-btn-primary flex-1 py-2.5">Добавить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}