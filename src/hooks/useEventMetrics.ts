import { useState, useEffect, useCallback } from 'react';

interface UserAccess {
  userId: number;
  userName: string;
  timestamp: string;
}

interface UserReaction {
  userId: number;
  type: 'love' | 'laugh' | 'cry' | 'wow';
  timestamp: string;
}

interface UserMessage {
  userId: number;
  timestamp: string;
}

interface EventMetrics {
  firstAccesses: UserAccess[];
  userReactions: {
    userId: number;
    name: string;
    reactions: {
      love: number;
      laugh: number;
      cry: number;
      wow: number;
    };
  }[];
  userMessages: {
    userId: number;
    name: string;
    total: number;
  }[];
  reactionTimeline: {
    date: string;
    total: number;
  }[];
  loading: boolean;
  error: string | null;
}

interface UserResponse {
  data: Array<{
    id: number;
    name: string;
    hasLoggedIn: boolean;
  }>;
}

export function useEventMetrics(token: string, eventId: number | null) {
  const [metrics, setMetrics] = useState<EventMetrics>({
    firstAccesses: [],
    userReactions: [],
    userMessages: [],
    reactionTimeline: [],
    loading: true,
    error: null,
  });

  const fetchMetrics = useCallback(async () => {
    if (!eventId) return;
    
    setMetrics(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch users to get first access data
      const usersResponse = await fetch('https://api.hellomais.com.br/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': eventId.toString(),
          'accept': '*/*'
        },
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const usersData: UserResponse = await usersResponse.json();
      
      // Transform user data into first accesses format
      const firstAccesses = usersData.data
        .filter(user => user.hasLoggedIn)
        .map(user => ({
          userId: user.id,
          userName: user.name,
          // Como não temos o timestamp real, vamos usar a data atual
          timestamp: new Date().toISOString()
        }));

      // Fetch reactions
      const reactionsResponse = await fetch(`https://api.hellomais.com.br/metrics/reactions/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
      });

      if (!reactionsResponse.ok) {
        throw new Error('Failed to fetch reactions');
      }

      const reactionsData = await reactionsResponse.json();

      // Fetch messages
      const messagesResponse = await fetch(`https://api.hellomais.com.br/metrics/messages/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        },
      });

      if (!messagesResponse.ok) {
        throw new Error('Failed to fetch messages');
      }

      const messagesData = await messagesResponse.json();

      setMetrics({
        firstAccesses,
        userReactions: reactionsData.userReactions,
        userMessages: messagesData.userMessages,
        reactionTimeline: reactionsData.timeline,
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