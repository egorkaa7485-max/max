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

const MOCK_CHANNELS: ChannelResponse[] = [
  { id: 1, ownerId: '123456789', link: '@technews', name: 'Tech News Daily', description: 'Daily tech updates', pricePerPost: 2500, subscribers: 12500, isActive: true },
  { id: 2, ownerId: '999', link: '@cryptoinsights', name: 'Crypto Insights', description: 'Crypto market analysis', pricePerPost: 4000, subscribers: 8200, isActive: true },
  { id: 3, ownerId: '888', link: '@designweekly', name: 'Design Weekly', description: 'UI/UX inspiration', pricePerPost: 1500, subscribers: 3100, isActive: true },
];

let channels = [...MOCK_CHANNELS];

export function useChannels() {
  return useQuery<ChannelResponse[]>({
    queryKey: ['/api/channels'],
    queryFn: async () => channels,
  });
}

export function useMyChannels() {
  const { data: user } = useAuth();
  const { data: allChannels } = useChannels();
  const ownerId = user?.telegramId ?? '';
  return useQuery<ChannelResponse[]>({
    queryKey: ['/api/my-channels', ownerId],
    queryFn: async () => allChannels?.filter((c) => c.ownerId === ownerId) ?? [],
    enabled: !!ownerId && !!allChannels,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<ChannelResponse, 'id' | 'ownerId' | 'isActive'> & { isActive?: boolean }) => {
      const userData = getTelegramUser();
      const id = Math.max(...channels.map((c) => c.id), 0) + 1;
      const channel = {
        ...data,
        id,
        ownerId: userData.telegramId,
        link: data.link,
        isActive: data.isActive ?? true,
      };
      channels = [...channels, channel];
      return channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/channels'] });
      queryClient.invalidateQueries({ queryKey: ['/api/my-channels'] });
    },
  });
}
