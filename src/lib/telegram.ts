declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          user?: {
            id: number;
            username?: string;
            first_name?: string;
            last_name?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export interface TelegramUserProfile {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export function getTelegramUser() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initDataUnsafe?.user) {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    return {
      telegramId: user.id.toString(),
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      photoUrl: user.photo_url,
    };
  }
  return {
    telegramId: '123456789',
    username: 'mock_user',
    firstName: 'Max',
    lastName: 'Developer',
    photoUrl: undefined,
  };
}

export async function fetchTelegramProfileFromBot(telegramId: string): Promise<Partial<TelegramUserProfile>> {
  const response = await fetch(`/api/telegram/profile?telegramId=${encodeURIComponent(telegramId)}`);
  if (!response.ok) {
    throw new Error('Не удалось получить профиль из Bot API');
  }

  return (await response.json()) as Partial<TelegramUserProfile>;
}

export function initTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}
