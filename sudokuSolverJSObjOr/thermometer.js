class Thermometer {
	constructor () {
		this.indexes = [];
		this.cells = 0;
	}

	newCell = function(row, col) {
		if (this.onThermo(row, col)) {
			for (let i = 0; i < this.cells; i++) {
				if (this.indexes[i * 2] == row && this.indexes[i * 2 + 1] == col) {
					for (let j = this.cells - 1; j > i; j--) {
						let row1 = this.indexes[j * 2];
						let col1 = this.indexes[j * 2 + 1];

						this.indexes.splice(j * 2, 2);
						this.cells--;

						for (let k = 1; k <= 9; k++) {
							if (sudoku.checkValid(row1, col1, k) && !sudoku.cells[row1][col1].notes[k - 1]) {
								sudoku.cells[row1][col1].notes[k - 1] = true;
								sudoku.cells[row1][col1].noteHighlight[k - 1] = color("white");
								sudoku.cells[row1][col1].numPossible++;
							}
						}
					}

					for (let j = 0; j < this.cells; j++) {
						let row1 = this.indexes[j * 2];
						let col1 = this.indexes[j * 2 + 1];

						for (let k = 1; k <= 9; k++) {
							let valid = true;
							for (let a = 0; a < 9; a++) {
								for (let b = 0; b < 9; b++) {
									if (sudoku.cells[a][b].digit == k && sudoku.cells[a][b].sees(sudoku.cells[row1][col1])) {
										valid = false;
									}
								}
							}

							if (valid && !sudoku.cells[row1][col1].notes[k - 1]) {
								sudoku.cells[row1][col1].notes[k - 1] = true;
								sudoku.cells[row1][col1].noteHighlight[k - 1] = color("white");
								sudoku.cells[row1][col1].numPossible++;
							}
						}
					}
				}
			}
		} else {
			if (((abs(this.indexes[(this.cells - 1) * 2] - row) <= 1 && abs(this.indexes[(this.cells - 1) * 2 + 1] - col) <= 1 && this.cells !== 0) || this.cells == 0) && this.cells !== 9) {
				this.indexes.push(row);
				this.indexes.push(col);
				this.cells++;
			}
		}

		sudoku.thermoNotes();
		sudoku.updateGrid();
	}

	onThermo = function(row, col) {
		for (let i = 0; i < this.cells; i++) {
			if (this.indexes[i * 2] == row && this.indexes[i * 2 + 1] == col) {
				return true;
			}
		}

		return false;
	}

	thermoIndex = function(row, col) {
		for (let i = 0; i < this.cells; i++) {
			if (this.indexes[i * 2] == row && this.indexes[i * 2 + 1] == col) {
				return i;
			}
		}
	}

	minVal = function(row, col, useCopy) {
		let index = this.thermoIndex(row, col);
		let val;

		if (useCopy) {
			for (val = index + 1; val <= 9; val++) {
				let valid = true;
				if (!sudokuCopy.cells[row][col].notes[val - 1]) {
					valid = false;
				}
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (sudokuCopy.cells[i][j].sees(sudokuCopy.cells[row][col]) && sudokuCopy.cells[i][j].digit == val) {
							valid = false;
						}
					}
				}
				if (valid) {
					break;
				}
			}

			for (let i = 0; i < index; i++) {
				let row1 = this.indexes[i * 2];
				let col1 = this.indexes[i * 2 + 1];
				while ((val - (index - i) < sudokuCopy.cells[row1][col1].digit && sudokuCopy.cells[row1][col1].digit !== 0) || (val - (index - i) < this.minVal(row1, col1, useCopy) && sudokuCopy.cells[row1][col1].digit == 0)) {
					val++;
				}
			}

			return val;
		} else {
			for (val = index + 1; val <= 9; val++) {
				let valid = true;
				if (!sudoku.cells[row][col].notes[val - 1]) {
					valid = false;
				}
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (sudoku.cells[i][j].sees(sudoku.cells[row][col]) && sudoku.cells[i][j].digit == val) {
							valid = false;
						}
					}
				}
				if (valid) {
					break;
				}
			}

			for (let i = 0; i < index; i++) {
				let row1 = this.indexes[i * 2];
				let col1 = this.indexes[i * 2 + 1];
				while ((val - (index - i) < sudoku.cells[row1][col1].digit && sudoku.cells[row1][col1].digit !== 0) || (val - (index - i) < this.minVal(row1, col1, useCopy) && sudoku.cells[row1][col1].digit == 0)) {
					val++;
				}
			}

			return val;
		}
	}

	maxVal = function(row, col, useCopy) {
		let index = this.thermoIndex(row, col);
		let val;

		if (useCopy) {
			for (val = 10 - this.cells + index; val > 0; val--) {
				let valid = true;
				if (!sudokuCopy.cells[row][col].notes[val - 1]) {
					valid = false;
				}
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (sudokuCopy.cells[i][j].sees(sudokuCopy.cells[row][col]) && sudokuCopy.cells[i][j].digit == val) {
							valid = false;
						}
					}
				}
				if (valid) {
					break;
				}
			}

			for (let i = index + 1; i < this.cells; i++) {
				let row1 = this.indexes[i * 2];
				let col1 = this.indexes[i * 2 + 1];
				while ((val + (i - index) > sudokuCopy.cells[row1][col1].digit && sudokuCopy.cells[row1][col1].digit !== 0) || (val + (i - index) > this.maxVal(row1, col1, useCopy) && sudokuCopy.cells[row1][col1].digit == 0)) {
					val--;
				}
			}

			return val;
		} else {
			for (val = 10 - this.cells + index; val > 0; val--) {
				let valid = true;
				if (!sudoku.cells[row][col].notes[val - 1]) {
					valid = false;
				}
				for (let i = 0; i < 9; i++) {
					for (let j = 0; j < 9; j++) {
						if (sudoku.cells[i][j].sees(sudoku.cells[row][col]) && sudoku.cells[i][j].digit == val) {
							valid = false;
						}
					}
				}
				if (valid) {
					break;
				}
			}

			for (let i = index + 1; i < this.cells; i++) {
				let row1 = this.indexes[i * 2];
				let col1 = this.indexes[i * 2 + 1];
				while ((val + (i - index) > sudoku.cells[row1][col1].digit && sudoku.cells[row1][col1].digit !== 0) || (val + (i - index) > this.maxVal(row1, col1, useCopy) && sudoku.cells[row1][col1].digit == 0)) {
					val--;
				}
			}

			return val;
		}
	}

	breaks = function(num, row, col, useCopy) {
		let min = this.minVal(row, col, useCopy);
		let max = this.maxVal(row, col, useCopy);

		return (num < min || num > max);
	}

	inOrder = function() {
		for (let i = 0; i < this.cells; i++) {
			let row = this.indexes[i * 2];
			let col = this.indexes[i * 2 + 1];

			for (let j = 0; j < this.cells; j++) {
				let row1 = this.indexes[j * 2];
				let col1 = this.indexes[j * 2 + 1];

				if (j < i) {
					if (sudoku.cells[row1][col1].digit > sudoku.cells[row][col].digit) {
						return false;
					}
				} else if (j > i) {
					if (sudoku.cells[row1][col1].digit < sudoku.cells[row][col].digit) {
						return false;
					}
				}
			}
		}

		return true;
	}

	show = function() {
		noStroke();
		fill(50, 50, 50, 50);
		if (this.cells > 0) {
			ellipse(this.indexes[1] * width / 9 + width / 18, this.indexes[0] * height / 9 + height / 18, 70);
		}

		strokeWeight(20);
		stroke(50, 50, 50, 50);
		if (this.cells > 1) {
			for (let i = 0; i < this.cells - 1; i++) {
				line(this.indexes[i * 2 + 1] * width / 9 + width / 18, this.indexes[i * 2] * height / 9 + height / 18, this.indexes[(i + 1) * 2 + 1] * width / 9 + width / 18, this.indexes[(i + 1) * 2] * height / 9 + height / 18);
			}
		}
	}
}
