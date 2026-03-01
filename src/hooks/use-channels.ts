import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTelegramUser } from '@/lib/telegram';
import { useAuth } from '@/hooks/use-auth';

export interface ChannelResponse {
  id: number;
  ownerId: string;
  link: string;
  name: string;
  description?: string;
  pricePerPost: number;
  subscribers: number;
  isActive: boolean;
}

export function useChannels() {
  return useQuery<ChannelResponse[]>({
    queryKey: ['/api/channels'],
    queryFn: async () => {
      const response = await fetch('/api/channels');
      if (!response.ok) {
        throw new Error('Не удалось загрузить каналы');
      }
      return (await response.json()) as ChannelResponse[];
    },
  });
}

export function useMyChannels() {
  const { data: user } = useAuth();
  const ownerId = user?.telegramId ?? '';
  return useQuery<ChannelResponse[]>({
    queryKey: ['/api/my-channels', ownerId],
    queryFn: async () => {
      const response = await fetch(`/api/my-channels?ownerId=${encodeURIComponent(ownerId)}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить каналы пользователя');
      }
      return (await response.json()) as ChannelResponse[];
    },
    enabled: !!ownerId,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ChannelResponse, 'id' | 'ownerId' | 'isActive'> & { isActive?: boolean }) => {
      const userData = getTelegramUser();
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: userData.telegramId,
          link: data.link,
          name: data.name || data.link,
          description: data.description,
          pricePerPost: data.pricePerPost,
          subscribers: data.subscribers,
          isActive: data.isActive ?? true,
        }),
      });
      if (!response.ok) {
        throw new Error('Не удалось создать канал');
      }
      return (await response.json()) as ChannelResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-channels'] });
    },
  });
}
