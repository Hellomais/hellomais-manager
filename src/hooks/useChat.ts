import { useState, useEffect, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';

interface User {
  id: number;
  name: string;
  role: string;
  highlight: boolean;
  photo: string | null;
}

interface Message {
  id: number;
  content: string;
  roomId: number;
  userId: number;
  isPinned: boolean;
  pinnedById: number | null;
  metadata: any;
  createdAt: string;
  user: User;
}

interface ChatResponse {
  pinnedMessages: Message[];
  messages: Message[];
}

interface ChatHook {
  messages: Message[];
  pinnedMessages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  pinMessage: (messageId: number) => Promise<void>;
  unpinMessage: (messageId: number) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
}

export function useChat(roomId: number, token: string): ChatHook {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/chat/rooms/${roomId}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens');
      }

      const data: ChatResponse = await response.json();
      setMessages(data.messages);
      setPinnedMessages(data.pinnedMessages);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar mensagens');
      setLoading(false);
    }
  }, [roomId, token]);

  // Handle new message
  const handleNewMessage = useCallback((data: Message) => {
    setMessages(prev => {
      // Verifica se a mensagem já existe no array para evitar duplicatas
      const messageExists = prev.some(msg => msg.id === data.id);
      if (messageExists) return prev;

      // Adiciona apenas se for uma mensagem válida
      if (data.id && data.content) {
        return [...prev, data];
      }
      return prev;
    });
  }, []);

  // Handle message deleted
  const handleMessageDeleted = useCallback((data: { messageId: number }) => {
    setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
    setPinnedMessages(prev => prev.filter(msg => msg.id !== data.messageId));
  }, []);

  const handleMessagePinned = useCallback((data: { message?: Message } | Message) => {
    // Normaliza o objeto da mensagem
    const message = (data as { message?: Message }).message || data as Message;

    // Verifica se a mensagem é válida
    if (!message || !message.id) {
      console.error('Mensagem inválida recebida:', data);
      return;
    }

    // Atualiza as mensagens fixadas
    setPinnedMessages(prev => {
      // Verifica se a mensagem já está fixada
      const messageExists = prev.some(msg => msg.id === message.id);
      if (messageExists) {
        console.log('Mensagem já está fixada');
        return prev;
      }

      // Adiciona a nova mensagem fixada
      const newPinnedMessages = [...prev, message];
      console.log('Novas mensagens fixadas:', newPinnedMessages);
      return newPinnedMessages;
    });

    // Atualiza o estado das mensagens para marcar como fixada
    setMessages(prev =>
      prev.map(msg =>
        msg.id === message.id ? { ...msg, isPinned: true } : msg
      )
    );
  }, []);

  const handleMessageUnpinned = useCallback((data: { message?: Message } | Message) => {
    // Pega a mensagem correta independente da estrutura
    const message = (data as { message?: Message }).message || data as Message;

    if (!message || !message.id) {
      console.error('Invalid message data received:', data);
      return;
    }

    setPinnedMessages(prev => prev.filter(msg => msg.id !== message.id));
    setMessages(prev =>
      prev.map(msg =>
        msg.id === message.id ? { ...msg, isPinned: false } : msg
      )
    );
  }, []);

  // Setup Pusher
  useEffect(() => {
    if (!token || !roomId) return;

    const initPusher = async () => {
      try {
        // Initialize Pusher
        const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
          cluster: import.meta.env.VITE_PUSHER_CLUSTER,
          authEndpoint: 'https://api.hellomais.com.br/chat/pusher/auth',
          auth: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        });

        pusherRef.current = pusher;
        const channelName = `presence-room-${roomId}`;
        const channel = pusher.subscribe(channelName);

        channelRef.current = channel;

        // Adicione logs para debug
        channel.bind('new-message', (data: any) => {
          handleNewMessage(data);
        });

        channel.bind('pusher:subscription_succeeded', () => {
          console.log('Canal conectado com sucesso');
        });

        // Bind events
        channelRef.current.bind('new-message', handleNewMessage);
        channelRef.current.bind('message-deleted', handleMessageDeleted);
        channelRef.current.bind('message-pinned', handleMessagePinned);
        channelRef.current.bind('message-unpinned', handleMessageUnpinned);

        // Initial fetch
        await fetchMessages();
      } catch (error) {
        console.error('Erro ao inicializar a conexão Pusher:', error);
        setError('Erro ao carregar mensagens');
      }
    };

    initPusher();

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
      pusherRef.current = null;
      channelRef.current = null;
    };
  }, [roomId, token, handleNewMessage, handleMessageDeleted, handleMessagePinned, handleMessageUnpinned, fetchMessages]);

  const sendMessage = async (content: string) => {
    try {
      const response = await fetch('https://api.hellomais.com.br/chat/rooms/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          content,
          roomId
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar mensagem');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao enviar mensagem');
      throw error;
    }
  };

  const pinMessage = async (messageId: number) => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/chat/messages/${messageId}/pin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao fixar mensagem');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao fixar mensagem');
      throw error;
    }
  };

  const unpinMessage = async (messageId: number) => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/chat/messages/${messageId}/pin`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao desafixar mensagem');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao desafixar mensagem');
      throw error;
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao deletar mensagem');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao deletar mensagem');
      throw error;
    }
  };

  return {
    messages,
    pinnedMessages,
    loading,
    error,
    sendMessage,
    pinMessage,
    unpinMessage,
    deleteMessage
  };
}