import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/glass-card';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const MOCK_CHATS = [
  { id: 1, name: 'Поддержка Max Ads', preview: 'Здравствуйте! Чем могу помочь?', time: '12:30', unread: 1 },
];

export default function Messages() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const chat = selectedId ? MOCK_CHATS.find((c) => c.id === selectedId) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-[calc(100vh-8rem)] pt-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-sky-100 dark:bg-sky-900/30 text-sky-600 rounded-2xl">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сообщения</h1>
          <p className="text-sm text-muted-foreground">Чаты и переписка</p>
        </div>
      </div>

      {!chat ? (
        <div className="flex-1 space-y-2 overflow-y-auto">
          {MOCK_CHATS.map((c) => (
            <GlassCard
              key={c.id}
              className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => setSelectedId(c.id)}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold truncate">{c.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{c.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{c.preview}</p>
              </div>
              {c.unread > 0 && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" title="Непрочитанное" />
              )}
            </GlassCard>
          ))}
        </div>
      ) : (
        <>
          <GlassCard className="mb-3 px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setSelectedId(null)}>
            <span className="text-sm text-muted-foreground">← Назад</span>
            <p className="font-semibold">{chat.name}</p>
          </GlassCard>
          <GlassCard className="flex-1 flex flex-col p-4 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
                  <p className="text-sm">{chat.preview}</p>
                  <p className="text-xs text-muted-foreground mt-1">12:30</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Написать сообщение..."
                className="min-h-[44px] max-h-24 resize-none rounded-xl"
                rows={1}
              />
              <Button size="icon" className="rounded-xl shrink-0 h-11 w-11" disabled={!message.trim()}>
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </GlassCard>
        </>
      )}
    </motion.div>
  );
}
