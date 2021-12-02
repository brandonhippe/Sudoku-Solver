class Grid {
	constructor(copy = false) {
		this.cells = new Array(9);

		for (let i = 0; i < 9; i++) {
	      this.cells[i] = new Array(9);
	   }

	   for (let i = 0; i < 9; i++) {
	      for (let j = 0; j < 9; j++) {
	         this.cells[i][j] = new Cell(i + 1, j + 1);
	      }
	   }

		this.isCopy = copy;
		this.solved = false;
		this.sovleCount = 0;
		this.visibleHighlight = true;

		if (this.isCopy) {
			this.copy();
		}
	}

	show = function() {
		if (x == -1 && y == -1)  {
			this.visibleHighlight = false;
		} else  {
			this.visibleHighlight = true;
		}

		this.clicked();

		stroke(0);
	   fill(255);

	   strokeWeight(8);
	   push();
		for (let i = 0; i < 3; i++) {
	      for (let j = 0; j < 3; j++) {
	         rect(0, 0, width / 3, height / 3);

	         translate(width / 3, 0);
	      }

	      translate(-width, height / 3);
	   }
	   pop();

		noFill();

	   strokeWeight(4);
	   push();
		for (let i = 0; i < 9; i++) {
	      for (let j = 0; j < 9; j++) {
	         rect(0, 0, width / 9, height / 9);

	         translate(width / 9, 0);
	      }

	      translate(-width, height / 9);
	   }
	   pop();

		for (let i = 0; i < 9; i++) {
	      for (let j = 0; j < 9; j++) {
	         sudoku.cells[i][j].show();
	      }
	   }

		if (thermo) {
			for (let i = 0; i < thermometers.length; i++) {
				thermometers[i].show();
			}
		}
	}

	copy = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				this.cells[i][j] = sudoku.cells[i][j];
			}
		}
	}

	compareColor = function(c1, c2) {
		return (red(c1) == red(c2) && green(c1) == green(c2) && blue(c1) == blue(c2));
	}

	placeDigit = function(row, col, val) {
		if (this.cells[row][col].notes[val - 1]) {
	      this.cells[row][col].placeDigit(val);
			if (thermo) {
				this.thermoNotes();
				this.updateGrid();
			}
			this.updateNotes(row, col, val);
		}
   }

	removeDigit = function(row, col) {
		let pVal = this.cells[row][col].digit
		this.cells[row][col].digit = 0;

		for (let i = 0; i < 9; i++) {
			this.cells[row][col].notes[i] = true;
		}
		this.cells[row][col].numPossible = 9;

		for (let num = 1; num <= 9; num++) {
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					if (this.cells[i][j].sees(this.cells[row][col]) && this.cells[i][j].digit == num && this.cells[row][col].notes[num - 1]) {
						this.cells[row][col].notes[num - 1] = false;
						this.cells[row][col].numPossible--;
					}
				}
			}
		}

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].sees(this.cells[row][col]) && !this.cells[i][j].notes[pVal - 1] && this.cells[i][j].digit == 0) {
					let valid = true;
					for (let a = 0; a < 9; a++) {
						for (let b = 0; b < 9; b++) {
							if (this.cells[a][b].sees(this.cells[i][j]) && this.cells[a][b].digit == pVal) {
								valid = false;
							}
						}
					}

					if (valid) {
						this.cells[i][j].notes[pVal - 1] = true;
						this.cells[i][j].numPossible++;
					}
				}
			}
		}

		if (thermo) {
			this.thermoNotes();
			this.updateGrid();
		}
	}

	updateNotes = function(row, col, val) {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].sees(this.cells[row][col]) && this.cells[i][j].digit == 0) {
					if (this.cells[i][j].notes[val - 1]) {
						this.cells[i][j].notes[val - 1] = false;
						this.cells[i][j].numPossible--;
					}
				}
			}
		}
	}

	clicked = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				this.cells[i][j].selected = false;
			}
		}

		if (this.visibleHighlight) {
			this.cells[y][x].selected = true;
		}
	}

	checkValid = function(row, col, num) {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].digit == num && this.cells[i][j].sees(this.cells[row][col])) {
					return false;
				}
			}
		}

		if (thermo) {
			for (let i = 0; i < thermometers.length; i++) {
				if (thermometers[i].onThermo(row, col)) {
					let min = thermometers[i].minVal(row, col, this.isCopy);
					let max = thermometers[i].maxVal(row, col, this.isCopy);

					if (num < min || num > max) {
						return false;
					}
				}
			}
		}

		return true;
	}

	gridFromBox = function(box, index, xAxis) {
		return (xAxis) ? (3 * ((box - 1) % 3) + (index % 3)) : (3 * floor((box - 1) / 3) + floor(index / 3));
	}

	removeYellowNotes = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].digit == 0) {
					for (let k = 0; k < 9; k++) {
						if (this.cells[i][j].notes[k] && this.compareColor(this.cells[i][j].noteHighlight[k], color('yellow'))) {
							this.cells[i][j].noteHighlight[k] = color("white");
						}
					}
				}
			}
		}
	}

	updateGrid = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].digit == 0) {
					for (let k = 0; k < 9; k++) {
						if (this.cells[i][j].notes[k]) {
							if (this.compareColor(this.cells[i][j].noteHighlight[k], color('green'))) {
								this.cells[i][j].digitHighlight = color('blue');
								this.placeDigit(i, j, k + 1);
								this.cells[i][j].noteHighlight[k] = color("white");
								this.changed = true;
							} else if (this.compareColor(this.cells[i][j].noteHighlight[k], color('red'))) {
								this.cells[i][j].notes[k] = false;
								this.cells[i][j].numPossible--;
								this.cells[i][j].noteHighlight[k] = color("white");
								this.changed = true;
							}
						}
					}
				}
			}
		}

		this.removeYellowNotes();
	}

	nakedSingles = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].numPossible == 1 && this.cells[i][j].digit == 0) {
					for (let k = 0; k < 9; k++) {
						if (this.cells[i][j].notes[k]) {
							this.cells[i][j].changeColor(color("green"), k + 1);
							this.changed = true;
						}
					}
				}
			}
		}
	}

	hiddenSingles = function() {
		for (let num = 1; num <= 9; num++) {
			for (let i = 0; i < 9; i++) {
				let rowSum = 0;
				let colSum = 0;
				let boxSum = 0;
				for (let j = 0; j < 9; j++) {
					let row = this.gridFromBox(i + 1, j, false);
					let col = this.gridFromBox(i + 1, j, true);

					rowSum += (this.cells[i][j].notes[num - 1]) ? 1 : 0;
					colSum += (this.cells[j][i].notes[num - 1]) ? 1 : 0;
					boxSum += (this.cells[row][col].notes[num - 1]) ? 1 : 0;
				}

				if (rowSum == 1) {
					for (let j = 0; j < 9; j++) {
						if (this.cells[i][j].notes[num - 1] && this.cells[i][j].digit == 0) {
							this.cells[i][j].changeColor(color("green"), num);
							this.changed = true;
							break;
						}
					}
				}

				if (colSum == 1) {
					for (let j = 0; j < 9; j++) {
						if (this.cells[j][i].notes[num - 1] && this.cells[j][i].digit == 0) {
							this.cells[j][i].changeColor(color("green"), num);
							this.changed = true;
							break;
						}
					}
				}

				if (boxSum == 1) {
					for (let j = 0; j < 9; j++) {
						let row = this.gridFromBox(i + 1, j, false);
						let col = this.gridFromBox(i + 1, j, true);
						if (this.cells[row][col].notes[num - 1] && this.cells[row][col].digit == 0) {
							this.cells[row][col].changeColor(color("green"), num);
							this.changed = true;
							break;
						}
					}
				}
			}
		}
	}

	nakedPairTrip = function() {
		for (let a = 0; a <= 7; a++) {
			for (let b = a + 1; b <= 8; b++) {
				for (let c = b + 1; c <= 9; c++) {
					for (let row = 0; row < 9; row++) {
						// Check for pairs/triples in row
						let index = [];
						for (let col = 0; col < 9; col++) {
							if (this.cells[row][col].numPossible <= 3 && this.cells[row][col].digit == 0) {
								let notesContained = true;
								for (let k = 1; k <= 9; k++) {
									if ((a == 0 && this.cells[row][col].notes[k - 1] && k !== b && k !== c) || (a !== 0 && this.cells[row][col].notes[k - 1] && k !== a && k !== b && k !== c)) {
										notesContained = false;
										break;
									}
								}

								if (notesContained) {
									index.push(col);
								}
							}
						}

						if (a == 0 && index.length == 2) {
							for (let col = 0; col < 9; col++) {
								if (!(col == index[0] || col == index[1])) {
									if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let col = 0; col < 9; col++) {
									if (col == index[0] || col == index[1]) {
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						} else if (a != 0 && index.length == 3) {
							for (let col = 0; col < 9; col++) {
								if (!(col == index[0] || col == index[1] || col == index[2])) {
									if (this.cells[row][col].notes[a - 1]) {
										this.cells[row][col].changeColor(color("red"), a);
										this.changed = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let col = 0; col < 9; col++) {
									if (col == index[0] || col == index[1] || col == index[2]) {
										if (this.cells[row][col].notes[a - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), a);
										}
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						}
					}

					for (let col = 0; col < 9; col++) {
						// Check for pairs/triples in col
						let index = [];
						for (let row = 0; row < 9; row++) {
							if (this.cells[row][col].numPossible <= 3 && this.cells[row][col].digit == 0) {
								let notesContained = true;
								for (let k = 1; k <= 9; k++) {
									if ((a == 0 && this.cells[row][col].notes[k - 1] && k !== b && k !== c) || (a !== 0 && this.cells[row][col].notes[k - 1] && k !== a && k !== b && k !== c)) {
										notesContained = false;
										break;
									}
								}

								if (notesContained) {
									index.push(row);
								}
							}
						}

						if (a == 0 && index.length == 2) {
							for (let row = 0; row < 9; row++) {
								if (!(row == index[0] || row == index[1])) {
									if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let row = 0; row < 9; row++) {
									if (row == index[0] || row == index[1]) {
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						} else if (a != 0 && index.length == 3) {
							for (let row = 0; row < 9; row++) {
								if (!(row == index[0] || row == index[1] || row == index[2])) {
									if (this.cells[row][col].notes[a - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), a);
										this.changed = true;
									}
									if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let row = 0; row < 9; row++) {
									if (row == index[0] || row == index[1] || row == index[2]) {
										if (this.cells[row][col].notes[a - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), a);
										}
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						}
					}

					for (let box = 1; box <= 9; box++) {
						// Check for pairs/triples in box
						let index = [];
						for (let i = 0; i < 9; i++) {
							let row = this.gridFromBox(box, i, false);
							let col = this.gridFromBox(box, i, true);
							if (this.cells[row][col].numPossible <= 3 && this.cells[row][col].digit == 0) {
								let notesContained = true;
								for (let k = 1; k <= 9; k++) {
									if ((a == 0 && this.cells[row][col].notes[k - 1] && k !== b && k !== c) || (a !== 0 && this.cells[row][col].notes[k - 1] && k !== a && k !== b && k !== c)) {
										notesContained = false;
										break;
									}
								}

								if (notesContained) {
									index.push(i);
								}
							}
						}

						if (a == 0 && index.length == 2) {
							for (let j = 0; j < 9; j++) {
								let row = this.gridFromBox(box, j, false);
								let col = this.gridFromBox(box, j, true);
								if (!(j == index[0] || j == index[1])) {
									if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let j = 0; j < 9; j++) {
									let row = this.gridFromBox(box, j, false);
									let col = this.gridFromBox(box, j, true);
									if (j == index[0] || j == index[1]) {
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						} else if (a != 0 && index.length == 3) {
							for (let j = 0; j < 9; j++) {
								let row = this.gridFromBox(box, j, false);
								let col = this.gridFromBox(box, j, true);
								if (!(j == index[0] || j == index[1] || j == index[2])) {
									if (this.cells[row][col].notes[a - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), a);
										this.changed = true;
									}
									if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), b);
										this.changed = true;
									}
									if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
										this.cells[row][col].changeColor(color("red"), c);
										this.changed = true;
									}
								}
							}

							if (this.changed) {
								for (let j = 0; j < 9; j++) {
									let row = this.gridFromBox(box, j, false);
									let col = this.gridFromBox(box, j, true);
									if (j == index[0] || j == index[1] || j == index[2]) {
										if (this.cells[row][col].notes[a - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), a);
										}
										if (this.cells[row][col].notes[b - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), b);
										}
										if (this.cells[row][col].notes[c - 1] && this.cells[row][col].digit == 0) {
											this.cells[row][col].changeColor(color("yellow"), c);
										}
									}
								}

								return;
							}
						}
					}
				}
			}
		}
	}

	hiddenPairTrip = function() {
		for (let a = 0; a <= 7; a++) {
			for (let b = a + 1; b <= 8; b++) {
				for (let c = b + 1; c <= 9; c++) {
					for (let row = 0; row < 9; row++) {
						let index = [];
						let broken = false;
						let contains = [];
						for (let col = 0; col < 9; col++) {
							let count = 0;
							if (this.cells[row][col].digit == 0) {
								if (a == 0) {
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[1] = true;
									}
								} else {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
								}
							}

							if (count >= 2) {
								index.push(col);
							} else if (count == 1) {
								broken = true;
								break;
							}
						}

						if (!broken) {
							if (a == 0 && index.length == 2  && contains[0] && contains[1]) {
								for (let i = 0; i < 9; i++) {
									if (this.cells[row][index[0]].notes[i] && this.cells[row][index[0]].numPossible > 2) {
										if (i == b - 1 || i == c - 1) {
											this.cells[row][index[0]].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[row][index[0]].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[row][index[1]].notes[i] && this.cells[row][index[1]].numPossible > 2) {
										if (i == b - 1 || i == c - 1) {
											this.cells[row][index[1]].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[row][index[1]].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
								}
							} else if (a !== 0 && index.length == 3  && contains[0] && contains[1] && contains[2]) {
								for (let i = 0; i < 9; i++) {
									if (this.cells[row][index[0]].notes[i] && this.cells[row][index[0]].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[row][index[0]].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[row][index[0]].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[row][index[1]].notes[i] && this.cells[row][index[1]].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[row][index[1]].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[row][index[1]].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[row][index[2]].notes[i] && this.cells[row][index[2]].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[row][index[2]].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[row][index[2]].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
								}
							}

							if (this.changed) {
								return;
							}
						}
					}

					for (let col = 0; col < 9; col++) {
						let index = [];
						let broken = false;
						let contains = [];
						for (let row = 0; row < 9; row++) {
							let count = 0;
							if (this.cells[row][col].digit == 0) {
								if (a == 0) {
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[1] = true;
									}
								} else {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
								}
							}

							if (count >= 2) {
								index.push(row);
							} else if (count == 1) {
								broken = true;
								break;
							}
						}

						if (!broken) {
							if (a == 0 && index.length == 2  && contains[0] && contains[1]) {
								for (let i = 0; i < 9; i++) {
									if (this.cells[index[0]][col].notes[i] && this.cells[index[0]][col].numPossible > 2) {
										if (i == b - 1 || i == c - 1) {
											this.cells[index[0]][col].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[index[0]][col].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[index[1]][col].notes[i] && this.cells[index[0]][col].numPossible > 2) {
										if (i == b - 1 || i == c - 1) {
											this.cells[index[1]][col].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[index[1]][col].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
								}
							} else if (a !== 0 && index.length == 3  && contains[0] && contains[1] && contains[2]) {
								for (let i = 0; i < 9; i++) {
									if (this.cells[index[0]][col].notes[i] && this.cells[index[0]][col].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[index[0]][col].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[index[0]][col].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[index[1]][col].notes[i] && this.cells[index[1]][col].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[index[1]][col].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[index[1]][col].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
									if (this.cells[index[2]][col].notes[i] && this.cells[index[2]][col].numPossible > 3) {
										if (i == a - 1 || i == b - 1 || i == c - 1) {
											this.cells[index[2]][col].changeColor(color("yellow"), i + 1);
										} else {
											this.cells[index[2]][col].changeColor(color("red"), i + 1);
											this.changed = true;
										}
									}
								}
							}

							if (this.changed) {
								return;
							}
						}
					}

					for (let box = 1; box <= 9; box++) {
						let index = [];
						let broken = false;
						let contains = [];
						for (let i = 0; i < 9; i++) {
							let row = this.gridFromBox(box, i, false);
							let col = this.gridFromBox(box, i, true);
							let count = 0;
							if (this.cells[row][col].digit == 0) {
								if (a == 0) {
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[1] = true;
									}
								} else {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
								}
							}

							if (count >= 2) {
								index.push(i);
							} else if (count == 1) {
								broken = true;
								break;
							}
						}

						if (!broken) {
							if (a == 0 && index.length == 2 && contains[0] && contains[1]) {
								let row1 = this.gridFromBox(box, index[0], false);
								let col1 = this.gridFromBox(box, index[0], true);
								let row2 = this.gridFromBox(box, index[1], false);
								let col2 = this.gridFromBox(box, index[1], true);
								for (let j = 0; j < 9; j++) {
									if (this.cells[row1][col1].notes[j] && this.cells[row1][col1].numPossible > 2) {
										if (j == b - 1 || j == c - 1) {
											this.cells[row1][col1].changeColor(color("yellow"), j + 1);
										} else {
											this.cells[row1][col1].changeColor(color("red"), j + 1);
											this.changed = true;
										}
									}
									if (this.cells[row2][col2].notes[j] && this.cells[row2][col2].numPossible > 2) {
										if (j == b - 1 || j == c - 1) {
											this.cells[row2][col2].changeColor(color("yellow"), j + 1);
										} else {
											this.cells[row2][col2].changeColor(color("red"), j + 1);
											this.changed = true;
										}
									}
								}
							} else if (a !== 0 && index.length == 3  && contains[0] && contains[1] && contains[2]) {
								let row1 = this.gridFromBox(box, index[0], false);
								let col1 = this.gridFromBox(box, index[0], true);
								let row2 = this.gridFromBox(box, index[1], false);
								let col2 = this.gridFromBox(box, index[1], true);
								let row3 = this.gridFromBox(box, index[2], false);
								let col3 = this.gridFromBox(box, index[2], true);
								for (let j = 0; j < 9; j++) {
									if (this.cells[row1][col1].notes[j] && this.cells[row1][col1].numPossible > 3) {
										if (j == a - 1 || j == b - 1 || j == c - 1) {
											this.cells[row1][col1].changeColor(color("yellow"), j + 1);
										} else {
											this.cells[row1][col1].changeColor(color("red"), j + 1);
											this.changed = true;
										}
									}
									if (this.cells[row2][col2].notes[j]  && this.cells[row2][col2].numPossible > 3) {
										if (j == a - 1 || j == b - 1 || j == c - 1) {
											this.cells[row2][col2].changeColor(color("yellow"), j + 1);
										} else {
											this.cells[row2][col2].changeColor(color("red"), j + 1);
											this.changed = true;
										}
									}
									if (this.cells[row3][col3].notes[j] && this.cells[row3][col3].numPossible > 3) {
										if (j == a - 1 || j == b - 1 || j == c - 1) {
											this.cells[row3][col3].changeColor(color("yellow"), j + 1);
										} else {
											this.cells[row3][col3].changeColor(color("red"), j + 1);
											this.changed = true;
										}
									}
								}
							}

							if (this.changed) {
								return;
							}
						}
					}
				}
			}
		}
	}

	quads = function() {
		for (let a = 1; a <= 6; a++) {
			for (let b = a + 1; b <= 7; b++) {
				for (let c = b + 1; c <= 8; c++) {
					for (let d = c + 1; d <= 9; d++) {
						// Find naked Quads in Row
						for (let row = 0; row < 9; row++) {
							let count = 0;
							let index = [];
							let contains = [false, false, false, false];
							for (let col = 0; col < 9; col++) {
								if (this.cells[row][col].numPossible <= 4 && this.cells[row][col].digit == 0) {
									let broken = false;
									for (let i = 1; i <= 9; i++) {
										if (i !== a && i !== b && i !== c && i !== d && this.cells[row][col].notes[i - 1]) {
											broken = true;
											break;
										} else if (i == a && this.cells[row][col].notes[i - 1]){
											contains[0] = true;
										} else if (i == b && this.cells[row][col].notes[i - 1]){
											contains[1] = true;
										} else if (i == c && this.cells[row][col].notes[i - 1]){
											contains[2] = true;
										} else if (i == d && this.cells[row][col].notes[i - 1]){
											contains[3] = true;
										}
									}

									if (!broken) {
										index.push(col);
									}
								}
							}

							if (index.length == 4 && contains[0] && contains[1] && contains[2] && contains[3]) {
								for (let col = 0; col < 9; col++) {
									if (!(col == index[0] || col == index[1] || col == index[2] || col == index[3])) {
										if (this.cells[row][col].notes[a - 1]) {
											this.cells[row][col].changeColor(color("red"), a);
											this.changed = true;
										}
										if (this.cells[row][col].notes[b - 1]) {
											this.cells[row][col].changeColor(color("red"), b);
											this.changed = true;
										}
										if (this.cells[row][col].notes[c - 1]) {
											this.cells[row][col].changeColor(color("red"), c);
											this.changed = true;
										}
										if (this.cells[row][col].notes[d - 1]) {
											this.cells[row][col].changeColor(color("red"), d);
											this.changed = true;
										}
									}
								}

								if (this.changed) {
									for (let col = 0; col < 9; col++) {
										if (col == index[0] || col == index[1] || col == index[2] || col == index[3]) {
											if (this.cells[row][col].notes[a - 1]) {
												this.cells[row][col].changeColor(color("yellow"), a);
											}
											if (this.cells[row][col].notes[b - 1]) {
												this.cells[row][col].changeColor(color("yellow"), b);
											}
											if (this.cells[row][col].notes[c - 1]) {
												this.cells[row][col].changeColor(color("yellow"), c);
											}
											if (this.cells[row][col].notes[d - 1]) {
												this.cells[row][col].changeColor(color("yellow"), d);
											}
										}
									}

									return;
								}
							}
						}

						// Find naked Quads in Col
						for (let col = 0; col < 9; col++) {
							let count = 0;
							let index = [];
							let contains = [false, false, false, false];
							for (let row = 0; row < 9; row++) {
								if (this.cells[row][col].numPossible <= 4 && this.cells[row][col].digit == 0) {
									let broken = false;
									for (let i = 1; i <= 9; i++) {
										if (i !== a && i !== b && i !== c && i !== d && this.cells[row][col].notes[i - 1]) {
											broken = true;
											break;
										} else if (i == a && this.cells[row][col].notes[i - 1]){
											contains[0] = true;
										} else if (i == b && this.cells[row][col].notes[i - 1]){
											contains[1] = true;
										} else if (i == c && this.cells[row][col].notes[i - 1]){
											contains[2] = true;
										} else if (i == d && this.cells[row][col].notes[i - 1]){
											contains[3] = true;
										}
									}

									if (!broken) {
										index.push(row);
									}
								}
							}

							if (index.length == 4 && contains[0] && contains[1] && contains[2] && contains[3]) {
								for (let row = 0; row < 9; row++) {
									if (!(row == index[0] || row == index[1] || row == index[2] || row == index[3])) {
										if (this.cells[row][col].notes[a - 1]) {
											this.cells[row][col].changeColor(color("red"), a);
											this.changed = true;
										}
										if (this.cells[row][col].notes[b - 1]) {
											this.cells[row][col].changeColor(color("red"), b);
											this.changed = true;
										}
										if (this.cells[row][col].notes[c - 1]) {
											this.cells[row][col].changeColor(color("red"), c);
											this.changed = true;
										}
										if (this.cells[row][col].notes[d - 1]) {
											this.cells[row][col].changeColor(color("red"), d);
											this.changed = true;
										}
									}
								}

								if (this.changed) {
									for (let row = 0; row < 9; row++) {
										if (row == index[0] || row == index[1] || row == index[2] || row == index[3]) {
											if (this.cells[row][col].notes[a - 1]) {
												this.cells[row][col].changeColor(color("yellow"), a);
											}
											if (this.cells[row][col].notes[b - 1]) {
												this.cells[row][col].changeColor(color("yellow"), b);
											}
											if (this.cells[row][col].notes[c - 1]) {
												this.cells[row][col].changeColor(color("yellow"), c);
											}
											if (this.cells[row][col].notes[d - 1]) {
												this.cells[row][col].changeColor(color("yellow"), d);
											}
										}
									}

									return;
								}
							}
						}

						for (let box = 1; box <= 9; box++) {
							let count = 0;
							let index = [];
							let contains = [false, false, false, false];
							for (let i = 0; i < 9; i++) {
								let row = this.gridFromBox(box, i, false);
								let col = this.gridFromBox(box, i, true);
								if (this.cells[row][col].numPossible <= 4 && this.cells[row][col].digit == 0) {
									let broken = false;
									for (let j = 1; j <= 9; j++) {
										if (j !== a && j !== b && j !== c && j !== d && this.cells[row][col].notes[j - 1]) {
											broken = true;
											break;
										} else if (j == a && this.cells[row][col].notes[i - 1]){
											contains[0] = true;
										} else if (j == b && this.cells[row][col].notes[i - 1]){
											contains[1] = true;
										} else if (j == c && this.cells[row][col].notes[i - 1]){
											contains[2] = true;
										} else if (j == d && this.cells[row][col].notes[i - 1]){
											contains[3] = true;
										}
									}

									if (!broken) {
										index.push(i);
									}
								}
							}

							if (index.length == 4 && contains[0] && contains[1] && contains[2] && contains[3]) {
								for (let i = 0; i < 9; i++) {
									let row = this.gridFromBox(box, i, false);
									let col = this.gridFromBox(box, i, true);
									if (!(i == index[0] || i == index[1] || i == index[2] || i == index[3])) {
										if (this.cells[row][col].notes[a - 1]) {
											this.cells[row][col].changeColor(color("red"), a);
											this.changed = true;
										}
										if (this.cells[row][col].notes[b - 1]) {
											this.cells[row][col].changeColor(color("red"), b);
											this.changed = true;
										}
										if (this.cells[row][col].notes[c - 1]) {
											this.cells[row][col].changeColor(color("red"), c);
											this.changed = true;
										}
										if (this.cells[row][col].notes[d - 1]) {
											this.cells[row][col].changeColor(color("red"), d);
											this.changed = true;
										}
									}
								}

								if (this.changed) {
									for (let i = 0; i < 9; i++) {
										let row = this.gridFromBox(box, i, false);
										let col = this.gridFromBox(box, i, true);
										if (i == index[0] || i == index[1] || i == index[2] || i == index[3]) {
											if (this.cells[row][col].notes[a - 1]) {
												this.cells[row][col].changeColor(color("yellow"), a);
											}
											if (this.cells[row][col].notes[b - 1]) {
												this.cells[row][col].changeColor(color("yellow"), b);
											}
											if (this.cells[row][col].notes[c - 1]) {
												this.cells[row][col].changeColor(color("yellow"), c);
											}
											if (this.cells[row][col].notes[d - 1]) {
												this.cells[row][col].changeColor(color("yellow"), d);
											}
										}
									}

									return;
								}
							}
						}

						// Find hidden quads in row
						for (let row = 0; row < 9; row++) {
							let index = [];
							let broken = false;
							let contains = [];
							for (let col = 0; col < 9; col++) {
								let count = 0;
								if (this.cells[row][col].digit == 0) {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
									if (this.cells[row][col].notes[d - 1]) {
										count++;
										contains[3] = true;
									}
								}

								if (count >= 2) {
									index.push(col);
								} else if (count == 1) {
									broken = true;
									break;
								}
							}

							if (!broken) {
								if (index.length == 4  && contains[0] && contains[1] && contains[2] && contains[3]) {
									for (let i = 0; i < 9; i++) {
										if (this.cells[row][index[0]].notes[i] && this.cells[row][index[0]].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[row][index[0]].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[row][index[0]].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[row][index[1]].notes[i] && this.cells[row][index[1]].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[row][index[1]].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[row][index[1]].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[row][index[2]].notes[i] && this.cells[row][index[2]].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[row][index[2]].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[row][index[2]].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[row][index[3]].notes[i] && this.cells[row][index[3]].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[row][index[3]].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[row][index[3]].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
									}
								}

								if (this.changed) {
									return;
								}
							}
						}

						// Find hidden quads in col
						for (let col = 0; col < 9; col++) {
							let index = [];
							let broken = false;
							let contains = [];
							for (let row = 0; row < 9; row++) {
								let count = 0;
								if (this.cells[row][col].digit == 0) {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
									if (this.cells[row][col].notes[d - 1]) {
										count++;
										contains[3] = true;
									}
								}

								if (count >= 2) {
									index.push(row);
								} else if (count == 1) {
									broken = true;
									break;
								}
							}

							if (!broken) {
								if (index.length == 4  && contains[0] && contains[1] && contains[2] && contains[3]) {
									for (let i = 0; i < 9; i++) {
										if (this.cells[index[0]][col].notes[i] && this.cells[index[0]][col].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[index[0]][col].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[index[0]][col].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[index[1]][col].notes[i] && this.cells[index[1]][col].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[index[1]][col].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[index[1]][col].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[index[2]][col].notes[i] && this.cells[index[2]][col].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[index[2]][col].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[index[2]][col].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
										if (this.cells[index[3]][col].notes[i] && this.cells[index[3]][col].numPossible > 4) {
											if (i == a - 1 || i == b - 1 || i == c - 1 || i == d - 1) {
												this.cells[index[3]][col].changeColor(color("yellow"), i + 1);
											} else {
												this.cells[index[3]][col].changeColor(color("red"), i + 1);
												this.changed = true;
											}
										}
									}
								}

								if (this.changed) {
									return;
								}
							}
						}

						// Find hidden quads in box
						for (let box = 1; box <= 9; box++) {
							let index = [];
							let broken = false;
							let contains = [];
							for (let i = 0; i < 9; i++) {
								let row = this.gridFromBox(box, i, false);
								let col = this.gridFromBox(box, i, true);
								let count = 0;
								if (this.cells[row][col].digit == 0) {
									if (this.cells[row][col].notes[a - 1]) {
										count++;
										contains[0] = true;
									}
									if (this.cells[row][col].notes[b - 1]) {
										count++;
										contains[1] = true;
									}
									if (this.cells[row][col].notes[c - 1]) {
										count++;
										contains[2] = true;
									}
									if (this.cells[row][col].notes[d - 1]) {
										count++;
										contains[3] = true;
									}
								}

								if (count >= 2) {
									index.push(i);
								} else if (count == 1) {
									broken = true;
									break;
								}
							}

							if (!broken) {
								if (index.length == 4  && contains[0] && contains[1] && contains[2] && contains[3]) {
									let row1 = this.gridFromBox(box, index[0], false);
									let col1 = this.gridFromBox(box, index[0], true);
									let row2 = this.gridFromBox(box, index[1], false);
									let col2 = this.gridFromBox(box, index[1], true);
									let row3 = this.gridFromBox(box, index[2], false);
									let col3 = this.gridFromBox(box, index[2], true);
									let row4 = this.gridFromBox(box, index[3], false);
									let col4 = this.gridFromBox(box, index[3], true);
									for (let j = 0; j < 9; j++) {
										if (this.cells[row1][col1].notes[j] && this.cells[row1][col1].numPossible > 4) {
											if (j == a - 1 || j == b - 1 || j == c - 1 || j == d - 1) {
												this.cells[row1][col1].changeColor(color("yellow"), j + 1);
											} else {
												this.cells[row1][col1].changeColor(color("red"), j + 1);
												this.changed = true;
											}
										}
										if (this.cells[row2][col2].notes[j] && this.cells[row2][col2].numPossible > 4) {
											if (j == a - 1 || j == b - 1 || j == c - 1 || j == d - 1) {
												this.cells[row2][col2].changeColor(color("yellow"), j + 1);
											} else {
												this.cells[row2][col2].changeColor(color("red"), j + 1);
												this.changed = true;
											}
										}
										if (this.cells[row3][col3].notes[j] && this.cells[row3][col3].numPossible > 4) {
											if (j == a - 1 || j == b - 1 || j == c - 1 || j == d - 1) {
												this.cells[row3][col3].changeColor(color("yellow"), j + 1);
											} else {
												this.cells[row3][col3].changeColor(color("red"), j + 1);
												this.changed = true;
											}
										}
										if (this.cells[row4][col4].notes[j] && this.cells[row4][col4].numPossible > 4) {
											if (j == a - 1 || j == b - 1 || j == c - 1 || j == d - 1) {
												this.cells[row4][col4].changeColor(color("yellow"), j + 1);
											} else {
												this.cells[row4][col4].changeColor(color("red"), j + 1);
												this.changed = true;
											}
										}
									}
								}

								if (this.changed) {
									return;
								}
							}
						}
					}
 				}
			}
		}
	}

	pointing = function() {
		for (let num = 1; num <= 9; num++) {
			// Pair/Triple in row acting on box
			for (let row = 0; row < 9; row++) {
				let index = [];
				for (let col = 0; col < 9; col++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(col);
					}
				}

				if (index.length == 2 && this.cells[row][index[0]].box == this.cells[row][index[1]].box) {
					for (let i = 0; i < 9; i++) {
						let row1 = this.gridFromBox(this.cells[row][index[0]].box, i, false);
						let col = this.gridFromBox(this.cells[row][index[0]].box, i, true);
						if (row1 !== row && this.cells[row1][col].notes[num - 1]) {
							this.cells[row1][col].changeColor(color("red"), num);
							this.changed = true;
						}
					}

					if (this.changed) {
						for (let i = 0; i < 9; i++) {
							let row1 = this.gridFromBox(this.cells[row][index[0]].box, i, false);
							let col = this.gridFromBox(this.cells[row][index[0]].box, i, true);
							if (row1 == row) {
								this.cells[row1][col].changeColor(color("yellow"), num);
							}
						}

						return;
					}
				} else if (index.length == 3 && this.cells[row][index[0]].box == this.cells[row][index[1]].box && this.cells[row][index[1]].box == this.cells[row][index[2]].box) {
					for (let i = 0; i < 9; i++) {
						let row1 = this.gridFromBox(this.cells[row][index[0]].box, i, false);
						let col = this.gridFromBox(this.cells[row][index[0]].box, i, true);
						if (row1 !== row && this.cells[row1][col].notes[num - 1]) {
							this.cells[row1][col].changeColor(color("red"), num);
							this.changed = true;
						}
					}

					if (this.changed) {
						for (let i = 0; i < 9; i++) {
							let row1 = this.gridFromBox(this.cells[row][index[0]].box, i, false);
							let col = this.gridFromBox(this.cells[row][index[0]].box, i, true);
							if (row1 == row) {
								this.cells[row1][col].changeColor(color("yellow"), num);
							}
						}

						return;
					}
				}
			}

			// //Pair/Triple in col acting on box
			for (let col = 0; col < 9; col++) {
				let index = [];
				for (let row = 0; row < 9; row++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(row);
					}
				}

				if (index.length == 2 && this.cells[index[0]][col].box == this.cells[index[1]][col].box) {
					for (let i = 0; i < 9; i++) {
						let row = this.gridFromBox(this.cells[index[0]][col].box, i, false);
						let col1 = this.gridFromBox(this.cells[index[0]][col].box, i, true);
						if (col1 !== col && this.cells[row][col1].notes[num - 1]) {
							this.cells[row][col1].changeColor(color("red"), num);
							this.changed = true;
						}
					}

					if (this.changed) {
						for (let i = 0; i < 9; i++) {
							let row = this.gridFromBox(this.cells[index[0]][col].box, i, false);
							let col1 = this.gridFromBox(this.cells[index[0]][col].box, i, true);
							if (col1 == col) {
								this.cells[row][col1].changeColor(color("yellow"), num);
							}
						}

						return;
					}
				} else if (index.length == 3 && this.cells[index[0]][col].box == this.cells[index[1]][col].box && this.cells[index[1]][col].box == this.cells[index[2]][col].box) {
					for (let i = 0; i < 9; i++) {
						let row = this.gridFromBox(this.cells[index[0]][col].box, i, false);
						let col1 = this.gridFromBox(this.cells[index[0]][col].box, i, true);
						if (col1 !== col && this.cells[row][col1].notes[num - 1]) {
							this.cells[row][col1].changeColor(color("red"), num);
							this.changed = true;
						}
					}

					if (this.changed) {
						for (let i = 0; i < 9; i++) {
							let row = this.gridFromBox(this.cells[index[0]][col].box, i, false);
							let col1 = this.gridFromBox(this.cells[index[0]][col].box, i, true);
							if (col1 == col) {
								this.cells[row][col1].changeColor(color("yellow"), num);
							}
						}

						return;
					}
				}
			}

			// Pair/Triple in box acting on row
			for (let box = 1; box <= 9; box++) {
				let index = [];
				for (let i = 0; i < 9; i++) {
					let row = this.gridFromBox(box, i, false);
					let col = this.gridFromBox(box, i, true);
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(i);
					}
				}

				if (index.length == 2) {
					let row1 = this.gridFromBox(box, index[0], false);
					let col1 = this.gridFromBox(box, index[0], true);
					let row2 = this.gridFromBox(box, index[1], false);
					let col2 = this.gridFromBox(box, index[1], true);
					if (row1 == row2) {
						for (let k = 0; k < 9; k++) {
							if (k !== col1 && k !== col2 && this.cells[row1][k].notes[num - 1]) {
								this.cells[row1][k].changeColor(color("red"), num);
								this.changed = true;
							}
						}

						if (this.changed) {
							for (let k = 0; k < 9; k++) {
								if (k == col1 || k == col2) {
									this.cells[row1][k].changeColor(color("yellow"), num);
								}
							}

							return;
						}
					}
				} else if (index.length == 3) {
					let row1 = this.gridFromBox(box, index[0], false);
					let col1 = this.gridFromBox(box, index[0], true);
					let row2 = this.gridFromBox(box, index[1], false);
					let col2 = this.gridFromBox(box, index[1], true);
					let row3 = this.gridFromBox(box, index[2], false);
					let col3 = this.gridFromBox(box, index[2], true);
					if (row1 == row2 && row2 == row3) {
						for (let k = 0; k < 9; k++) {
							if (k !== col1 && k !== col2 && k !== col3 && this.cells[row1][k].notes[num - 1]) {
								this.cells[row1][k].changeColor(color("red"), num);
								this.changed = true;
							}
						}

						if (this.changed) {
							for (let k = 0; k < 9; k++) {
								if (k == col1 || k == col2 || k == col3) {
									this.cells[row1][k].changeColor(color("yellow"), num);
								}
							}

							return;
						}
					}
				}
			}

			// Pair/Triple in box acting on col
			for (let box = 1; box <= 9; box++) {
				let index = [];
				for (let i = 0; i < 9; i++) {
					let row = this.gridFromBox(box, i, false);
					let col = this.gridFromBox(box, i, true);
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(i);
					}
				}

				if (index.length == 2) {
					let row1 = this.gridFromBox(box, index[0], false);
					let col1 = this.gridFromBox(box, index[0], true);
					let row2 = this.gridFromBox(box, index[1], false);
					let col2 = this.gridFromBox(box, index[1], true);
					if (col1 == col2) {
						for (let k = 0; k < 9; k++) {
							if (k !== row1 && k !== row2 && this.cells[k][col1].notes[num - 1]) {
								this.cells[k][col1].changeColor(color("red"), num);
								this.changed = true;
							}
						}

						if (this.changed) {
							for (let k = 0; k < 9; k++) {
								if (k == row1 || k == row2) {
									this.cells[k][col1].changeColor(color("yellow"), num);
								}
							}

							return;
						}
					}
				} else if (index.length == 3) {
					let row1 = this.gridFromBox(box, index[0], false);
					let col1 = this.gridFromBox(box, index[0], true);
					let row2 = this.gridFromBox(box, index[1], false);
					let col2 = this.gridFromBox(box, index[1], true);
					let row3 = this.gridFromBox(box, index[2], false);
					let col3 = this.gridFromBox(box, index[2], true);
					if (col1 == col2 && col2 == col3) {
						for (let k = 0; k < 9; k++) {
							if (k !== row1 && k !== row2 && k !== row3 && this.cells[k][col1].notes[num - 1]) {
								this.cells[k][col1].changeColor(color("red"), num);
								this.changed = true;
							}
						}

						if (this.changed) {
							for (let k = 0; k < 9; k++) {
								if (k == row1 || k == row2 || k == row3) {
									this.cells[k][col1].changeColor(color("yellow"), num);
								}
							}

							if (this.changed) {
								return;
							}
						}
					}
				}
			}
		}
	}

	xWing = function() {
		for (let num = 1; num <= 9; num++) {
			for (let row = 0; row < 9; row++) {
				let cols = [];
				for (let col = 0; col < 9; col++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						cols.push(col);
					}
				}

				if (cols.length == 2) {
					for (let row1 = 0; row1 < 9; row1++) {
						if (row1 !== row) {
							let index = [];
							for (let col = 0; col < 9; col++) {
								if (this.cells[row1][col].digit == 0 && this.cells[row1][col].notes[num - 1]) {
									index.push(col);
								}
							}

							if (index.length == 2 && cols[0] == index[0] && cols[1] == index[1]) {
								for (let i = 0; i < 9; i++) {
									if (i !== row && i !== row1) {
										if (this.cells[i][cols[0]].digit == 0 && this.cells[i][cols[0]].notes[num - 1]) {
											this.cells[i][cols[0]].changeColor(color("red"), num);
											this.changed = true;
										}
										if (this.cells[i][cols[1]].digit == 0 && this.cells[i][cols[1]].notes[num - 1]) {
											this.cells[i][cols[1]].changeColor(color("red"), num);
											this.changed = true;
										}
									}
								}

								if (this.changed) {
									for (let i = 0; i < 9; i++) {
										if (i == row || i == row1) {
											if (this.cells[i][cols[0]].digit == 0 && this.cells[i][cols[0]].notes[num - 1]) {
												this.cells[i][cols[0]].changeColor(color("yellow"), num);
											}
											if (this.cells[i][cols[1]].digit == 0 && this.cells[i][cols[1]].notes[num - 1]) {
												this.cells[i][cols[1]].changeColor(color("yellow"), num);
											}
										}
									}

									return;
								}
							}
						}
					}
				}
			}

			for (let col = 0; col < 9; col++) {
				let rows = [];
				for (let row = 0; row < 9; row++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						rows.push(row);
					}
				}

				if (rows.length == 2) {
					for (let col1 = 0; col1 < 9; col1++) {
						if (col1 !== col) {
							let index = [];
							for (let row = 0; row < 9; row++) {
								if (this.cells[row][col1].digit == 0 && this.cells[row][col1].notes[num - 1]) {
									index.push(row);
								}
							}

							if (index.length == 2 && rows[0] == index[0] && rows[1] == index[1]) {
								for (let i = 0; i < 9; i++) {
									if (i !== col && i !== col1) {
										if (this.cells[rows[0]][i].digit == 0 && this.cells[rows[0]][i].notes[num - 1]) {
											this.cells[rows[0]][i].changeColor(color("red"), num);
											this.changed = true;
										}
										if (this.cells[rows[1]][i].digit == 0 && this.cells[rows[1]][i].notes[num - 1]) {
											this.cells[rows[1]][i].changeColor(color("red"), num);
											this.changed = true;
										}
									}
								}

								if (this.changed) {
									for (let i = 0; i < 9; i++) {
										if (i == col || i == col1) {
											if (this.cells[rows[0]][i].digit == 0 && this.cells[rows[0]][i].notes[num - 1]) {
												this.cells[rows[0]][i].changeColor(color("yellow"), num);
											}
											if (this.cells[rows[1]][i].digit == 0 && this.cells[rows[1]][i].notes[num - 1]) {
												this.cells[rows[1]][i].changeColor(color("yellow"), num);
											}
										}
									}

									return;
								}
							}
						}
					}
				}
			}
		}
	}

	yWing = function() {
		for (let a = 1; a <= 7; a++) {
			for (let b = a + 1; b <= 8; b++) {
				for (let c = b + 1; c <= 9; c++) {
					let ab = [];
					let bc = [];
					let ac = [];
					for (let row = 0; row < 9; row++) {
						for(let col = 0; col < 9; col++) {
							if (this.cells[row][col].digit == 0 && this.cells[row][col].numPossible == 2) {
								if (this.cells[row][col].notes[a - 1] && this.cells[row][col].notes[b - 1]) {
									ab.push(row);
									ab.push(col);
								} else if (this.cells[row][col].notes[b - 1] && this.cells[row][col].notes[c - 1]) {
									bc.push(row);
									bc.push(col);
								} else if (this.cells[row][col].notes[a - 1] && this.cells[row][col].notes[c - 1]) {
									ac.push(row);
									ac.push(col);
								}
							}
						}
					}

					if (!(ab.length == 0 || bc.length == 0 || ac.length == 0)) {
						for (let i = 0; i < ab.length; i += 2) {
							for (let j = 0; j < bc.length; j += 2) {
								if (this.cells[ab[i]][ab[i + 1]].sees(this.cells[bc[j]][bc[j + 1]])) {
									for (let k = 0; k < ac.length; k += 2) {
										if (this.cells[ab[i]][ab[i + 1]].sees(this.cells[ac[k]][ac[k + 1]])) {
											for (let row = 0; row < 9; row++) {
												for (let col = 0; col < 9; col++) {
													if (this.cells[row][col].sees(this.cells[bc[j]][bc[j + 1]]) && this.cells[row][col].sees(this.cells[ac[k]][ac[k + 1]]) && this.cells[row][col].digit == 0 && this.cells[row][col].notes[c - 1]) {
														this.cells[row][col].changeColor(color("red"), c);
														this.changed = true;
													}
												}
											}

											if (this.changed) {
												this.cells[ab[i]][ab[i + 1]].changeColor(color("yellow"), a);
												this.cells[ab[i]][ab[i + 1]].changeColor(color("yellow"), b);

												this.cells[bc[j]][bc[j + 1]].changeColor(color("yellow"), b);
												this.cells[bc[j]][bc[j + 1]].changeColor(color("yellow"), c);

												this.cells[ac[k]][ac[k + 1]].changeColor(color("yellow"), a);
												this.cells[ac[k]][ac[k + 1]].changeColor(color("yellow"), c);

												return;
											}
										}
									}
								}
							}
						}

						for (let i = 0; i < bc.length; i += 2) {
							for (let j = 0; j < ac.length; j += 2) {
								if (this.cells[bc[i]][bc[i + 1]].sees(this.cells[ac[j]][ac[j + 1]])) {
									for (let k = 0; k < ab.length; k += 2) {
										if (this.cells[bc[i]][bc[i + 1]].sees(this.cells[ab[k]][ab[k + 1]])) {
											for (let row = 0; row < 9; row++) {
												for (let col = 0; col < 9; col++) {
													if (this.cells[row][col].sees(this.cells[ac[j]][ac[j + 1]]) && this.cells[row][col].sees(this.cells[ab[k]][ab[k + 1]]) && this.cells[row][col].digit == 0 && this.cells[row][col].notes[a - 1]) {
														this.cells[row][col].changeColor(color("red"), a);
														this.changed = true;
													}
												}
											}

											if (this.changed) {
												this.cells[ab[k]][ab[k + 1]].changeColor(color("yellow"), a);
												this.cells[ab[k]][ab[k + 1]].changeColor(color("yellow"), b);

												this.cells[bc[i]][bc[i + 1]].changeColor(color("yellow"), b);
												this.cells[bc[i]][bc[i + 1]].changeColor(color("yellow"), c);

												this.cells[ac[j]][ac[j + 1]].changeColor(color("yellow"), a);
												this.cells[ac[j]][ac[j + 1]].changeColor(color("yellow"), c);

												return;
											}
										}
									}
								}
							}
						}

						for (let i = 0; i < ac.length; i += 2) {
							for (let j = 0; j < ab.length; j += 2) {
								if (this.cells[ac[i]][ac[i + 1]].sees(this.cells[ab[j]][ab[j + 1]])) {
									for (let k = 0; k < bc.length; k += 2) {
										if (this.cells[ac[i]][ac[i + 1]].sees(this.cells[bc[k]][bc[k + 1]])) {
											for (let row = 0; row < 9; row++) {
												for (let col = 0; col < 9; col++) {
													if (this.cells[row][col].sees(this.cells[ab[j]][ab[j + 1]]) && this.cells[row][col].sees(this.cells[bc[k]][bc[k + 1]]) && this.cells[row][col].digit == 0 && this.cells[row][col].notes[b - 1]) {
														this.cells[row][col].changeColor(color("red"), b);
														this.changed = true;
													}
												}
											}

											if (this.changed) {
												this.cells[ab[j]][ab[j + 1]].changeColor(color("yellow"), a);
												this.cells[ab[j]][ab[j + 1]].changeColor(color("yellow"), b);

												this.cells[bc[k]][bc[k + 1]].changeColor(color("yellow"), b);
												this.cells[bc[k]][bc[k + 1]].changeColor(color("yellow"), c);

												this.cells[ac[i]][ac[i + 1]].changeColor(color("yellow"), a);
												this.cells[ac[i]][ac[i + 1]].changeColor(color("yellow"), c);

												return;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	swordfish = function() {
		for (let num = 1; num <= 9; num++) {
			for (let row = 0; row < 7; row++) {
				let index = [];
				for (let col = 0; col < 9; col++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(col);
					}
				}

				if (index.length <= 3 && index.length >= 1) {
					for (let row1 = row + 1; row1 < 8; row1++) {
						let index1 = [];
						for (let col = 0; col < 9; col++) {
							if (this.cells[row1][col].digit == 0 && this.cells[row1][col].notes[num - 1]) {
								index1.push(col);
							}
						}

						if (index1.length <= 3 && index1.length >= 1) {
							for (let row2 = row1 + 1; row2 < 9; row2++) {
								let index2 = [];
								for (let col = 0; col < 9; col++) {
									if (this.cells[row2][col].digit == 0 && this.cells[row2][col].notes[num - 1]) {
										index2.push(col);
									}
								}

								if (index2.length <= 3 && index2.length >= 1) {
									let cols = [];
									for (let n = 0; n < index.length; n++) {
										cols.push(index[n]);
									}

									for (let n = 0; n < index1.length; n++) {
										let exists = false;
										for (let i = 0; i < cols.length; i++) {
											if (cols[i] == index1[n]) {
												exists = true;
											}
										}

										if (!exists) {
											cols.push(index1[n]);
										}
									}

									for (let n = 0; n < index2.length; n++) {
										let exists = false;
										for (let i = 0; i < cols.length; i++) {
											if (cols[i] == index2[n]) {
												exists = true;
											}
										}

										if (!exists) {
											cols.push(index2[n]);
										}
									}

									if (cols.length <= 3) {
										for (let i = 0; i < 9; i++) {
											if (i !== row && i !== row1 && i !== row2) {
												for (let n = 0; n < cols.length; n++) {
													if (this.cells[i][cols[n]].digit == 0 && this.cells[i][cols[n]].notes[num - 1]) {
														this.cells[i][cols[n]].changeColor(color("red"), num);
														this.changed = true;
													}
												}
											}
										}

										if (this.changed) {
											for (let i = 0; i < 9; i++) {
												if (i == row || i == row1 || i == row2) {
													for (let n = 0; n < cols.length; n++) {
														if (this.cells[i][cols[n]].digit == 0 && this.cells[i][cols[n]].notes[num - 1]) {
															this.cells[i][cols[n]].changeColor(color("yellow"), num);
														}
													}
												}
											}

											return;
										}
									}
								}
							}
						}
					}
				}
			}


			for (let col = 0; col < 7; col++) {
				let index = [];
				for (let row = 0; row < 9; row++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].notes[num - 1]) {
						index.push(row);
					}
				}

				if (index.length <= 3 && index.length >= 1) {
					for (let col1 = col + 1; col1 < 8; col1++) {
						let index1 = [];
						for (let row = 0; row < 9; row++) {
							if (this.cells[row][col1].digit == 0 && this.cells[row][col1].notes[num - 1]) {
								index1.push(row);
							}
						}

						if (index1.length <= 3 && index1.length >= 1) {
							for (let col2 = col1 + 1; col2 < 9; col2++) {
								let index2 = [];
								for (let row = 0; row < 9; row++) {
									if (this.cells[row][col2].digit == 0 && this.cells[row][col2].notes[num - 1]) {
										index2.push(row);
									}
								}

								if (index2.length <= 3 && index2.length >= 1) {
									let rows = [];
									for (let n = 0; n < index.length; n++) {
										rows.push(index[n]);
									}

									for (let n = 0; n < index1.length; n++) {
										let exists = false;
										for (let i = 0; i < rows.length; i++) {
											if (rows[i] == index1[n]) {
												exists = true;
											}
										}

										if (!exists) {
											rows.push(index1[n]);
										}
									}

									for (let n = 0; n < index2.length; n++) {
										let exists = false;
										for (let i = 0; i < rows.length; i++) {
											if (rows[i] == index2[n]) {
												exists = true;
											}
										}

										if (!exists) {
											rows.push(index2[n]);
										}
									}

									if (rows.length <= 3) {
										for (let i = 0; i < 9; i++) {
											if (i !== col && i !== col1 && i !== col2) {
												for (let n = 0; n < rows.length; n++) {
													if (this.cells[rows[n]][i].digit == 0 && this.cells[rows[n]][i].notes[num - 1]) {
														this.cells[rows[n]][i].changeColor(color("red"), num);
														this.changed = true;
													}
												}
											}
										}

										if (this.changed) {
											for (let i = 0; i < 9; i++) {
												if (i == col || i == col1 || i == col2) {
													for (let n = 0; n < rows.length; n++) {
														if (this.cells[rows[n]][i].digit == 0 && this.cells[rows[n]][i].notes[num - 1]) {
															this.cells[rows[n]][i].changeColor(color("yellow"), num);
														}
													}
												}
											}

											return;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	xyzWing = function() {
		for (let a = 1; a <= 7; a++) {
			for (let b = a + 1; b <= 8; b++) {
				for (let c = b + 1; c <= 9; c++) {
					for (let row = 0; row < 9; row++) {
						for (let col = 0; col < 9; col++) {
							if (this.cells[row][col].digit == 0 && this.cells[row][col].numPossible == 3 && this.cells[row][col].notes[a - 1] && this.cells[row][col].notes[b - 1] && this.cells[row][col].notes[c - 1]) {
								for (let row1 = 0; row1 < 9; row1++) {
									for (let col1 = 0; col1 < 9; col1++) {
										if (this.cells[row1][col1].digit == 0 && this.cells[row1][col1].numPossible == 2 && this.cells[row1][col1].notes[a - 1] && this.cells[row1][col1].notes[b - 1] && this.cells[row][col].sees(this.cells[row1][col1])) {
											for (let row2 = 0; row2 < 9; row2++) {
												for (let col2 = 0; col2 < 9; col2++) {
													if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[a - 1] && this.cells[row2][col2].notes[c - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2]) && this.cells[row3][col3].notes[a - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), a);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), a);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													} else if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[b - 1] && this.cells[row2][col2].notes[c - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2])  && this.cells[row3][col3].notes[b - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), b);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), b);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													}
												}
											}
										} else if (this.cells[row1][col1].digit == 0 && this.cells[row1][col1].numPossible == 2 && this.cells[row1][col1].notes[a - 1] && this.cells[row1][col1].notes[c - 1] && this.cells[row][col].sees(this.cells[row1][col1])) {
											for (let row2 = 0; row2 < 9; row2++) {
												for (let col2 = 0; col2 < 9; col2++) {
													if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[a - 1] && this.cells[row2][col2].notes[b - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2]) && this.cells[row3][col3].notes[a - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), a);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), a);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													} else if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[b - 1] && this.cells[row2][col2].notes[c - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2]) && this.cells[row3][col3].notes[c - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), c);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), b);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													}
												}
											}
										} else if (this.cells[row1][col1].digit == 0 && this.cells[row1][col1].numPossible == 2 && this.cells[row1][col1].notes[b - 1] && this.cells[row1][col1].notes[c - 1] && this.cells[row][col].sees(this.cells[row1][col1])) {
											for (let row2 = 0; row2 < 9; row2++) {
												for (let col2 = 0; col2 < 9; col2++) {
													if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[a - 1] && this.cells[row2][col2].notes[c - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2]) && this.cells[row3][col3].notes[c - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), c);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), a);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													} else if (this.cells[row2][col2].digit == 0 && this.cells[row2][col2].numPossible == 2 && this.cells[row2][col2].notes[a - 1] && this.cells[row2][col2].notes[b - 1] && this.cells[row][col].sees(this.cells[row2][col2])) {
														for (let row3 = 0; row3 < 9; row3++) {
															for (let col3 = 0; col3 < 9; col3++) {
																if (this.cells[row3][col3].sees(this.cells[row][col]) && this.cells[row3][col3].sees(this.cells[row1][col1]) && this.cells[row3][col3].sees(this.cells[row2][col2]) && this.cells[row3][col3].notes[b - 1]) {
																	this.cells[row3][col3].changeColor(color("red"), b);
																	this.changed = true;
																}
															}
														}

														if (this.changed) {
															this.cells[row][col].changeColor(color("yellow"), a);
															this.cells[row][col].changeColor(color("yellow"), b);
															this.cells[row][col].changeColor(color("yellow"), c);

															this.cells[row1][col1].changeColor(color("yellow"), a);
															this.cells[row1][col1].changeColor(color("yellow"), b);

															this.cells[row2][col2].changeColor(color("yellow"), b);
															this.cells[row2][col2].changeColor(color("yellow"), c);

															return;
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	thermoNotes = function() {
		for (let n = 0; n < thermometers.length; n++) {
			for (let i = 0; i < thermometers[n].cells; i++) {
				let changeMade = false;
				let row = thermometers[n].indexes[i * 2];
				let col = thermometers[n].indexes[i * 2 + 1];
				let min = thermometers[n].minVal(row, col, this.isCopy);
				let max = thermometers[n].maxVal(row, col, this.isCopy);

				for (let j = 1; j <= 9; j++) {
					if (this.cells[row][col].notes[j - 1] && (j < min || j > max)) {
						this.cells[row][col].changeColor(color("red"), j);
						changeMade = true;
						this.changed = true;
					}
				}

				if (changeMade) {
					for (let j = 1; j <= 9; j++) {
						if (this.cells[row][col].notes[j - 1] && (j >= min && j <= max)) {
							this.cells[row][col].changeColor(color("yellow"), j);
						}
					}
				}
			}
		}
	}

	thermoInteractions = function() {
		for (let num = 2; num <= 8; num++) {
			for (let unit = 0; unit < 9; unit++) {
				let locsRow = [];
				let foundInRow = false;
				let locsCol = [];
				let foundInCol = false;
				let locsBox = [];
				let foundInBox = false;

				for (let index = 0; index < 9; index++) {
					if (this.cells[unit][index].notes[num - 1] && this.cells[unit][index].digit == 0) {
						locsRow.push(index);
					} else if (this.cells[unit][index].digit == num) {
						foundInRow = true;
					}
					if (this.cells[index][unit].notes[num - 1] && this.cells[index][unit].digit == 0) {
						locsCol.push(index);
					} else if (this.cells[index][unit].digit == num) {
						foundInCol = true;
					}
					let row = this.gridFromBox(unit + 1, index, false);
					let col = this.gridFromBox(unit + 1, index, true);
					if (this.cells[row][col].notes[num - 1] && this.cells[row][col].digit == 0) {
						locsBox.push(index);
					}else if (this.cells[row][col].digit == num) {
						foundInBox = true;
					}
				}

				for (let type = 0; type < 3; type++) {
					let yellows = [];
					if (type == 0) {
						if (foundInRow) {
							continue;
						}
						for (let i = 0; i < locsRow.length; i++) {
							let arr = [unit, locsRow[i], 0, 0];

							yellows.push(arr);
						}
					} else if (type == 1) {
						if (foundInCol) {
							continue;
						}
						for (let i = 0; i < locsCol.length; i++) {
							let arr = [locsCol[i], unit, 0, 0];

							yellows.push(arr);
						}
					} else if (type == 2) {
						if (foundInBox) {
							continue;
						}
						for (let i = 0; i < locsBox.length; i++) {
							let row = this.gridFromBox(unit + 1, locsBox[i], false);
							let col = this.gridFromBox(unit + 1, locsBox[i], true);
							let arr = [row, col, 0, 0];

							yellows.push(arr);
						}
					}

					let contained = true;
					for (let i = 0; i < yellows.length; i++) {
						let found = false;
						for (let j = 0; j < thermometers.length; j++) {
							if (thermometers[j].onThermo(yellows[i][0], yellows[i][1])) {
								yellows[i][2] = j;
								found = true;
								break;
							}
						}

						if (!found) {
							contained = false;
							break;
						}
					}

					if (contained) {
						for (let i = 0; i < yellows.length; i++) {
							yellows[i][3] = thermometers[yellows[i][2]].thermoIndex(yellows[i][0], yellows[i][1]);
						}

						let allMins = true;
						for (let i = 0; i < yellows.length; i++) {
							if (num !== thermometers[yellows[i][2]].minVal(yellows[i][0], yellows[i][1], this.isCopy)) {
								allMins = false;
							}
						}

						if (allMins) {
							let notZero = true;
							for (let i = 0; i < yellows.length; i++) {
								if (yellows[i][3] == 0) {
									notZero = false;
									break;
								}
							}

							if (notZero) {
								let indexes = [];
								for (let i = 0; i < yellows.length; i++) {
									let arr = [thermometers[yellows[i][2]].indexes[(yellows[i][3] - 1) * 2], thermometers[yellows[i][2]].indexes[(yellows[i][3] - 1) * 2 + 1]];
									indexes.push(arr);
								}

								let onePos = true;
								for (let i = 0; i < indexes.length; i++) {
									let count = 0;
									for (let note = 0; note < num - 1; note++) {
										if (this.cells[indexes[i][0]][indexes[i][1]].notes[note] && this.cells[indexes[i][0]][indexes[i][1]].digit == 0) {
											count++;
										}
									}

									if (count !== 1) {
										onePos = false;
										break;
									}
								}

								if (onePos) {
									let sameVal = true;
									let val = thermometers[yellows[0][2]].minVal(indexes[0][0], indexes[0][1], this.isCopy);
									for (let i = 0; i < indexes.length; i++) {
										if (thermometers[yellows[i][2]].minVal(indexes[i][0], indexes[i][1], this.isCopy) !== val) {
											sameVal = false;
										}
									}

									if (sameVal) {
										for (let i = 0; i < 9; i++) {
											for (let j = 0; j < 9; j++) {
												let seen = true;
												for (let k = 0; k < indexes.length; k++) {
													if (!this.cells[i][j].sees(this.cells[indexes[k][0]][indexes[k][1]])) {
														seen = false;
														break;
													}
												}

												if (seen && this.cells[i][j].digit == 0 && this.cells[i][j].notes[val - 1]) {
													this.cells[i][j].changeColor(color("red"), val);
													this.changed = true;
												}
											}
										}

										if (this.changed) {
											for (let i = 0; i < indexes.length; i++) {
												this.cells[indexes[i][0]][indexes[i][1]].changeColor(color("yellow"), val);
												this.cells[yellows[i][0]][yellows[i][1]].changeColor(color("yellow"), num);
											}

											return;
										}
									}
								}
							}
						}

						let allMaxs = true;
						for (let i = 0; i < yellows.length; i++) {
							if (num !== thermometers[yellows[i][2]].maxVal(yellows[i][0], yellows[i][1], this.isCopy)) {
								allMaxs = false;
							}
						}

						if (allMaxs) {
							let notEnd = true;
							for (let i = 0; i < yellows.length; i++) {
								if (yellows[i][3] == thermometers[yellows[i][2]].cells - 1) {
									notEnd = false;
									break;
								}
							}

							if (notEnd) {
								let indexes = [];
								for (let i = 0; i < yellows.length; i++) {
									let arr = [thermometers[yellows[i][2]].indexes[(yellows[i][3] + 1) * 2], thermometers[yellows[i][2]].indexes[(yellows[i][3] + 1) * 2 + 1]];
									indexes.push(arr);
								}

								let onePos = true;
								for (let i = 0; i < indexes.length; i++) {
									let count = 0;
									for (let note = num; note < 9; note++) {
										if (this.cells[indexes[i][0]][indexes[i][1]].notes[note] && this.cells[indexes[i][0]][indexes[i][1]].digit == 0) {
											count++;
										}
									}

									if (count !== 1) {
										onePos = false;
										break;
									}
								}

								if (onePos) {
									let sameVal = true;
									let val = thermometers[yellows[0][2]].maxVal(indexes[0][0], indexes[0][1], this.isCopy);
									for (let i = 0; i < indexes.length; i++) {
										if (thermometers[yellows[i][2]].maxVal(indexes[i][0], indexes[i][1]) !== val, this.isCopy) {
											sameVal = false;
										}
									}

									if (sameVal) {
										for (let i = 0; i < 9; i++) {
											for (let j = 0; j < 9; j++) {
												let seen = true;
												for (let k = 0; k < indexes.length; k++) {
													if (!this.cells[i][j].sees(this.cells[indexes[k][0]][indexes[k][1]])) {
														seen = false;
														break;
													}
												}

												if (seen && this.cells[i][j].digit == 0 && this.cells[i][j].notes[val - 1]) {
													this.cells[i][j].changeColor(color("red"), val);
													this.changed = true;
												}
											}
										}

										if (this.changed) {
											for (let i = 0; i < indexes.length; i++) {
												this.cells[indexes[i][0]][indexes[i][1]].changeColor(color("yellow"), val);
												this.cells[yellows[i][0]][yellows[i][1]].changeColor(color("yellow"), num);
											}

											return;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	guess = function() {
		for (let numCandidates = 2; numCandidates <= 9; numCandidates++) {
			for (let row = 0; row < 9; row++) {
				for (let col = 0; col < 9; col++) {
					if (this.cells[row][col].digit == 0 && this.cells[row][col].numPossible <= numCandidates) {
						for (let num = 1; num <= 9; num++) {
							if (this.cells[row][col].notes[num - 1]) {
								sudokuCopy = new Grid(true);
								sudokuCopy.placeDigit(row, col, num);
								if (sudokuCopy.checkSolvable()) {
									this.cells[row][col].changeColor(color("green"), num);
									this.changed = true;
									return;
								}
							}
						}
					}
				}
			}
		}
	}

	solveRecurs = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].digit == 0) {
					for (let num = 1; num <= 9; num++) {
						if (this.cells[i][j].notes[num - 1] && this.checkValid(i, j, num)) {
							this.cells[i][j].digit = num;
							this.solveRecurs();
							this.cells[i][j].digit = 0;
						}
					}

					return;
				}
			}
		}

		this.checkSolved();
		if (this.solved && this.solveCount < 2) {
			console.log(sudokuCopy);
			this.solveCount++;
		}

		return;
	}

	checkSolvable = function() {
		this.solveCount = 0;
		this.solveRecurs();
		if (this.solveCount == 1) {
			return true;
		} else {
			return false;
		}
	}

	checkSolved = function() {
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (this.cells[i][j].digit == 0) {
					this.solved = false;
					return;
				}
			}
		}

		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				let row = this.gridFromBox(i + 1, j, false);
				let col = this.gridFromBox(i + 1, j, true);
				for (let k = 0; k < 9; k++) {
					if (k !== j) {
						let tempRow = this.gridFromBox(i + 1, k, false);
						let tempCol = this.gridFromBox(i + 1, k, true);
						if (this.cells[i][j].digit == this.cells[i][k].digit || this.cells[j][i].digit == this.cells[k][i].digit || this.cells[row][col].digit == this.cells[tempRow][tempCol].digit) {
							this.solved = false;
							return;
						}
					}
				}
			}
		}

		if (thermo) {
			for (let i = 0; i < thermometers.length; i++) {
				if (!thermometers[i].inOrder) {
					this.solved = false;
					return;
				}
			}
		}

		this.solved = true;
	}

	solve = function() {
		this.checkSolved();

		if (this.solved) {
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					this.cells[i][j].digitColor = color('green');
				}
			}
			console.log("Puzzle solved");
		} else {
			this.changed = false;

			if (!this.changed) {
				this.updateGrid();
				if(this.changed) {
					console.log("Grid Updated");
				} else {
					console.log("Found no updates");
				}
			}

			if (!this.changed) {
				this.nakedSingles();
				if(this.changed) {
					console.log("Found Naked Singles");
				} else {
					console.log("Did not find any Naked Singles");
				}
			}

			if (!this.changed) {
				this.hiddenSingles();
				if(this.changed) {
					console.log("Found Hidden Singles");
				} else {
					console.log("Did not find any Hidden Singles");
				}
			}

			if (!this.changed && thermo) {
				this.thermoNotes();
				if(this.changed) {
					console.log("Updated Thermometer notes");
				} else {
					console.log("Could not update Thermometer notes");
				}
			}

			if (!this.changed) {
				this.nakedPairTrip();
				if(this.changed) {
					console.log("Found Naked Pair/Triple");
				} else {
					console.log("Did not find any Naked Pairs/Triples");
				}
			}

			if (!this.changed) {
				this.hiddenPairTrip();
				if(this.changed) {
					console.log("Found Hidden Pair/Triple");
				} else {
					console.log("Did not find any Hidden Pairs/Triples");
				}
			}

			if (!this.changed) {
				this.quads();
				if(this.changed) {
					console.log("Found Naked/Hidden Quad");
				} else {
					console.log("Did not find any Naked/Hidden Quads");
				}
			}

			if (!this.changed) {
				this.pointing();
				if(this.changed) {
					console.log("Found Pointing Pair/Triple");
				} else {
					console.log("Did not find any Pointing Pairs/Triples");
				}
			}

			if (!this.changed) {
				this.xWing();
				if(this.changed) {
					console.log("Found X-Wing");
				} else {
					console.log("Did not find any X-Wings");
				}
			}

			if (!this.changed) {
				this.yWing();
				if(this.changed) {
					console.log("Found Y-Wing");
				} else {
					console.log("Did not find any Y-Wings");
				}
			}

			if (!this.changed) {
				this.swordfish();
				if(this.changed) {
					console.log("Found Swordfish");
				} else {
					console.log("Did not find any Swordfishes");
				}
			}

			if (!this.changed) {
				this.xyzWing();
				if(this.changed) {
					console.log("Found XYZ-Wing");
				} else {
					console.log("Did not find any XYZ-Wings");
				}
			}

			if (!this.changed && thermo) {
				this.thermoInteractions();
				if(this.changed) {
					console.log("Found Thermometer interactions");
				} else {
					console.log("Could not find Thermometer interactions");
				}
			}

			if (!this.changed) {
				this.guess();
				if(this.changed) {
					console.log("Trial and Error reduced candidates");
				} else {
					console.log("Trial and Error could not elimate any candidates. Solver is stuck");
				}
			}
		}
	}
}
