import { useState, useEffect, useCallback } from 'react';

interface UserMetrics {
  totalUsers: number;
  accessRate: number;
  usersWithAccess: number;
  loading: boolean;
  error: string | null;
}

interface UserResponse {
  data: Array<{
    id: number;
    hasLoggedIn: boolean;
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useUserMetrics(token: string, eventId: number | null) {
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    accessRate: 0,
    usersWithAccess: 0,
    loading: true,
    error: null,
  });

  const fetchMetrics = useCallback(async () => {
    if (!eventId) return;
    
    setMetrics(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let allUsers: { hasLoggedIn: boolean }[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let total = 0;

      do {
        const response = await fetch(`https://api.hellomais.com.br/users?page=${currentPage}&limit=500`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': eventId.toString(),
            'accept': '*/*'
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user metrics');
        }

        const data: UserResponse = await response.json();
        totalPages = data.totalPages;
        total = data.total;
        
        // Add users from current page
        allUsers = [...allUsers, ...data.data];
        currentPage++;
      } while (currentPage <= totalPages);
      
      // Calculate users who have logged in
      const usersWithAccess = allUsers.filter(user => user.hasLoggedIn).length;
      
      setMetrics({
        totalUsers: total,
        usersWithAccess,
        accessRate: (usersWithAccess / total) * 100,
        loading: false,
        error: null,
      });
    } catch (error) {
      setMetrics(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      }));
    }
  }, [token, eventId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { ...metrics, refresh: fetchMetrics };
}