import { games } from '../../Games';

interface AddShipsData {
  gameId: number;
  ships: Ship[];
  indexPlayer: number;
}

interface Ship {
  position: { x: number; y: number };
  direction: boolean;
  type: 'huge' | 'large' | 'medium' | 'small';
  length: 1 | 2 | 3 | 4;
}

export function addUserShips(user: AuthenticatedUser, data: string) {
  try {
    const { gameId, ships } = JSON.parse(data) as AddShipsData;

    const shipsToAdd = ships.map((ship) => {
      const { direction: isVertical, length, position } = ship;
      const shipCells: { x: number; y: number; alreadyHit: boolean }[] = [];

      for (let i = 0; i < length; i++) {
        if (isVertical) {
          shipCells.push({ x: position.x, y: position.y + i, alreadyHit: false });
        } else {
          shipCells.push({ x: position.x + i, y: position.y, alreadyHit: false });
        }
      }

      return { shipCells };
    });

    games.addShipsToGame(gameId, user.index, shipsToAdd);
  } catch {}
}
