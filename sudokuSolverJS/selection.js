// Brandon Hippe
// Selection Choice object for Sudoku Solver Interface

class SelectionPanel {
	constructor() {
		this.buttons = new Array(3);
		for (let i = 0; i < this.buttons.length; i++) {
			switch (i) {
				case 0:
					this.buttons[i] = new Button(cellSize * 11.05, cellSize * .525, cellSize * 1.5 * 0.9, cellSize * 0.5 * 0.9, "Numbers", false);
					break;
				case 1:
					this.buttons[i] = new Button(cellSize * 12.55, cellSize * .525, cellSize * 1.5 * 0.9, cellSize * 0.5 * 0.9, "Restrictions", false);
					break;
				case 2:
					this.buttons[i] = new Button(cellSize * 14.05, cellSize * .525, cellSize * 1.5 * 0.9, cellSize * 0.5 * 0.9, "Options", false);
					break;
			}
		}

		this.buttons[0].clicked(cellSize * 11.1, cellSize * .6, this.buttons);
		this.buttons[1].textSize--;
	}

	show = function() {
		for (let i = 0; i < this.buttons.length; i++) {
			this.buttons[i].show();
		}
	}

	clicked = function(mX, mY) {
		for (let i = 0; i < this.buttons.length; i++) {
			this.buttons[i].clicked(mX, mY, this.buttons);
		}
	}
}
