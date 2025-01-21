import { useState, useEffect, useCallback } from 'react';
import { usePusher } from './usePusher';

interface RoomUser {
  userId: number;
  userName: string;
  timeInRoom: string;
  isActive: boolean;
}

interface RoomUsersResponse {
  data: RoomUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RoomUsersHook {
  users: RoomUser[];
  onlineCount: number;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
  setSearchTerm: (term: string) => void;
}

export function useRoomUsers(roomId: number, token: string, eventId: number): RoomUsersHook {
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuração do Pusher para atualizações em tempo real
  usePusher({
    key: import.meta.env.VITE_PUSHER_KEY,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    channelName: `presence-room-${roomId}`,
    token,
    events: [
      {
        eventName: 'pusher:subscription_succeeded',
        onMessage: (data: {
          members: Record<string, { role: string; email: string }>;
          count: number;
          myID: string;
          me: { id: string; info: { role: string; email: string } };
        }) => {
          setOnlineCount(data.count);
        }
      },
      {
        eventName: 'pusher:member_added',
        onMessage: (member: { id: string; info: { role: string; email: string } }) => {
          setOnlineCount(prev => prev + 1);
        }
      },
      {
        eventName: 'pusher:member_removed',
        onMessage: (member: { id: string; info: { role: string; email: string } }) => {
          setOnlineCount(prev => Math.max(0, prev - 1));
        }
      }
    ]
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.hellomais.com.br/metrics/room/${roomId}/users?page=${currentPage}&limit=20${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
        }`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      const data: RoomUsersResponse = await response.json();
      setUsers(data.data);
      setTotalUsers(data.total);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar usuários');
      setLoading(false);
    }
  }, [roomId, token, currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    onlineCount,
    totalUsers,
    currentPage,
    totalPages,
    loading,
    error,
    refresh: fetchUsers,
    setPage: setCurrentPage,
    setSearchTerm
  };
}