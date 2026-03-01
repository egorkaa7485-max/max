# Max Ads — MAX Mini App

Минималистичный сайт-бот для биржи рекламы в MAX, вдохновлённый дизайном Apple и ВКонтакте. Liquid Glass, плавные анимации, адаптивный дизайн.

## Запуск

```bash
npm install
npm run dev
```

Перед запуском создайте `.env` в корне проекта:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
MAX_BOT_TOKEN=ваш_токен_бота
```

`npm run dev` запускает и клиент (`Vite`), и backend API (`Express + Postgres`).

## MAX интеграция пользователя

- Вебхук для событий MAX: `POST /api/max/webhook`
- Ручная синхронизация через long polling: `POST /api/max/pull-updates`
- Профиль пользователя для mini-app: `GET /api/max/profile?userId=<id>`

Чтобы пользователь гарантированно парсился в профиль, отправляйте `bot_started/user` события на webhook или вызывайте pull-updates.

## Сборка

```bash
npm run build
```

## Основные возможности

- **Главная** — логотип Max, заголовок Ads, анимация загрузки
- **Вход / Регистрация** — автовход по данным MAX, добавление каналов и цен
- **Биржа** — размещение каналов, покупка рекламы (заморозка средств до подтверждения)
- **Календарь** — слоты по датам и времени, бронирование
- **Поддержка** — чат-бот и чат с командой
- **Новости** — лента обновлений

## Стек

- React 18, TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- MAX Bot API
