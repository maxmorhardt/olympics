import { useEffect, useRef } from 'react';
import type { WSMessage } from '../types/ws';

const RECONNECT_MS = 2500;

// subscribes to the tournament's broadcast room; reconnects on drop
export function useTournamentSocket(id: string | undefined, onMessage: (msg: WSMessage) => void) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!id) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let closed = false;

    const connect = () => {
      const base = import.meta.env.PROD ? 'wss://olympics-api.maxstash.io' : 'ws://localhost:8080';
      socket = new WebSocket(`${base}/ws/tournaments/${id}`);

      socket.onmessage = (event) => {
        try {
          onMessageRef.current(JSON.parse(event.data) as WSMessage);
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (!closed) {
          reconnectTimer = setTimeout(connect, RECONNECT_MS);
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      socket?.close();
    };
  }, [id]);
}
