interface Attack extends RandomAttack {
  x: number;
  y: number;
}

interface RandomAttack {
  gameId: number;
  indexPlayer: number;
}
