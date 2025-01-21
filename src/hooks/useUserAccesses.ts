import { useState, useEffect, useCallback } from 'react';

interface UserAccess {
  id: number;
  name: string;
  email: string;
  hasLoggedIn: boolean;
}

interface UserAccessesResponse {
  data: UserAccess[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUserAccesses(token: string, eventId: number | null) {
  const [users, setUsers] = useState<UserAccess[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccesses = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.hellomais.com.br/users?page=${currentPage}&limit=10${
          searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''
        }`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': eventId.toString(),
            'accept': '*/*'
          },
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao buscar usuários');
      }

      const data: UserAccessesResponse = await response.json();
      setUsers(data.data);
      setTotalPages(data.totalPages);
      setTotalUsers(data.total);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao buscar dados de acesso');
      setLoading(false);
    }
  }, [token, eventId, currentPage, searchTerm]);

  useEffect(() => {
    fetchAccesses();
  }, [fetchAccesses]);

  return {
    users,
    totalUsers,
    totalPages,
    currentPage,
    loading,
    error,
    refresh: fetchAccesses,
    setPage: setCurrentPage,
    setSearchTerm
  };
}