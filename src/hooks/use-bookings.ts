import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface BookingResponse {
  id: number;
  channelId: number;
  date: string;
  status: string;
  amount: number;
  content?: string;
}

const MOCK_BOOKINGS: BookingResponse[] = [
  { id: 1, channelId: 1, date: new Date().toISOString(), status: 'confirmed', amount: 2500, content: 'Ad content...' },
  { id: 2, channelId: 2, date: new Date(Date.now() + 86400000).toISOString(), status: 'pending', amount: 4000, content: 'Crypto ad' },
];

let bookings = [...MOCK_BOOKINGS];

export function useBookings() {
  return useQuery<BookingResponse[]>({
    queryKey: ['/api/bookings'],
    queryFn: async () => bookings,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { channelId: number; date: string; amount: number; content: string }) => {
      const id = Math.max(...bookings.map((b) => b.id), 0) + 1;
      const booking = { ...data, id, status: 'pending' };
      bookings = [...bookings, booking];
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
  });
}
