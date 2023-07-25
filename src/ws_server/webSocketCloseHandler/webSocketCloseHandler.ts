import WebSocket from 'ws';

import { onlineUsers } from '../OnlineUsers';

export function webSocketCloseHandler(webSocket: WebSocket) {
  onlineUsers.delete(webSocket);
}
