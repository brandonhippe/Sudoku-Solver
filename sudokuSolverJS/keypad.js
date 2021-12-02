// Brandon Hippe
// Keypad object for Sudoku Solver Interface

class Keypad {
	constructor() {
		this.buttons = new Array(9);
		for (let i = 0; i < this.buttons.length; i++) {
			this.buttons[i] = new Button(cellSize * (11.5 + (i % 3) * (2 / 3)), cellSize * (1 + (2 / 3 * floor(i / 3))), cellSize * (2 / 3) * 0.9, cellSize * (2 / 3) * 0.9, (i + 1), false);
		}
		this.buttons.push(new Button(cellSize * 11.5, cellSize * 3, cellSize * 2 * 0.97, cellSize * 0.4, "Delete", false));

		this.visible = true;
	}

	show = function() {
		if (!this.visible) {
			return;
		}

		for (let i = 0; i < this.buttons.length; i++) {
			this.buttons[i].show();
		}
	}

	pressed = function(mX, mY) {
		let num = 0;
		for (let i = 0; i < this.buttons.length; i++) {
			if (this.buttons[i].clicked(mX, mY)) {
				num = i + 1;
			}

			this.buttons[i].selected = false;
		}

		return num;
	}
}
