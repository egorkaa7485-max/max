import { Bot } from '@maxhub/max-bot-api';

const token = process.env.MAX_BOT_TOKEN;
if (!token) {
  throw new Error('MAX_BOT_TOKEN is not set');
}

// На Railway используем внутренний URL сервера или внешний
const API_URL = process.env.INTERNAL_API_URL || process.env.API_URL || 'http://localhost:3001';

const GREETING = (firstName) =>
  `Привет${firstName ? ', ' + firstName : ''}! Добро пожаловать в MAX_ADS — вашу надежную биржу рекламы в мессенджере MAX! Наш бот создан для того, чтобы упростить процесс размещения и поиска рекламных объявлений.`;

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
  if (!u) {
    console.log('No user in context', ctx);
    return;
  }

  // Пробуем разные способы получить имя пользователя
  const userName = u.name || u.first_name || u.firstName;
  const { firstName, lastName } = splitName(userName);

  console.log('Syncing user:', {
    user_id: u.user_id,
    username: u.username,
    firstName,
    lastName,
  });

  try {
    await fetch(`${API_URL}/api/me`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telegramId: String(u.user_id),
        username: u.username || undefined,
        firstName,
        lastName,
        photoUrl: u.avatar_url || u.photo_url || undefined,
      }),
    });
  } catch (err) {
    console.error('Failed to sync user:', err);
  }
}

// Обработчик события запуска бота
bot.on('bot_started', async (ctx) => {
  console.log('Bot started event received');
  await syncUser(ctx);
  await ctx.reply(GREETING(ctx.user?.name || ctx.user?.first_name));
});

// Обработчик команды /start
bot.command('start', async (ctx) => {
  console.log('Start command received');
  await syncUser(ctx);
  await ctx.reply(GREETING(ctx.user?.name || ctx.user?.first_name));
});

// Обработчик текстовых сообщений "привет" и "старт"
bot.hears('привет', async (ctx) => {
  console.log('Heard привет');
  await syncUser(ctx);
  await ctx.reply(GREETING(ctx.user?.name || ctx.user?.first_name));
});

bot.hears('старт', async (ctx) => {
  console.log('Heard старт');
  await syncUser(ctx);
  await ctx.reply(GREETING(ctx.user?.name || ctx.user?.first_name));
});

// Обработчик любых текстовых сообщений для отладки
bot.on('message_created', async (ctx) => {
  console.log('Message created:', ctx.message?.body);
});

bot.start();

