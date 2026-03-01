import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { useChannels } from '@/hooks/use-channels';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useMemo, useState } from 'react';
import { Hash, Shield, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ADMIN_LOGIN = 'admin';
const ADMIN_PASSWORD = '123456';
const ADMIN_SESSION_KEY = 'max_ads_admin_session';

export default function Admin() {
  const { data: channels } = useChannels();
  const { data: user } = useAuth();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsAuthenticated(window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'ok');
  }, []);

  const uniqueUserIds = useMemo(() => {
    const ids = new Set<string>();
    channels?.forEach((channel) => ids.add(channel.ownerId));
    if (user?.telegramId) {
      ids.add(user.telegramId);
    }
    return Array.from(ids);
  }, [channels, user?.telegramId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(ADMIN_SESSION_KEY, 'ok');
      }
      setIsAuthenticated(true);
      setError('');
      return;
    }
    setError('Неверный логин или пароль');
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
    setIsAuthenticated(false);
    setLogin('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pt-8"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Вход в админ-панель</h1>
            <p className="text-sm text-muted-foreground">Отдельная защищенная страница администратора</p>
          </div>
        </div>

        <GlassCard className="p-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Введите логин"
                className="rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="rounded-xl h-12"
              />
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
            <Button type="submit" className="w-full h-12 rounded-xl font-bold">
              Войти
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-4"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
            <p className="text-sm text-muted-foreground">Управление платформой</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleLogout} className="rounded-xl">
          Выйти
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-5 h-5" />
            <span className="text-sm">Пользователи</span>
          </div>
          <p className="text-2xl font-bold">{uniqueUserIds.length}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Hash className="w-5 h-5" />
            <span className="text-sm">Каналы</span>
          </div>
          <p className="text-2xl font-bold">{channels?.length ?? 0}</p>
        </GlassCard>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Все пользователи</h3>
        <div className="space-y-2">
          {uniqueUserIds.length === 0 ? (
            <GlassCard className="p-6 text-center text-muted-foreground text-sm">Пользователи не найдены</GlassCard>
          ) : (
            uniqueUserIds.map((id) => (
              <GlassCard key={id} className="p-4 flex items-center justify-between">
                <p className="font-medium">ID: {id}</p>
                <span className="text-xs text-muted-foreground">Пользователь</span>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Все каналы</h3>
        <div className="space-y-2">
          {channels?.length === 0 ? (
            <GlassCard className="p-6 text-center text-muted-foreground text-sm">Каналы не найдены</GlassCard>
          ) : (
            channels?.map((ch) => (
              <GlassCard key={ch.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ch.name}</p>
                  <p className="text-sm text-muted-foreground">{ch.link}</p>
                  <p className="text-xs text-muted-foreground mt-1">Владелец: {ch.ownerId}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary font-semibold">{(ch.pricePerPost / 100).toFixed(0)} ₽</p>
                  <p className="text-xs text-muted-foreground">{ch.subscribers.toLocaleString()} подп.</p>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <GlassCard className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">
          Вошли как админ · {user?.username ? `@${user.username}` : user?.firstName || 'Пользователь'}
        </p>
      </GlassCard>
    </motion.div>
  );
}
