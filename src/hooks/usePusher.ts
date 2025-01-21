import { useEffect, useRef } from 'react';
import Pusher, { Channel } from 'pusher-js';

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
  const pusherRef = useRef<Pusher>(null as unknown as Pusher);
  const channelRef = useRef<Channel>(null as unknown as Channel);

  useEffect(() => {
    // Removido o check de sessão que estava impedindo a reconexão
    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: 'http://localhost:3000/chat/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    console.log('🔄 Initializing Pusher connection...');

    pusherRef.current = pusher;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    // Debug connection events
    channel.bind('pusher:subscription_succeeded', (data: any) => {
      console.log('✅ Pusher: Connected successfully to channel', channelName, data);
      const handler = events.find(e => e.eventName === 'pusher:subscription_succeeded');
      if (handler) handler.onMessage(data);
    });

    // Handlers específicos para eventos de presença
    channel.bind('pusher:member_added', (member: any) => {
      console.log('👤 Pusher: Member added', member);
      const handler = events.find(e => e.eventName === 'pusher:member_added');
      if (handler) handler.onMessage(member);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      console.log('👋 Pusher: Member removed', member);
      const handler = events.find(e => e.eventName === 'pusher:member_removed');
      if (handler) handler.onMessage(member);
    });

    pusher.connection.bind('state_change', (states: {
      current: string;
      previous: string;
    }) => {
      console.log('🔄 Pusher: Connection state changed from', states.previous, 'to', states.current);
    });

    pusher.connection.bind('error', (err: any) => {
      console.error('❌ Pusher: Connection error', err);
    });

    return () => {
      console.log('🔌 Cleaning up Pusher connection...');
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, [channelName, cluster, events, key, token]);

  return {
    pusher: pusherRef.current,
    channel: channelRef.current
  };
}