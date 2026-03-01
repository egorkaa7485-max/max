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
      const telegramUser = getTelegramUser();
      let botProfile = {};

      try {
        botProfile = await fetchTelegramProfileFromBot(telegramUser.telegramId);
      } catch {
        // Silent fallback to Telegram WebApp data when Bot API is unavailable.
      }

      const userData = {
        ...telegramUser,
        ...botProfile,
      };

      return {
        id: 1,
        telegramId: userData.telegramId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        photoUrl: userData.photoUrl,
        balance: 15000,
      };
    },
    staleTime: Infinity,
  });
}
