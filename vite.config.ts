import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'telegram-bot-api-proxy',
      configureServer(server) {
        server.middlewares.use('/api/telegram/profile', async (req, res) => {
          if (req.method !== 'GET') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
            return;
          }

          const url = new URL(req.url ?? '', 'http://localhost');
          const telegramId = url.searchParams.get('telegramId');
          const botToken = process.env.TELEGRAM_BOT_TOKEN;

          if (!telegramId) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'telegramId is required' }));
            return;
          }

          if (!botToken) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'TELEGRAM_BOT_TOKEN is not set' }));
            return;
          }

          try {
            const chatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat?chat_id=${telegramId}`);
            const chatJson = (await chatResponse.json()) as {
              ok: boolean;
              result?: { username?: string; first_name?: string; last_name?: string };
            };

            if (!chatJson.ok || !chatJson.result) {
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ message: 'User profile is unavailable via Bot API' }));
              return;
            }

            let photoUrl: string | undefined;
            const photosResponse = await fetch(
              `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}&limit=1`
            );
            const photosJson = (await photosResponse.json()) as {
              ok: boolean;
              result?: { photos?: Array<Array<{ file_id: string }>> };
            };

            const fileId = photosJson.result?.photos?.[0]?.[0]?.file_id;
            if (fileId) {
              const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
              const fileJson = (await fileResponse.json()) as {
                ok: boolean;
                result?: { file_path?: string };
              };

              if (fileJson.ok && fileJson.result?.file_path) {
                photoUrl = `https://api.telegram.org/file/bot${botToken}/${fileJson.result.file_path}`;
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                telegramId,
                username: chatJson.result.username,
                firstName: chatJson.result.first_name,
                lastName: chatJson.result.last_name,
                photoUrl,
              })
            );
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Failed to fetch Telegram profile' }));
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
