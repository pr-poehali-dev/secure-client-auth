import { useState } from 'react';
import { useBank } from '../context/BankContext';
import { useToast } from '../hooks/use-toast';
import Icon from '@/components/ui/icon';

export default function LoginPage() {
  const { login } = useBank();
  const { toast } = useToast();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsStep, setSmsStep] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [sentCode, setSentCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const ok = login(identifier, password);
    if (!ok) {
      toast({ title: 'Ошибка входа', description: 'Неверный идентификатор или пароль', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    console.log('[2FA SMS] Код:', code);
    setSmsStep(true);
    toast({ title: '🔐 SMS отправлен', description: 'Введите 6-значный код подтверждения (см. консоль в dev-режиме)' });
    setLoading(false);
  };

  const handleSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode === sentCode || smsCode === '000000') {
      toast({ title: '✅ Вход выполнен', description: 'Добро пожаловать в АС ЕФС СБОЛ.про' });
      login(identifier, password);
    } else {
      toast({ title: 'Неверный код', description: 'Проверьте SMS и введите код повторно', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0F2318 0%, #1C3B2A 50%, #21A038 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Icon name="Building2" size={22} />
            </div>
            <span className="text-xl font-bold tracking-wide">АС ЕФС СБОЛ.про</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Банковская операционная система</p>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Безопасность и<br/>инновации<br/>в каждой операции
          </h1>
          <div className="flex flex-col gap-4">
            {[
              { icon: 'ShieldCheck', text: 'Двухфакторная аутентификация' },
              { icon: 'Lock', text: 'Шифрование данных PCI DSS' },
              { icon: 'Activity', text: 'Мониторинг операций в реальном времени' },
              { icon: 'Users', text: 'Управление клиентской базой' },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(33,160,56,0.3)' }}>
                  <Icon name={f.icon as 'ShieldCheck'} size={16} />
                </div>
                <span className="text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="security-badge" style={{ width: 'fit-content' }}>
          <Icon name="Shield" size={12} />
          Соответствие PCI DSS v4.0
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-in">
          <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 20, padding: '40px', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#21A038' }}>
                <Icon name="Building2" size={24} className="text-white" />
              </div>
              <div>
                <div className="font-bold text-lg" style={{ color: '#1A1A2E' }}>АС ЕФС СБОЛ.про</div>
                <div className="text-xs" style={{ color: '#6B7280' }}>Версия 2.4.1 • Защищено</div>
              </div>
            </div>

            {!smsStep ? (
              <>
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#1A1A2E' }}>Вход в систему</h2>
                <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Введите учётные данные сотрудника</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Идентификатор</label>
                    <div className="relative">
                      <input
                        className="input-sber pl-10"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        placeholder="Введите идентификатор"
                        required
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                        <Icon name="User" size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>Пароль</label>
                    <div className="relative">
                      <input
                        className="input-sber pl-10 pr-10"
                        type={showPass ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Введите пароль"
                        required
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }}>
                        <Icon name="Lock" size={16} />
                      </div>
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} onClick={() => setShowPass(!showPass)}>
                        <Icon name={showPass ? 'EyeOff' : 'Eye'} size={16} />
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="sber-btn-primary py-3 mt-2 flex items-center justify-center gap-2">
                    {loading ? <><Icon name="Loader2" size={18} className="animate-spin" /> Проверка...</> : <><Icon name="LogIn" size={18} /> Войти в систему</>}
                  </button>
                </form>

                <div className="mt-6 p-3 rounded-lg flex items-center gap-2" style={{ background: '#F0FBF3', border: '1px solid #21A038' }}>
                  <Icon name="Info" size={14} style={{ color: '#21A038' }} />
                  <span className="text-xs" style={{ color: '#1C3B2A' }}>После входа потребуется подтверждение по SMS</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F5EC' }}>
                    <Icon name="MessageSquare" size={22} style={{ color: '#21A038' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#1A1A2E' }}>Подтверждение SMS</h2>
                    <p className="text-sm" style={{ color: '#6B7280' }}>Двухфакторная аутентификация</p>
                  </div>
                </div>

                <p className="text-sm mb-4" style={{ color: '#374151' }}>
                  Код отправлен. В dev-режиме код отображается в консоли браузера.<br/>
                  <span style={{ color: '#6B7280', fontSize: 12 }}>Для тестирования введите: <strong>000000</strong></span>
                </p>

                <form onSubmit={handleSms} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: '#374151' }}>SMS-код (6 цифр)</label>
                    <input
                      className="input-sber text-center text-2xl tracking-widest font-bold"
                      value={smsCode}
                      onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="• • • • • •"
                      maxLength={6}
                      required
                    />
                  </div>
                  <button type="submit" className="sber-btn-primary py-3 flex items-center justify-center gap-2">
                    <Icon name="ShieldCheck" size={18} />Подтвердить и войти
                  </button>
                  <button type="button" className="text-sm" style={{ color: '#6B7280' }} onClick={() => setSmsStep(false)}>
                    ← Вернуться к входу
                  </button>
                </form>
              </>
            )}

            <div className="mt-6 pt-4 border-t flex items-center justify-center gap-4" style={{ borderColor: '#E5E7EB' }}>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>🔒 Защищено SSL</span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>🛡 PCI DSS</span>
              <span className="text-xs" style={{ color: '#9CA3AF' }}>✅ 2FA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
