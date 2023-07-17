import { WebSocketServer } from 'ws';

import { webSocketMessageHandler } from './webSocketMessageHandler';
import { onlineUsers } from './OnlineUsers';
import { webSocketCloseHandler } from './webSocketCloseHandler';

const WS_PORT = 3000;

export const wsServer = new WebSocketServer({ port: WS_PORT });

wsServer
  .on('connection', (webSocket) => {
    onlineUsers.set(webSocket, null);
    webSocket
      .on('message', webSocketMessageHandler)
      .on('close', webSocketCloseHandler.bind(null, webSocket));
  })
  .on('close', () => wsServer.clients.forEach((ws) => ws.close()));
