declare global {
  interface Window {
    MAX?: {
      WebApp?: {
        initDataUnsafe?: {
          user?: {
            user_id?: number;
            id?: number;
            username?: string;
            name?: string;
            first_name?: string;
            last_name?: string;
            photo_url?: string;
            avatar_url?: string;
          };
        };
        ready?: () => void;
        expand?: () => void;
        close?: () => void;
      };
    };
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

function splitDisplayName(name?: string) {
  if (!name) return { firstName: undefined, lastName: undefined };
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName: firstName || undefined,
    lastName: rest.length > 0 ? rest.join(' ') : undefined,
  };
}

function getUserFromQueryParams(): Partial<TelegramUserProfile> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);

  const rawId =
    params.get('user_id') ||
    params.get('userId') ||
    params.get('uid') ||
    params.get('id');

  if (!rawId) return null;

  const fullName = params.get('name') || undefined;
  const parsedName = splitDisplayName(fullName);

  return {
    telegramId: rawId,
    username: params.get('username') || params.get('user_name') || undefined,
    firstName: params.get('first_name') || parsedName.firstName,
    lastName: params.get('last_name') || parsedName.lastName,
    photoUrl: params.get('photo_url') || params.get('avatar_url') || undefined,
  };
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

  if (typeof window !== 'undefined' && window.MAX?.WebApp?.initDataUnsafe?.user) {
    const user = window.MAX.WebApp.initDataUnsafe.user;
    const userId = user.user_id ?? user.id;
    if (userId) {
      const parsedName = splitDisplayName(user.name);
      return {
        telegramId: userId.toString(),
        username: user.username,
        firstName: user.first_name || parsedName.firstName,
        lastName: user.last_name || parsedName.lastName,
        photoUrl: user.photo_url || user.avatar_url,
      };
    }
  }

  const queryUser = getUserFromQueryParams();
  if (queryUser?.telegramId) {
    return {
      telegramId: queryUser.telegramId,
      username: queryUser.username,
      firstName: queryUser.firstName,
      lastName: queryUser.lastName,
      photoUrl: queryUser.photoUrl,
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
  const response = await fetch(`/api/max/profile?userId=${encodeURIComponent(telegramId)}`);
  if (!response.ok) {
    throw new Error('Не удалось получить профиль из MAX Bot API');
  }

  return (await response.json()) as Partial<TelegramUserProfile>;
}

export function initTelegramApp() {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    return;
  }
  if (typeof window !== 'undefined' && window.MAX?.WebApp) {
    try {
      window.MAX.WebApp.ready?.();
      window.MAX.WebApp.expand?.();
    } catch {
      // Some MAX containers partially expose WebApp API and may throw UnsupportedEvent.
    }
  }
}
