import { Bot } from '@maxhub/max-bot-api';

const token = process.env.MAX_BOT_TOKEN;
if (!token) {
  throw new Error('MAX_BOT_TOKEN is not set');
}

// На Railway используем внутренний URL сервера или внешний
const API_URL = process.env.INTERNAL_API_URL || process.env.API_URL || 'http://localhost:3001';

const GREETING =
  'Добро пожаловать в MAX_ADS — вашу надежную биржу рекламы в мессенджере MAX! ' +
  'Наш бот создан для того, чтобы упростить процесс размещения и поиска рекламных объявлений.';

const bot = new Bot(token);

function splitName(name) {
  if (!name) return { firstName: undefined, lastName: undefined };
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || undefined,
    lastName: rest.length > 0 ? rest.join(' ') : undefined,
  };
}

async function syncUser(ctx) {
  const u = ctx.user;
  if (!u) return;

  const { firstName, lastName } = splitName(u.name);

  try {
    await fetch(`${API_URL}/api/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: String(u.user_id),
        username: u.username || undefined,
        firstName,
        lastName,
        photoUrl: undefined,
      }),
    });
  } catch {
    // backend недоступен — просто пропускаем, чтобы бот не падал
  }
}

bot.on('bot_started', async (ctx) => {
  await syncUser(ctx);
  await ctx.reply(GREETING);
});

bot.command('start', async (ctx) => {
  await syncUser(ctx);
  await ctx.reply(GREETING);
});

// Обработчик для команд "привет" и "старт" (без слеша)
bot.on('message_created', async (ctx) => {
  const message = ctx.message?.body?.toLowerCase().trim();
  if (message === 'привет' || message === 'старт') {
    await syncUser(ctx);
    await ctx.reply(GREETING);
  }
});

bot.start();

