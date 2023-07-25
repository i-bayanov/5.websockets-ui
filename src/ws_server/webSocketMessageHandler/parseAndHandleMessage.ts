import { WebSocket } from 'ws';

import { onlineUsers } from '../OnlineUsers';
import { games } from '../Games';

import {
  addUserShips,
  addUserToRoomHandler,
  createRoomHandler,
  regHandler,
} from './messageTypesHandlers';

export function parseAndHandleMessage(webSocket: WebSocket, { type, data }: WsMessage) {
  const user = onlineUsers.get(webSocket);

  switch (type) {
    case 'reg':
      regHandler(webSocket, data);
      break;
    case 'create_room':
      if (user) createRoomHandler(user);
      break;
    case 'add_user_to_room':
      if (user) addUserToRoomHandler(user, data);
      break;
    case 'add_ships':
      if (user) addUserShips(user, data);
      break;
    case 'attack':
    case 'randomAttack':
      games.attack(type, data);
      break;
    case 'update_winners':
      break;
    case 'single_play':
      break;
    default:
      webSocket.send(
        JSON.stringify({
          type: 'error',
          data: JSON.stringify({ error: true, errorText: 'Something went wrong' }),
        })
      );
  }
}
