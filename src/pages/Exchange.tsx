import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { useChannels } from '@/hooks/use-channels';
import { useCreateBooking } from '@/hooks/use-bookings';
import { Users, Search, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

export default function Exchange() {
  const { data: channels, isLoading } = useChannels();
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState<'advertiser' | 'blogger'>('advertiser');

  const filteredChannels = channels?.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.link.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6 pt-4"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Биржа</h1>
      </div>

      <div className="flex items-center gap-2 bg-muted/40 rounded-2xl p-1">
        <button
          type="button"
          onClick={() => setMode('advertiser')}
          className={`flex-1 text-sm py-2 rounded-xl transition-all ${
            mode === 'advertiser'
              ? 'bg-background shadow-sm font-semibold'
              : 'text-muted-foreground hover:bg-background/60'
          }`}
        >
          Для рекламодателей
        </button>
        <button
          type="button"
          onClick={() => setMode('blogger')}
          className={`flex-1 text-sm py-2 rounded-xl transition-all ${
            mode === 'blogger'
              ? 'bg-background shadow-sm font-semibold'
              : 'text-muted-foreground hover:bg-background/60'
          }`}
        >
          Для блогеров
        </button>
      </div>

      {mode === 'advertiser' ? (
        <>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Поиск каналов..."
              className="pl-11 h-12 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/20 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 animate-spin border-4 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : filteredChannels?.length === 0 ? (
              <GlassCard className="text-center py-10">
                <p className="text-muted-foreground">Каналы не найдены</p>
              </GlassCard>
            ) : (
              filteredChannels?.map((channel) => (
                <motion.div key={channel.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <GlassCard className="p-0 overflow-hidden cursor-pointer group">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{channel.name}</h3>
                          <p className="text-sm text-primary font-medium">{channel.link}</p>
                        </div>
                        <div className="bg-primary/10 text-primary px-3 py-1 rounded-xl text-sm font-semibold">
                          {(channel.pricePerPost / 100).toFixed(2)} ₽
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {channel.description || 'Описание не указано.'}
                      </p>
                      <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="flex items-center gap-1.5 text-foreground/80">
                          <Users className="w-4 h-4" />
                          {channel.subscribers.toLocaleString()} подп.
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-3 border-t flex justify-end">
                      <BuyAdModal channel={channel} />
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">Запрос на рекламу: FinTech стартап</p>
              <span className="text-xs text-muted-foreground">Бюджет: 5 000 ₽</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Ищем Telegram-каналы про бизнес, инвестиции и финансы от 3 000 подписчиков.
            </p>
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">CPM до 300 ₽ · срок публикации 24 часа</p>
              <Button size="sm" className="rounded-xl text-xs font-semibold">
                Подать заявку
              </Button>
            </div>
          </GlassCard>
          <GlassCard className="p-4 text-sm text-muted-foreground">
            Скоро здесь появятся реальные запросы рекламодателей, на которые вы сможете откликаться как блогер.
          </GlassCard>
        </div>
      )}
    </motion.div>
  );
}

function BuyAdModal({ channel }: { channel: { id: number; pricePerPost: number } }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { mutate, isPending } = useCreateBooking();
  const [content, setContent] = useState('');

  const handleBuy = () => {
    if (!date) return;
    mutate(
      {
        channelId: channel.id,
        date: date.toISOString(),
        amount: channel.pricePerPost,
        content,
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl font-bold">
          Купить рекламу
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6 glass border-white/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500 w-6 h-6" /> Безопасная бронь
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Итого</p>
            <h3 className="text-3xl font-black text-primary">
              {(channel.pricePerPost / 100).toFixed(2)} ₽
            </h3>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              Средства будут заморожены до подтверждения публикации
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Выберите дату</label>
            <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-2 border inline-block w-full">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl w-full flex justify-center" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Текст рекламы</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Введите текст поста..."
              className="rounded-xl resize-none h-24"
            />
          </div>

          <Button
            onClick={handleBuy}
            disabled={!date || !content || isPending}
            className="w-full h-12 rounded-xl text-lg font-bold mt-2 shadow-lg shadow-primary/20"
          >
            {isPending ? 'Обработка...' : 'Заморозить средства и забронировать'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
