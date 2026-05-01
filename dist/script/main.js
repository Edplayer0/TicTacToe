const squares = document.querySelectorAll(".square");

class Round {
  constructor(player) {
    this.player = player;
    this.plays = 0;

    if (this.player == "circle") {
      this.botValue = 1;
      this.botPlay();
    } else {
      this.botValue = -1;
    }
  }

  nextPlayerValue(state) {
    let countX = 0,
      countO = 0;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (state[i][j] === 1) countX++;
        else if (state[i][j] === -1) countO++;
      }
    }
    return countX === countO ? 1 : -1;
  }

  get state() {
    let emptyBoard = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (let i = 0; i < 9; i++) {
      // If the square is empty do nothing
      if (!squares[i].children.length) {
        continue;
      }

      // Get the element inside the square
      let element = squares[i].children[0];

      if (element.classList.contains("x")) {
        emptyBoard[Math.floor(i / 3)][i % 3] = 1;
      } else {
        emptyBoard[Math.floor(i / 3)][i % 3] = -1;
      }
    }

    return emptyBoard;
  }

  get finished() {
    if (this.utility()) {
      return true;
    }

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (!this.state[i][j]) {
          return false;
        }
      }
    }

    return true;
  }

  play = function (square) {
    if (square.children.length) return false;
    let element = document.createElement("DIV");
    element.classList.add(this.player);
    square.appendChild(element);
    this.plays++;

    if (this.finished) {
      this.win();
      return;
    }

    this.botPlay();
  };

  botPlay = function () {
    if (this.finished) {
      this.win();
      return;
    }

    let actions = this.actions(this.state, this.botValue);

    if (actions.length === 0) {
      return;
    }

    let bestScore = this.botValue == 1 ? -2 : 2;
    let bestAction;

    console.log(bestScore);

    for (let action of actions) {
      if (bestScore > 0) {
        const score = this.minValue(action);
        if (score < bestScore) {
          bestScore = score;
          bestAction = action;
        }
      } else {
        const score = this.maxValue(action);
        if (score > bestScore) {
          bestScore = score;
          bestAction = action;
        }
      }
    }

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        const idx = x * 3 + y;
        if (this.state[x][y] === 0 && bestAction[x][y] !== 0) {
          const el = document.createElement("DIV");
          el.classList.add(bestAction[x][y] === 1 ? "x" : "circle");
          squares[idx].appendChild(el);
          this.plays++;
          if (this.finished) this.win();
          return;
        }
      }
    }
  };

  reset = function () {
    for (let square of squares) {
      let element = square.children[0];

      if (!element) {
        continue;
      }

      square.removeChild(element);
    }
  };

  win = function () {
    alert(`Winner: ${this.utility()}`);
    this.reset();
  };

  actions = function (state, value) {
    if (!state) {
      state = this.state;
    }

    let actions = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 3; y++) {
        if (state[x][y] == 0) {
          let action = structuredClone(state);
          action[x][y] = value;
          actions.push(action);
        }
      }
    }
    return actions;
  };

  minValue = function (action) {
    if (this.utility(action)) {
      return this.utility(action);
    }

    let actions = this.actions(action, this.nextPlayerValue(action));
    let max = actions.map((action) => this.maxValue(action));
    if (max.length === 0) return 0;

    return Math.min(...max);
  };

  maxValue = function (action) {
    if (this.utility(action)) {
      return this.utility(action);
    }

    let actions = this.actions(action, this.nextPlayerValue(action));
    let min = actions.map((action) => this.minValue(action));
    if (min.length === 0) return 0;

    return Math.max(...min);
  };

  utility = function (state) {
    if (!state) {
      state = this.state;
    }

    // Verify rows
    for (let i = 0; i < 3; i++) {
      if (state[i][0] === 1 && state[i][1] === 1 && state[i][2] === 1) return 1;
      if (state[i][0] === -1 && state[i][1] === -1 && state[i][2] === -1)
        return -1;
    }

    // Verify columns
    for (let j = 0; j < 3; j++) {
      if (state[0][j] === 1 && state[1][j] === 1 && state[2][j] === 1) return 1;
      if (state[0][j] === -1 && state[1][j] === -1 && state[2][j] === -1)
        return -1;
    }

    // Verify diagonals
    if (state[0][0] === 1 && state[1][1] === 1 && state[2][2] === 1) return 1;
    if (state[0][0] === -1 && state[1][1] === -1 && state[2][2] === -1)
      return -1;
    if (state[0][2] === 1 && state[1][1] === 1 && state[2][0] === 1) return 1;
    if (state[0][2] === -1 && state[1][1] === -1 && state[2][0] === -1)
      return -1;

    // There is no winner
    return 0;
  };
}

const game = new Round((player = "x"));

// Create the event
squares.forEach((square) =>
  square.addEventListener("click", () => game.play(square))
);
