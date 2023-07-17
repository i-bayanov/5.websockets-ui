import { WebSocket } from 'ws';

export const onlineUsers = new Map<WebSocket, AuthenticatedUser | null>();
