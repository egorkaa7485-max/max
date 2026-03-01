import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { MessageCircleQuestion, Bot, LifeBuoy } from 'lucide-react';

export default function Support() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-2xl">
          <MessageCircleQuestion className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Поддержка</h1>
          <p className="text-sm text-muted-foreground">Помощь по работе с биржей</p>
        </div>
      </div>

      <GlassCard className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Bot className="w-5 h-5" />
          <p className="font-semibold">Чат-бот</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Для быстрых ответов используйте бота: <span className="font-medium text-foreground">@max_ads_support_bot</span>
        </p>
      </GlassCard>

      <GlassCard className="p-5 space-y-2">
        <div className="flex items-center gap-2 text-amber-500">
          <LifeBuoy className="w-5 h-5" />
          <p className="font-semibold">Команда поддержки</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Если вопрос не решается ботом, напишите менеджеру: <span className="font-medium text-foreground">@max_ads_help</span>
        </p>
      </GlassCard>
    </motion.div>
  );
}
