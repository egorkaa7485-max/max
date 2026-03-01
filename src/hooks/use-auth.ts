import { useQuery } from '@tanstack/react-query';
import { fetchTelegramProfileFromBot, getTelegramUser } from '@/lib/telegram';

export interface UserResponse {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
}

export function useAuth() {
  return useQuery<UserResponse | null>({
    queryKey: ['/api/me'],
    queryFn: async () => {
      const clientUser = getTelegramUser();
      let botProfile: Partial<UserResponse> = {};

      try {
        botProfile = await fetchTelegramProfileFromBot(clientUser.telegramId);
      } catch {
        // Silent fallback to in-app data when profile is not yet synced.
      }

      const userData = {
        ...clientUser,
        ...botProfile,
      };

      const response = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: userData.telegramId,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          photoUrl: userData.photoUrl,
        }),
      });
      if (!response.ok) {
        throw new Error('Не удалось синхронизировать пользователя');
      }
      return (await response.json()) as UserResponse;
    },
    staleTime: Infinity,
  });
}
