import { useState, useEffect, useCallback } from 'react';

interface RoomMetric {
  roomId: number;
  activeUsers: number;
  averageTime: number;
}

interface DashboardMetrics {
  currentOnline: number;
  roomMetrics: RoomMetric[];
  loading: boolean;
  error: string | null;
}

export function useDashboardMetrics(token: string, eventId: number | null) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    currentOnline: 0,
    roomMetrics: [],
    loading: true,
    error: null,
  });

  const fetchMetrics = useCallback(async () => {
    if (!eventId) return;
    
    setMetrics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`https://api.hellomais.com.br/metrics/dashboard/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      
      // Calcula o total de usuários online somando de todas as salas
      const totalOnline = data.realtimeMetrics.roomMetrics.reduce(
        (sum: number, room: RoomMetric) => sum + room.activeUsers, 
        0
      );
      
      setMetrics({
        currentOnline: totalOnline,
        roomMetrics: data.realtimeMetrics.roomMetrics,
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
    
    // Atualiza as métricas a cada 30 segundos
    const interval = setInterval(fetchMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { ...metrics, refresh: fetchMetrics };
}