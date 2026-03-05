import { useQuery } from '@tanstack/react-query';

export interface PlatformUserResponse {
  id: number;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  balance: number;
}

export function useUsers() {
  return useQuery<PlatformUserResponse[]>({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Не удалось загрузить пользователей');
      }
      return (await response.json()) as PlatformUserResponse[];
    },
    refetchInterval: 3000, // Автоматически обновлять каждые 3 секунды
  });
}
