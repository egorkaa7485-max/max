import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'max-bot-api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/max/profile', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
            return;
          }

          const url = new URL(req.url ?? '', 'http://localhost');
          const userId = url.searchParams.get('userId');
          const botToken = process.env.MAX_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;

          if (!botToken) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'MAX_BOT_TOKEN is not set' }));
            return;
          }

          try {
            const meResponse = await fetch('https://platform-api.max.ru/me', {
              headers: { Authorization: botToken },
            });
            if (!meResponse.ok) {
              res.statusCode = meResponse.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'MAX API /me request failed' }));
              return;
            }

            const meJson = (await meResponse.json()) as Record<string, unknown>;
            let username: string | undefined;
            let firstName: string | undefined;
            let lastName: string | undefined;
            let photoUrl: string | undefined;

            if (typeof meJson.username === 'string') {
              username = meJson.username;
            }
            if (typeof meJson.name === 'string') {
              const [first, ...rest] = meJson.name.trim().split(/\s+/);
              firstName = first || undefined;
              lastName = rest.length > 0 ? rest.join(' ') : undefined;
            }

            if (userId) {
              const updatesResponse = await fetch('https://platform-api.max.ru/updates', {
                headers: { Authorization: botToken },
              });
              if (updatesResponse.ok) {
                const updatesJson = (await updatesResponse.json()) as Record<string, unknown>;
                const listCandidate =
                  (Array.isArray(updatesJson.updates) ? updatesJson.updates : undefined) ||
                  (Array.isArray(updatesJson.items) ? updatesJson.items : undefined) ||
                  (Array.isArray(updatesJson.result) ? updatesJson.result : undefined) ||
                  [];

                for (const item of listCandidate as Array<Record<string, unknown>>) {
                  const rawUser = item.user as Record<string, unknown> | undefined;
                  const rawUserId = rawUser?.user_id ?? rawUser?.id;
                  if (rawUserId && String(rawUserId) === userId) {
                    if (typeof rawUser.username === 'string') {
                      username = rawUser.username;
                    }

                    if (typeof rawUser.name === 'string') {
                      const [first, ...rest] = rawUser.name.trim().split(/\s+/);
                      firstName = first || firstName;
                      lastName = rest.length > 0 ? rest.join(' ') : lastName;
                    }

                    if (typeof rawUser.first_name === 'string') {
                      firstName = rawUser.first_name;
                    }
                    if (typeof rawUser.last_name === 'string') {
                      lastName = rawUser.last_name;
                    }
                    if (typeof rawUser.photo_url === 'string') {
                      photoUrl = rawUser.photo_url;
                    }
                    break;
                  }
                }
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                telegramId: userId ?? '',
                username,
                firstName,
                lastName,
                photoUrl,
              })
            );
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Failed to fetch MAX profile' }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    target: 'esnext',
  },
});
