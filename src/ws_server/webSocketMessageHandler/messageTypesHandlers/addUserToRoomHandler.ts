import { WebSocket } from 'ws';

import { games } from '../../Games';
import { onlineUsers } from '../../OnlineUsers';
import { rooms } from '../../Rooms';

export function addUserToRoomHandler(user: AuthenticatedUser, data: string) {
  try {
    const roomID = (JSON.parse(data) as { indexRoom: number }).indexRoom;

    const room = rooms.addPlayerToRoom(roomID, user);

    if (!room) return;

    const authorizedWebSockets = Array.from(onlineUsers.entries()).filter(
      (entry): entry is [WebSocket, AuthenticatedUser] => Boolean(entry[1])
    );

    const player1 = authorizedWebSockets.find(([_ws, user]) => user?.name === room.player1?.name);
    const player2 = authorizedWebSockets.find(([_ws, user]) => user?.name === room.player2?.name);

    if (player1 && player2) {
      const newGame = games.create(player1[1], player2[1]);

      player1[0].send(
        JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({ idGame: newGame.id, idPlayer: player1[1].index }),
        })
      );
      player2[0].send(
        JSON.stringify({
          type: 'create_game',
          data: JSON.stringify({ idGame: newGame.id, idPlayer: player2[1].index }),
        })
      );
    }

    authorizedWebSockets.forEach(([ws]) =>
      ws.send(
        JSON.stringify({ type: 'update_room', data: JSON.stringify(rooms.getAllIncomplete()) })
      )
    );
  } catch {}
}
