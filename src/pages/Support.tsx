import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { Button } from '@/components/ui/button';
import { MessageCircle, HelpCircle, Send, FileQuestion } from 'lucide-react';

export default function Support() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 pt-4 h-full flex flex-col"
    >
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-400 rounded-[2rem] mx-auto flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Чем можем помочь?</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Наша команда поддержки всегда на связи.
        </p>
      </div>

      <div className="grid gap-4">
        <GlassCard className="p-5 flex items-center gap-4 hover:bg-white/80 transition-colors cursor-pointer group">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
            <Send className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">Живой чат</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Связь с оператором</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
          </Button>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 hover:bg-white/80 transition-colors cursor-pointer group">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
            <FileQuestion className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold">FAQ</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Быстрые ответы</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
          </Button>
        </GlassCard>
      </div>

      <div className="mt-auto pt-8">
        <GlassCard className="bg-primary/5 border-primary/10 p-6 text-center">
          <p className="text-sm font-medium mb-3">
            Проблемы с оплатой или бронированием?
          </p>
          <Button className="w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
            Связаться с @MaxAdsSupport
          </Button>
        </GlassCard>
      </div>
    </motion.div>
  );
}
