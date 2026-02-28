import { useQuery } from '@tanstack/react-query';
import { getTelegramUser } from '@/lib/telegram';

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
      const userData = getTelegramUser();
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
