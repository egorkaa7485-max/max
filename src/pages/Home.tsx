import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useMyChannels, useCreateChannel } from '@/hooks/use-channels';
import { GlassCard } from '@/components/glass-card';
import { Link } from 'wouter';
import { Wallet, TrendingUp, Calendar, ChevronRight, Plus } from 'lucide-react';
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

export default function Home() {
  const { data: user } = useAuth();
  const { data: myChannels, isLoading } = useMyChannels();
  const nickname = user?.username ? `@${user.username}` : user?.firstName || 'Пользователь';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <header className="py-6 pt-10 flex items-center gap-4">
        <div className="flex-shrink-0">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt=""
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
              {(user?.username?.[0] || user?.firstName?.[0] || '?').toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{nickname}</h1>
          <p className="text-sm text-muted-foreground">Мои каналы и баланс</p>
        </div>
      </header>

      <GlassCard className="flex items-center justify-between overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Баланс</p>
          <h2 className="text-3xl font-bold tracking-tight">
            {((user?.balance || 0) / 100).toFixed(2)} ₽
          </h2>
        </div>
        <div className="h-14 w-14 rounded-2xl bg-white/80 dark:bg-white/10 flex items-center justify-center shadow-sm">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
      </GlassCard>

      <div className="pt-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-semibold text-lg">Мои каналы</h3>
          <AddChannelModal />
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 animate-spin border-2 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : myChannels?.length === 0 ? (
            <GlassCard className="text-center py-8 border border-dashed">
              <p className="text-muted-foreground text-sm mb-4">Нет добавленных каналов</p>
              <AddChannelModal />
            </GlassCard>
          ) : (
            myChannels?.map((ch) => (
              <GlassCard key={ch.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{ch.name}</p>
                  <p className="text-sm text-muted-foreground">{ch.link}</p>
                  <p className="text-xs text-primary font-medium mt-1">
                    {(ch.pricePerPost / 100).toFixed(0)} ₽ · {ch.subscribers.toLocaleString()} подп.
                  </p>
                </div>
                <Link href="/">
                  <span className="text-sm text-primary font-medium">На биржу →</span>
                </Link>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/" className="block">
          <GlassCard className="p-5 flex flex-col items-start gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-95 cursor-pointer">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Биржа</h3>
              <p className="text-xs text-muted-foreground mt-1">Покупка и продажа рекламы</p>
            </div>
          </GlassCard>
        </Link>

        <Link href="/calendar" className="block">
          <GlassCard className="p-5 flex flex-col items-start gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all active:scale-95 cursor-pointer">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Календарь</h3>
              <p className="text-xs text-muted-foreground mt-1">Управление датами</p>
            </div>
          </GlassCard>
        </Link>
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-center mb-4 px-2">
          <h3 className="font-semibold text-lg">Недавняя активность</h3>
          <Link href="/calendar" className="text-sm text-primary font-medium flex items-center">
            Все <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <GlassCard className="p-0 overflow-hidden divide-y divide-border/50">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">T</div>
              <div>
                <p className="font-medium text-sm">Реклама опубликована</p>
                <p className="text-xs text-muted-foreground">Tech News Daily</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-500">+25.00 ₽</span>
          </div>
          <div className="p-5 flex items-center justify-between opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">C</div>
              <div>
                <p className="font-medium text-sm">Реклама забронирована</p>
                <p className="text-xs text-muted-foreground">Crypto Insights</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-foreground">-40.00 ₽</span>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}

function AddChannelModal() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateChannel();
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerPost, setPricePerPost] = useState(2500);
  const [subscribers, setSubscribers] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkVal = link.startsWith('@') ? link : `@${link}`;
    mutate(
      {
        name: name || linkVal,
        link: linkVal,
        description,
        pricePerPost,
        subscribers,
        isActive: true,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
          setLink('');
          setDescription('');
          setPricePerPost(2500);
          setSubscribers(0);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" /> Добавить канал
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2rem] p-6 glass">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Добавить канал</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ссылка (@channel)</label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="rounded-xl h-12"
              placeholder="@mychannel"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl h-12"
              placeholder="Опционально"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Цена (коп.)</label>
              <Input type="number" value={pricePerPost} onChange={(e) => setPricePerPost(Number(e.target.value))} className="rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Подписчики</label>
              <Input type="number" value={subscribers} onChange={(e) => setSubscribers(Number(e.target.value))} className="rounded-xl h-12" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Описание</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-xl resize-none" rows={2} placeholder="Опционально" />
          </div>
          <Button type="submit" disabled={isPending || !link} className="w-full h-12 rounded-xl font-bold">
            {isPending ? 'Добавление...' : 'Добавить'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
