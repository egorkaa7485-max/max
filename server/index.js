import express from 'express';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use('/api', (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  next();
});
app.options('/api/*', (_req, res) => res.sendStatus(204));

const port = Number(process.env.PORT || 3001);
const databaseUrl = process.env.DATABASE_URL;
const maxBotToken = process.env.MAX_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      max_user_id TEXT UNIQUE NOT NULL,
      username TEXT,
      first_name TEXT,
      last_name TEXT,
      photo_url TEXT,
      balance INTEGER NOT NULL DEFAULT 15000,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS channels (
      id SERIAL PRIMARY KEY,
      owner_max_user_id TEXT NOT NULL,
      link TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price_per_post INTEGER NOT NULL,
      subscribers INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  const { rows } = await pool.query(`SELECT COUNT(*)::int AS count FROM channels`);
  if (rows[0]?.count === 0) {
    await pool.query(
      `
        INSERT INTO channels (owner_max_user_id, link, name, description, price_per_post, subscribers, is_active)
        VALUES
          ('123456789', '@technews', 'Tech News Daily', 'Daily tech updates', 2500, 12500, TRUE),
          ('999', '@cryptoinsights', 'Crypto Insights', 'Crypto market analysis', 4000, 8200, TRUE),
          ('888', '@designweekly', 'Design Weekly', 'UI/UX inspiration', 1500, 3100, TRUE)
      `
    );
  }
}

function mapUserRow(row) {
  return {
    id: row.id,
    telegramId: row.max_user_id,
    username: row.username || undefined,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    photoUrl: row.photo_url || undefined,
    balance: row.balance,
  };
}

function mapChannelRow(row) {
  return {
    id: row.id,
    ownerId: row.owner_max_user_id,
    link: row.link,
    name: row.name,
    description: row.description || undefined,
    pricePerPost: row.price_per_post,
    subscribers: row.subscribers,
    isActive: row.is_active,
  };
}

async function upsertUser(user) {
  const result = await pool.query(
    `
      INSERT INTO users (max_user_id, username, first_name, last_name, photo_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (max_user_id) DO UPDATE
      SET
        username = COALESCE(EXCLUDED.username, users.username),
        first_name = COALESCE(EXCLUDED.first_name, users.first_name),
        last_name = COALESCE(EXCLUDED.last_name, users.last_name),
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
        updated_at = NOW()
      RETURNING *
    `,
    [user.telegramId, user.username ?? null, user.firstName ?? null, user.lastName ?? null, user.photoUrl ?? null]
  );
  return mapUserRow(result.rows[0]);
}

/**
 * Нормализует пользователя из MAX Bot API.
 * MAX User: { user_id, name, username, is_bot?, last_activity_time? }
 * MAX UserWithPhoto: + avatar_url?, full_avatar_url?, description?
 */
function normalizeIncomingUser(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const userId = rawUser.user_id ?? rawUser.id ?? rawUser.telegram_id;
  if (!userId) return null;

  const name = typeof rawUser.name === 'string' ? rawUser.name : '';
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(' ') : undefined;

  return {
    telegramId: String(userId),
    username: rawUser.username != null && rawUser.username !== '' ? String(rawUser.username) : undefined,
    firstName: rawUser.first_name ?? (firstName || undefined),
    lastName: rawUser.last_name ?? lastName,
    photoUrl:
      typeof rawUser.full_avatar_url === 'string'
        ? rawUser.full_avatar_url
        : typeof rawUser.avatar_url === 'string'
          ? rawUser.avatar_url
          : typeof rawUser.photo_url === 'string'
            ? rawUser.photo_url
            : undefined,
  };
}

function getUpdatesList(payload) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.updates)) return payload.updates;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.result)) return payload.result;
  return [];
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/me', async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.telegramId) {
      res.status(400).json({ message: 'telegramId is required' });
      return;
    }

    const user = await upsertUser({
      telegramId: String(body.telegramId),
      username: body.username,
      firstName: body.firstName,
      lastName: body.lastName,
      photoUrl: body.photoUrl,
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to sync user', error: String(error) });
  }
});

app.get('/api/me', async (req, res) => {
  try {
    const telegramId = String(req.query.telegramId || req.query.userId || '');
    if (!telegramId) {
      res.status(400).json({ message: 'telegramId is required' });
      return;
    }
    const { rows } = await pool.query(`SELECT * FROM users WHERE max_user_id = $1 LIMIT 1`, [telegramId]);
    if (!rows[0]) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(mapUserRow(rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: String(error) });
  }
});

app.get('/api/users', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users ORDER BY updated_at DESC`);
    res.json(rows.map(mapUserRow));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: String(error) });
  }
});

app.get('/api/channels', async (_req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM channels ORDER BY id DESC`);
    res.json(rows.map(mapChannelRow));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch channels', error: String(error) });
  }
});

