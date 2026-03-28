import { useBank } from '../context/BankContext';
import Icon from '@/components/ui/icon';

const ROLE_LABELS: Record<string, string> = {
  employee: 'Операционист',
  senior_operator: 'Старший операционист',
  admin: 'Администратор',
  client: 'Клиент',
};

export default function Profile() {
  const { state, logout } = useBank();
  const emp = state.currentUser;
  if (!emp) return null;

  const myTx = state.transactions.filter(t => t.employeeId === emp.id);
  const totalVol = myTx.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#E8F5EC' }}>
          <Icon name="UserCircle" size={22} style={{ color: '#21A038' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Личный кабинет</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>Профиль сотрудника</p>
        </div>
      </div>

      <div className="sber-card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl text-white" style={{ background: 'linear-gradient(135deg, #21A038, #1C3B2A)' }}>
            {emp.name.slice(0, 1)}
          </div>
          <div>
            <h3 className="text-2xl font-bold" style={{ color: '#1A1A2E' }}>{emp.name}</h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>{emp.position || ROLE_LABELS[emp.role]}</p>
            <span className="badge-green mt-1 inline-block">{ROLE_LABELS[emp.role]}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: 'Key', label: 'Идентификатор', value: emp.identifier },
            { icon: 'Building2', label: 'Отделение', value: emp.branch || 'Не указано' },
            { icon: 'Phone', label: 'Телефон', value: emp.phone || 'Не указан' },
            { icon: 'Mail', label: 'Email', value: emp.email || 'Не указан' },
            { icon: 'Calendar', label: 'Дата добавления', value: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('ru-RU') : '—' },
          ].map(f => (
            <div key={f.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#F5F7FA' }}>
              <Icon name={f.icon as 'Key'} size={18} style={{ color: '#21A038' }} />
              <div>
                <div className="text-xs" style={{ color: '#9CA3AF' }}>{f.label}</div>
                <div className="text-sm font-medium" style={{ color: '#1A1A2E' }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sber-card p-6 mb-4">
        <h4 className="font-semibold mb-4" style={{ color: '#1A1A2E' }}>Моя статистика</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-xl" style={{ background: '#E8F5EC' }}>
            <div className="text-2xl font-bold" style={{ color: '#21A038' }}>{myTx.length}</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>Операций</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: '#DBEAFE' }}>
            <div className="text-xl font-bold" style={{ color: '#1565C0' }}>{totalVol.toLocaleString('ru-RU')}</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>Оборот ₽</div>
          </div>
          <div className="text-center p-3 rounded-xl" style={{ background: '#F3E8FF' }}>
            <div className="text-2xl font-bold" style={{ color: '#7C3AED' }}>{myTx.filter(t => t.status === 'completed').length}</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>Выполнено</div>
          </div>
        </div>
      </div>

      <div className="sber-card p-4">
        <div className="flex items-center gap-2 mb-3 p-3 rounded-lg" style={{ background: '#E8F5EC' }}>
          <Icon name="ShieldCheck" size={18} style={{ color: '#21A038' }} />
          <div>
            <div className="text-sm font-medium" style={{ color: '#1C3B2A' }}>Сессия защищена</div>
            <div className="text-xs" style={{ color: '#6B7280' }}>2FA активна • PCI DSS • SSL/TLS</div>
          </div>
        </div>
        <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FCA5A5' }}>
          <Icon name="LogOut" size={18} />Выйти из системы
        </button>
      </div>
    </div>
  );
}
