interface Room {
  player1?: AuthenticatedUser;
  player2?: AuthenticatedUser;
  id: number;
  isFull: boolean;
}

class Rooms {
  private roomsList: Room[] = [];
  private nextRoomID: number = 0;

  private findRoomWithPlayer(playerName: string) {
    return this.roomsList.find(
      (room) => room.player1?.name === playerName || room.player2?.name === playerName
    );
  }

  private removeRoom(roomToRemoveID: number) {
    const roomIndexInList = this.roomsList.findIndex((room) => room.id === roomToRemoveID);
    if (roomIndexInList !== -1) {
      this.roomsList.splice(roomIndexInList, 1);
    }
  }

  public createRoom(player1: AuthenticatedUser) {
    const isPlayerAlreadyInRoom = Boolean(this.findRoomWithPlayer(player1.name));

    if (isPlayerAlreadyInRoom) return;

    const roomID = this.nextRoomID;
    this.nextRoomID += 1;
    const room: Room = { player1: player1, id: roomID, isFull: false };
    this.roomsList.push(room);

    return room;
  }

  public addPlayerToRoom(roomID: number, playerToAdd: AuthenticatedUser) {
    const room = this.roomsList.find((room) => room.id === roomID);

    if (room && room.player1) {
      if (room.player1.index === playerToAdd.index) return;

      room.player2 = playerToAdd;
      room.isFull = true;
    }

    return room;
  }

  public removePlayerFromRoom(playerToRemove: AuthenticatedUser) {
    const room = this.findRoomWithPlayer(playerToRemove.name);

    if (room) {
      const { player1 } = room;

      if (player1?.index === playerToRemove.index) {
        room.player1 = room.player2;
        room.player2 = undefined;
      } else {
        room.player2 = undefined;
      }

      room.isFull = false;

      if (room.player1 === undefined && room.player2 === undefined) {
        this.removeRoom(room.id);
      }
    }
  }

  public getAllIncomplete() {
    return this.roomsList
      .filter((room) => !room.isFull)
      .map(({ id, player1 }) => ({ roomId: id, roomUsers: [player1] }));
  }
}

export const rooms = new Rooms();
