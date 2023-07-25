import WebSocket from 'ws';

import { usersDB } from '../../UserDB';
import { onlineUsers } from '../../OnlineUsers';
import { winners } from '../../Winners';
import { rooms } from '../../Rooms';

export function regHandler(webSocket: WebSocket, data: string) {
  try {
    const response = usersDB.reg(JSON.parse(data) as User);
    let reauthorizationError: ErrorMsg | null = null;

    if ('name' in response) {
      const isUserAlreadyAuthenticated = Array.from(onlineUsers.values()).some(
        (el) => el?.name === response.name
      );

      if (isUserAlreadyAuthenticated) {
        reauthorizationError = {
          error: true,
          errorText: ErrorMessages.ReauthorizationError,
        };
      } else {
        onlineUsers.set(webSocket, response);
        console.log('New authorized user:', response.name);
      }
    } else {
      console.error('User authorization error:\n\t', response.errorText);
    }

    webSocket.send(
      JSON.stringify({ type: 'reg', data: JSON.stringify(reauthorizationError || response) })
    );

    webSocket.send(
      JSON.stringify({ type: 'update_room', data: JSON.stringify(rooms.getAllIncomplete()) })
    );

    webSocket.send(
      JSON.stringify({ type: 'update_winners', data: JSON.stringify(winners.getTop()) })
    );
  } catch {}
}
