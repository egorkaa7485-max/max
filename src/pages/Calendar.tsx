import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { useBookings } from '@/hooks/use-bookings';
import { format, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { CalendarDays, Clock, CheckCircle2, Clock3 } from 'lucide-react';

export default function CalendarView() {
  const { data: bookings, isLoading } = useBookings();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const dayBookings =
    bookings?.filter((b) => selectedDate && isSameDay(new Date(b.date), selectedDate)) || [];

  const bookedDates = bookings?.map((b) => new Date(b.date)) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pt-4"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Календарь</h1>
        <p className="text-sm text-muted-foreground">Управление расписанием рекламы</p>
      </div>

      <GlassCard className="p-4 flex justify-center overflow-hidden">
        <CalendarUI
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          modifiers={{ booked: bookedDates }}
          modifiersStyles={{
            booked: { fontWeight: 'bold', textDecoration: 'underline', color: 'hsl(var(--primary))' },
          }}
          className="rounded-2xl"
          locale={ru}
        />
      </GlassCard>

      <div>
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Расписание на{' '}
          {selectedDate ? format(selectedDate, 'd MMM yyyy', { locale: ru }) : '...'}
        </h3>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : dayBookings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm bg-white/30 dark:bg-white/5 rounded-2xl border border-dashed">
              Нет бронирований на эту дату.
            </div>
          ) : (
            dayBookings.map((booking) => (
              <GlassCard key={booking.id} className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {booking.status === 'confirmed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock3 className="w-4 h-4 text-amber-500" />
                      )}
                      <span className="text-sm font-medium capitalize text-muted-foreground">
                        {booking.status === 'confirmed' ? 'Подтверждено' : 'Ожидание'}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg">
                      {(booking.amount / 100).toFixed(2)} ₽
                    </h4>
                  </div>
                  <div className="bg-primary/10 text-primary p-2 rounded-xl text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(booking.date), 'HH:mm')}
                  </div>
                </div>
                {booking.content && (
                  <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl text-sm border">
                    <p className="line-clamp-2 text-foreground/80">{booking.content}</p>
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
