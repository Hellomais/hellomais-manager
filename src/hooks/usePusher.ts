import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

interface PusherEvent {
  eventName: string;
  onMessage: (data: any) => void;
}

interface PusherConfig {
  key: string;
  cluster: string;
  channelName: string;
  token?: string;
  events: PusherEvent[];
}

export function usePusher({ key, cluster, channelName, token, events }: PusherConfig) {
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Pusher.Channel | null>(null);

  useEffect(() => {
    // Configuração do Pusher
    const pusherConfig: Pusher.Options = {
      cluster,
      forceTLS: true,
      authEndpoint: 'https://api.hellomais.com.br/chat/pusher/auth'
    };

    // Adiciona autenticação se houver token
    if (token) {
      pusherConfig.auth = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }

    // Inicializa o Pusher apenas se ainda não existir
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(key, pusherConfig);
    }

    // Inscreve no canal
    channelRef.current = pusherRef.current.subscribe(channelName);

    // Escuta todos os eventos registrados
    events.forEach(({ eventName, onMessage }) => {
      channelRef.current?.bind(eventName, onMessage);
    });

    // Cleanup na desmontagem
    return () => {
      if (channelRef.current) {
        events.forEach(({ eventName }) => {
          channelRef.current?.unbind(eventName);
        });
        channelRef.current.unsubscribe();
      }
      
      // Desconecta o Pusher apenas se não houver mais canais inscritos
      if (pusherRef.current && Object.keys(pusherRef.current.channels.channels).length === 0) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [key, cluster, channelName, token, events]);

  return {
    pusher: pusherRef.current,
    channel: channelRef.current
  };
}