type WinsCount = number;

interface WinnersList {
  [name: string]: WinsCount;
}

class Winners {
  private winnersList: WinnersList = {};

  public update(name: string) {
    if (name in this.winnersList) {
      this.winnersList[name] += 1;
    } else {
      this.winnersList[name] = 1;
    }
  }

  public getTop(top: number = 10) {
    const winners = Object.entries(this.winnersList).map(([name, wins]) => ({ name, wins }));
    winners.sort((a, b) => b.wins - a.wins);

    return winners.slice(0, top);
  }
}

export const winners = new Winners();
