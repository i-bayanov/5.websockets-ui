import { onlineUsers } from '../../OnlineUsers';
import { rooms } from '../../Rooms';

export function createRoomHandler(user: AuthenticatedUser) {
  const room = rooms.createRoom(user);

  if (room) {
    const authorizedWebSockets = Array.from(onlineUsers.entries())
      .filter(([_ws, user]) => Boolean(user))
      .map(([ws, _user]) => ws);

    authorizedWebSockets.forEach((ws) =>
      ws.send(
        JSON.stringify({ type: 'update_room', data: JSON.stringify(rooms.getAllIncomplete()) })
      )
    );
  }
}
