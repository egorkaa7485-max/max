import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { useChannels } from '@/hooks/use-channels';
import { useBookings } from '@/hooks/use-bookings';
import { useAuth } from '@/hooks/use-auth';
import { Hash, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function Admin() {
  const { data: channels } = useChannels();
  const { data: bookings } = useBookings();
  const { data: user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pt-4"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Админ-панель</h1>
          <p className="text-sm text-muted-foreground">Управление платформой</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Hash className="w-5 h-5" />
            <span className="text-sm">Каналы</span>
          </div>
          <p className="text-2xl font-bold">{channels?.length ?? 0}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Бронирования</span>
          </div>
          <p className="text-2xl font-bold">{bookings?.length ?? 0}</p>
        </GlassCard>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Все каналы</h3>
        <div className="space-y-2">
          {channels?.map((ch) => (
            <GlassCard key={ch.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{ch.name}</p>
                <p className="text-sm text-muted-foreground">{ch.link}</p>
              </div>
              <div className="text-right">
                <p className="text-primary font-semibold">{(ch.pricePerPost / 100).toFixed(0)} ₽</p>
                <p className="text-xs text-muted-foreground">{ch.subscribers.toLocaleString()} подп.</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-lg mb-3">Бронирования</h3>
        <div className="space-y-2">
          {bookings?.length === 0 ? (
            <GlassCard className="p-6 text-center text-muted-foreground text-sm">Нет бронирований</GlassCard>
          ) : (
            bookings?.map((b) => (
              <GlassCard key={b.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{(b.amount / 100).toFixed(2)} ₽</p>
                    <p className="text-xs text-muted-foreground capitalize">{b.status}</p>
                    {b.content && <p className="text-sm mt-1 line-clamp-1">{b.content}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(b.date), 'd MMM, HH:mm', { locale: ru })}
                  </p>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <GlassCard className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">Вы вошли как админ · {user?.username ? `@${user.username}` : user?.firstName}</p>
      </GlassCard>
    </motion.div>
  );
}
