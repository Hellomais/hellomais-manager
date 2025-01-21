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
    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: 'https://api.hellomais.com.br/chat/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    pusherRef.current = pusher;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind('pusher:subscription_succeeded', (data: any) => {
      const handler = events.find(e => e.eventName === 'pusher:subscription_succeeded');
      if (handler) handler.onMessage(data);
    });

    channel.bind('pusher:member_added', (member: any) => {
      const handler = events.find(e => e.eventName === 'pusher:member_added');
      if (handler) handler.onMessage(member);
    });

    channel.bind('pusher:member_removed', (member: any) => {
      const handler = events.find(e => e.eventName === 'pusher:member_removed');
      if (handler) handler.onMessage(member);
    });

    pusher.connection.bind('state_change', (states: {
      current: string;
      previous: string;
    }) => { });

    pusher.connection.bind('error', (err: any) => { });

  }, [channelName, cluster, events, key, token]);

  return {
    pusher: pusherRef.current,
    channel: channelRef.current
  };
}