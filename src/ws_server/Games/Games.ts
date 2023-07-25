import { onlineUsers } from '../OnlineUsers';

interface Game {
  id: number;
  [playerId: AuthenticatedUser['index']]: UserWithShips;
  playerIdWhoseTurn: AuthenticatedUser['index'];
}

type UserWithShips = AuthenticatedUser & { ships: Ship[] };

interface Ship {
  shipCells: { x: number; y: number; alreadyHit: boolean }[];
}

class Games {
  private gamesList: Game[] = [];
  private nextGameId = 0;

  public create(player1: AuthenticatedUser, player2: AuthenticatedUser) {
    const newGame: Game = {
      id: this.nextGameId,
      [player1.index]: { ...player1, ships: [] },
      [player2.index]: { ...player2, ships: [] },
      playerIdWhoseTurn: player1.index,
    };
    this.gamesList.push(newGame);

    this.nextGameId += 1;

    return newGame;
  }

  private findGameById(gameId: number) {
    return this.gamesList.find((game) => game.id === gameId);
  }

  public addShipsToGame(gameId: number, playerId: AuthenticatedUser['index'], ships: Ship[]) {
    const game = this.findGameById(gameId);

    if (game) {
      game[playerId].ships = ships;

      const players = Object.entries(game).filter(([key, _value]) => !isNaN(Number(key)));
      const isBothPlayersAddedShips =
        Boolean(players.length) && players.every(([_key, value]) => value.ships.length > 0);

      if (isBothPlayersAddedShips) this.startGame(game);
    }
  }

  private startGame(game: Game) {
    const [player1WS, player2WS] = this.getPlayersWebsockets(game);

    if (player1WS && player2WS) {
      const startGameMsg = JSON.stringify({ type: 'start_game', data: JSON.stringify({}) });

      player1WS.send(startGameMsg);
      player2WS.send(startGameMsg);

      this.sendTurnMessage(game.id);
    }
  }

  private getPlayersWebsockets(game: Game) {
    const [player1Id, player2Id] = Object.keys(game)
      .filter((key) => !isNaN(Number(key)))
      .map((key) => Number(key)) as [number, number];

    const onlineUsersEntries = Array.from(onlineUsers.entries());

    const player1WS = onlineUsersEntries.find(([_ws, user]) => user?.index === player1Id)?.[0];
    const player2WS = onlineUsersEntries.find(([_ws, user]) => user?.index === player2Id)?.[0];

    return [player1WS, player2WS] as const;
  }

  private sendTurnMessage(gameId: number) {
    const game = this.findGameById(gameId);

    if (!game) return;

    const turnMsg = JSON.stringify({
      type: 'turn',
      data: JSON.stringify({ currentPlayer: game.playerIdWhoseTurn }),
    });

    const [player1WS, player2WS] = this.getPlayersWebsockets(game);

    if (player1WS && player2WS) {
      player1WS.send(turnMsg);
      player2WS.send(turnMsg);
    }
  }

  public attack(type: 'attack' | 'randomAttack', data: string) {
    try {
      const parsedData = JSON.parse(data) as RandomAttack;
      const { gameId, indexPlayer } = parsedData;
      let x = Math.floor(Math.random() * 10);
      let y = Math.floor(Math.random() * 10);

      if (type === 'attack') {
        x = (parsedData as Attack).x;
        y = (parsedData as Attack).y;
      }

      const game = this.findGameById(gameId);

      if (!game) return;

      if (game.playerIdWhoseTurn !== indexPlayer) return;

      const attackedPlayer = Object.values(game).find(
        (value) => typeof value === 'object' && 'index' in value && value.index !== indexPlayer
      ) as UserWithShips | undefined;

      if (!attackedPlayer) return;

      let attackResult = { hit: false, alreadyHit: false, shipSunk: false };
      let attackedShip: Ship = { shipCells: [] };

      attackedPlayer.ships.forEach((ship) => {
        const cellIndex = ship.shipCells.findIndex((cell) => cell.x === x && cell.y === y);

        if (cellIndex === -1) return;

        attackedShip = ship;
        const { alreadyHit } = ship.shipCells[cellIndex];

        ship.shipCells[cellIndex].alreadyHit = true;

        attackResult = {
          hit: true,
          alreadyHit,
          shipSunk: ship.shipCells.every((cell) => cell.alreadyHit),
        };
      });

      const [player1WS, player2WS] = this.getPlayersWebsockets(game);

      if (!player1WS || !player2WS) return;

      let attackResultFeedBack = { type: 'attack', data: '' };

      if (attackResult.hit) {
        attackResultFeedBack.data = JSON.stringify({
          position: { x, y },
          currentPlayer: indexPlayer,
          status: attackResult.shipSunk ? 'killed' : 'shot',
        });
      } else {
        attackResultFeedBack.data = JSON.stringify({
          position: { x, y },
          currentPlayer: indexPlayer,
          status: 'miss',
        });
      }

      player1WS.send(JSON.stringify(attackResultFeedBack));
      player2WS.send(JSON.stringify(attackResultFeedBack));

      if (attackResult.alreadyHit || !attackResult.hit) {
        const currentPlayerId = game.playerIdWhoseTurn;
        const nextPlayerId = Object.values(game).filter(
          (value) =>
            typeof value === 'object' && 'index' in value && value.index !== currentPlayerId
        )[0].index as number;
        console.log('nextPlayerId:', nextPlayerId);

        game.playerIdWhoseTurn = nextPlayerId;
      } else if (attackResult.shipSunk) {
        this.fireEmptyCellAroundShip(game, attackedShip);
      }

      this.sendTurnMessage(gameId);
    } catch {}
  }

  private fireEmptyCellAroundShip(game: Game, ship: Ship) {
    const currentPlayer = game.playerIdWhoseTurn;
    const [player1WS, player2WS] = this.getPlayersWebsockets(game);

    if (!player1WS || !player2WS) return;

    const cellsAroundShip = ship.shipCells
      .map((cell) => [
        { x: cell.x - 1, y: cell.y },
        { x: cell.x - 1, y: cell.y - 1 },
        { x: cell.x, y: cell.y - 1 },
        { x: cell.x + 1, y: cell.y - 1 },
        { x: cell.x + 1, y: cell.y },
        { x: cell.x + 1, y: cell.y + 1 },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x - 1, y: cell.y + 1 },
      ])
      .flat(1)
      .filter(
        (cell) => !ship.shipCells.some((shipCell) => shipCell.x === cell.x && shipCell.y === cell.y)
      )
      .filter((cell) => cell.x >= 0 && cell.y >= 0);

    cellsAroundShip.forEach(({ x, y }) => {
      const msg = JSON.stringify({
        type: 'attack',
        data: JSON.stringify({ position: { x, y }, currentPlayer, status: 'miss' }),
      });
      player1WS.send(msg);
      player2WS.send(msg);
    });
  }
}

export const games = new Games();