app.get('/api/my-channels', async (req, res) => {
  try {
    const ownerId = String(req.query.ownerId || '');
    if (!ownerId) {
      res.json([]);
      return;
    }

    const { rows } = await pool.query(
      `SELECT * FROM channels WHERE owner_max_user_id = $1 ORDER BY id DESC`,
      [ownerId]
    );
    res.json(rows.map(mapChannelRow));
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch my channels', error: String(error) });
  }
});

app.post('/api/channels', async (req, res) => {
  try {
    const body = req.body ?? {};
    if (!body.ownerId || !body.link || !body.name || typeof body.pricePerPost !== 'number') {
      res.status(400).json({ message: 'ownerId, link, name and pricePerPost are required' });
      return;
    }

    const { rows } = await pool.query(
      `
        INSERT INTO channels (owner_max_user_id, link, name, description, price_per_post, subscribers, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        String(body.ownerId),
        String(body.link),
        String(body.name),
        body.description ?? null,
        Number(body.pricePerPost),
        Number(body.subscribers ?? 0),
        body.isActive ?? true,
      ]
    );

    res.status(201).json(mapChannelRow(rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Failed to create channel', error: String(error) });
  }
});

app.get('/api/max/profile', async (req, res) => {
  try {
    const userId = String(req.query.userId || '');
    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    const localUser = await pool.query(`SELECT * FROM users WHERE max_user_id = $1 LIMIT 1`, [userId]);
    if (localUser.rows[0]) {
      res.json(mapUserRow(localUser.rows[0]));
      return;
    }

    // Если пользователя ещё нет в БД, создаём пустую запись.
    const created = await upsertUser({
      telegramId: userId,
      username: undefined,
      firstName: undefined,
      lastName: undefined,
      photoUrl: undefined,
    });
    res.json(created);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load MAX profile', error: String(error) });
  }
});

app.post('/api/max/webhook', async (req, res) => {
  try {
    const payload = req.body ?? {};
    const candidateUsers = [];
    const seen = new Set();

    // MAX может отправить один update в корне: { update_type, user, chat_id, payload }
    const rootUser = normalizeIncomingUser(payload.user);
    if (rootUser && !seen.has(rootUser.telegramId)) {
      candidateUsers.push(rootUser);
      seen.add(rootUser.telegramId);
    }

    // Или массив updates
    const updates = getUpdatesList(payload);
    for (const update of updates) {
      const parsed = normalizeIncomingUser(update?.user);
      if (parsed && !seen.has(parsed.telegramId)) {
        candidateUsers.push(parsed);
        seen.add(parsed.telegramId);
      }
    }

    for (const user of candidateUsers) {
      await upsertUser(user);
    }

    res.json({ ok: true, syncedUsers: candidateUsers.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process webhook', error: String(error) });
  }
});

app.post('/api/max/set-webhook', async (req, res) => {
  try {
    if (!maxBotToken) {
      res.status(500).json({ message: 'MAX_BOT_TOKEN is not set' });
      return;
    }
    const webhookUrl = req.body?.url ?? req.query?.url;
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      res.status(400).json({ message: 'url is required' });
      return;
    }

    const updateTypes = req.body?.update_types ?? ['bot_started', 'message_created', 'bot_added', 'user_added'];
    const body = { url: webhookUrl, update_types: updateTypes };

    const subResponse = await fetch('https://platform-api.max.ru/subscriptions', {
      method: 'POST',
      headers: { Authorization: maxBotToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await subResponse.json().catch(() => ({}));
    if (!subResponse.ok) {
      res.status(subResponse.status).json({ message: 'Failed to set webhook', detail: data });
      return;
    }
    res.json({ ok: true, webhook: webhookUrl, data });
  } catch (error) {
    res.status(500).json({ message: 'Failed to set webhook', error: String(error) });
  }
});

app.post('/api/max/pull-updates', async (req, res) => {
  try {
    if (!maxBotToken) {
      res.status(500).json({ message: 'MAX_BOT_TOKEN is not set' });
      return;
    }

    const types = req.body?.types ?? 'bot_started,message_created,bot_added,user_added';
    const limit = req.body?.limit ?? 100;
    const url = new URL('https://platform-api.max.ru/updates');
    url.searchParams.set('types', types);
    url.searchParams.set('limit', String(limit));

    const updatesResponse = await fetch(url.toString(), {
      headers: { Authorization: maxBotToken },
    });
    if (!updatesResponse.ok) {
      const errText = await updatesResponse.text();
      res.status(updatesResponse.status).json({ message: 'MAX /updates request failed', detail: errText });
      return;
    }

    const updatesJson = await updatesResponse.json();
    const updates = getUpdatesList(updatesJson);
    const seen = new Set();
    let syncedUsers = 0;

    for (const update of updates) {
      const parsed = normalizeIncomingUser(update?.user);
      if (parsed && !seen.has(parsed.telegramId)) {
        await upsertUser(parsed);
        syncedUsers += 1;
        seen.add(parsed.telegramId);
      }
    }

    res.json({ ok: true, updatesCount: updates.length, syncedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to pull updates', error: String(error) });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
