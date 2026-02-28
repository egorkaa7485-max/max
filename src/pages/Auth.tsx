import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Page } from '../App';

interface Props {
  onNavigate: (p: Page) => void;
}

export default function Auth({ onNavigate }: Props) {
  const [step, setStep] = useState<'welcome' | 'channels' | 'prices'>('welcome');

  return (
    <div className="px-4 pt-6 pb-8">
      <motion.button
        onClick={() => onNavigate('home')}
        className="text-slate-400 text-sm mb-6"
      >
        ← Назад
      </motion.button>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-white mb-2"
      >
        Вход и регистрация
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-slate-400 text-sm mb-8"
      >
        Автоматический вход по данным Telegram. Добавьте каналы и установите цены.
      </motion.p>

      {step === 'welcome' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <p className="text-slate-300 text-sm mb-4">
            Регистрация происходит автоматически: мы получаем ваши данные и каналы из Telegram.
          </p>
          <motion.button
            onClick={() => setStep('channels')}
            className="w-full py-3 rounded-xl glass-button text-white font-medium"
          >
            Продолжить
          </motion.button>
        </motion.div>
      )}

      {step === 'channels' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <input
              type="text"
              placeholder="Ссылка на канал (@channel)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-max-blue"
            />
            <motion.button
              className="mt-3 w-full py-2 rounded-xl bg-white/10 text-slate-300 text-sm"
              whileTap={{ scale: 0.98 }}
            >
              + Добавить канал
            </motion.button>
          </div>
          <motion.button
            onClick={() => setStep('prices')}
            className="w-full py-3 rounded-xl glass-button text-white font-medium"
          >
            Далее: установить цены
          </motion.button>
        </motion.div>
      )}

      {step === 'prices' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <label className="text-slate-400 text-sm block mb-2">Цена за пост (₽)</label>
            <input
              type="number"
              placeholder="500"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-max-blue"
            />
          </div>
          <div className="glass-card rounded-2xl p-4 border border-white/5">
            <label className="text-slate-400 text-sm block mb-2">Комиссия биржи (%)</label>
            <p className="text-slate-300 text-sm">10% — стандартная ставка</p>
          </div>
          <motion.button
            onClick={() => onNavigate('exchange')}
            className="w-full py-3 rounded-xl glass-button text-white font-medium"
          >
            Готово, на биржу
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
