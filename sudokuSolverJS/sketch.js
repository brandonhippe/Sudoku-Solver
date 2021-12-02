// Brandon Hippe
// Classic and variant Sudoku solver with hints


let digits, digitColor, notes, noteColor, numPossible, boxNum, changed;

let solveCount, recursDone, recursCount = 0, threshold = 15, guessing = false, solution, loadingScreen, angle, sleepTime = 1;

let cellSize, defaultStroke, defaultText, highlightedCell;

let noteToggle;

let thermo, thermometers, drawing;

let sandwich, sandwiches, selectedSandwich;

let kingsMove;

let knightsMove;

let queensMove, queensDigits, changingQueens;

let diagonal;

let nonConsecutive;

let magicSquare, magicSquares, makingSquare;

let irregular, cells, regionCount;

let uniqueCheck;

let selection, keypad, restrictions, options;


function setup() {
   createCanvas(windowWidth, windowHeight);

   textAlign(CENTER, CENTER);
   textSize(defaultText);

   initialize();
}

function initialize() {
	// Resets variables for new solve

   background(255);


   digits = new Array(9);
   digitColor = new Array(9);
   notes = new Array(9);
   noteColor = new Array(9);
   numPossible = new Array(9);
   boxNum = new Array(9);
   solution = new Array(9);
	queensDigits = new Array(9);

   changed = false;
   solveCount = 1;
	recursDone = false;
	loadingScreen = false;
   angle = 0;

   cellSize = (width < height) ? width : height;
   cellSize = floor(cellSize / 11);
   defaultStroke = round(cellSize * 0.02) + 1;
   defaultText = floor((cellSize * 0.75) * 0.75);
   highlightedCell = [0, 0];

   noteToggle = false;

   thermo = false;
   thermometers = [];
   drawing = false;

   sandwich = false;

   kingsMove = false;

   knightsMove = false;

   queensMove = false;

   changingQueens = false;

   diagonals = false;

   nonConsecutive = false;

   magicSquare = false;
	magicSquares = [];
   makingSquare = false;

   irregular = false;

   uniqueCheck = true;

   for (let i = 0; i < 9; i++) {
      digits[i] = new Array(9);
      digitColor[i] = new Array(9);
      notes[i] = new Array(9);
      noteColor[i] = new Array(9);
      numPossible[i] = new Array(9);
      boxNum[i] = new Array(9);
      solution[i] = new Array(9);
		queensDigits[i] = false;
      for (let j = 0; j < 9; j++) {
         digits[i][j] = 0;
         digitColor[i][j] = color("white");
         numPossible[i][j] = 9;
         notes[i][j] = new Array (9);
         noteColor[i][j] = new Array (9);
         boxNum[i][j] = floor(i / 3) * 3 + floor(j / 3);
         for (let k = 0; k < 9; k++) {
            notes[i][j][k] = true;
            noteColor[i][j][k] = color("white");
         }
      }
   }

	selection = new SelectionPanel;
	keypad = new Keypad;
	restrictions = new RestrictionPanel;
	options = new OptionPanel;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cellSize = (width < height) ? width : height;
  cellSize = floor(cellSize / 11);
  defaultStroke = round(cellSize * 0.02) + 1;
  defaultText = floor((cellSize  * 0.75) * 0.75);
}

function draw() {
	// Calls loading animation or show animation after getting key inputs

	if (loadingScreen || guessing) {
		loading();
	} else {
		show();
	}


	thermo = thermometers.length > 0;

	magicSquare = magicSquares.length > 0;

	let anyQueen = false;
	for (let i = 0; i < queensDigits.length; i++) {
		if (queensDigits[i]) {
			anyQueen = true;
			break;
		}
	}

	if (!anyQueen) {
		queensMove = false;
	}

	for (let i = 0; i < selection.buttons.length; i++) {
		if (selection.buttons[i].selected) {
			switch (i) {
				case 0:
					keypad.visible = true;
					restrictions.visible = false;
					options.visible = false;
					break;
				case 1:
					keypad.visible = false;
					restrictions.visible = true;
					options.visible = false;
					break;
				case 2:
					keypad.visible = false;
					restrictions.visible = false;
					options.visible = true;
					break;
			}

			break;
		}
	}
}

function show() {
	// Normal solving animation

   background(255);
   push();
   translate(cellSize, cellSize);

	// Highlights selected cell
	if (highlightedCell[0] !== -1 && highlightedCell[1] !== -1) {
		noStroke();
		colorMode(HSB);
		push();
		translate(highlightedCell[1] * cellSize, highlightedCell[0] * cellSize);
		fill(60, 100, 100);
		rect(0, 0, cellSize, cellSize);
		pop();
		colorMode(RGB, 255);
	}

	// For irregular sudokus, highlights all cells of a region the same color
   if (irregular) {
		noStroke();
		colorMode(HSB);
      for (let i = 0; i < cells.length; i++) {
   		push();
   		translate(cells[i][1] * cellSize, cells[i][0] * cellSize);
   		fill(60, 100, 100);
   		rect(0, 0, cellSize, cellSize);
   		pop();
      }

      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            if (boxNum[i][j] !== -1) {
               push();
         		translate(j * cellSize, i * cellSize);
         		fill(map(boxNum[i][j], 0, 9, 0, 360), 100, 100, 0.5);
         		rect(0, 0, cellSize, cellSize);
         		pop();
            }
         }
      }

      colorMode(RGB, 255);
	}

	// Shows thermometers
	if (thermo) {
      for (let i = 0; i < thermometers.length; i++) {
         noStroke();
   		fill(200);
   		if (thermometers[i].length > 0) {
   			ellipse(thermometers[i][0][1] * cellSize + cellSize / 2, thermometers[i][0][0] * cellSize + cellSize / 2, floor(cellSize * 0.7));
   		}

   		strokeWeight(defaultStroke * 4);
   		stroke(200);
   		if (thermometers[i].length > 1) {
   			for (let j = 0; j < thermometers[i].length - 2; j++) {
   				line(thermometers[i][j][1] * cellSize + cellSize / 2, thermometers[i][j][0] * cellSize + cellSize / 2, thermometers[i][j + 1][1] * cellSize + cellSize / 2, thermometers[i][j + 1][0] * cellSize + cellSize / 2);
   			}

            let info = onThermo(thermometers[i][thermometers[i].length - 1][0], thermometers[i][thermometers[i].length - 1][1]);
            let endX = thermometers[i][thermometers[i].length - 1][1] + ((thermometers[i][thermometers[i].length - 2][1] - thermometers[i][thermometers[i].length - 1][1]) * ((info.length > 1) ? 0.2 : 0));
            let endY = thermometers[i][thermometers[i].length - 1][0] + ((thermometers[i][thermometers[i].length - 2][0] - thermometers[i][thermometers[i].length - 1][0]) * ((info.length > 1) ? 0.2 : 0));
            line(thermometers[i][thermometers[i].length - 2][1] * cellSize + cellSize / 2, thermometers[i][thermometers[i].length - 2][0] * cellSize + cellSize / 2, endX * cellSize + cellSize / 2, endY * cellSize + cellSize / 2);
   		}
      }
   }

	// Highlights cells of any magic squares
   if (magicSquare) {
      for (let i = 0; i < magicSquares.length; i++) {
         let row = magicSquares[i][0];
         let col = magicSquares[i][1];

         colorMode(HSB);
         noStroke();
         fill(map(i, 0, magicSquares.length, 0, 360), 100, 100, 0.5);
         rectMode(CENTER);
         rect((col + 0.5) * cellSize, (row + 0.5) * cellSize, cellSize * 3, cellSize * 3);
         rectMode(CORNER);
         colorMode(RGB, 255);
      }
   }

	// Draws lines for diagonal regions
	if (diagonals) {
		strokeWeight(defaultStroke);
		stroke(0, 0, 255);
		line(0, 0, cellSize * 9, cellSize * 9);

		push();
		translate(0, cellSize * 9);
		line(0, 0, cellSize * 9, -cellSize * 9);
		pop();
	}

	// Draws sandwich clues outside grid
   if (sandwich) {
      push();
      translate(-cellSize / 2, - cellSize / 2);
      for (let i = 0; i < sandwiches.length; i++) {
         push();
         translate((i == 1) ? cellSize : 0, (i == 0) ? cellSize: 0);
         for (let j = 0; j < sandwiches[i].length; j++) {
            push();
            translate((i == 1) ? j * cellSize : 0, (i == 0) ? j * cellSize: 0);
            if (sandwiches[i][j] !== -1) {
               noStroke();
               fill(0);
               textSize(defaultText);
               text(sandwiches[i][j], 0, 0);
            }

            if (selectedSandwich.length !== 0 && selectedSandwich[0] == i && selectedSandwich[1] == j) {
               stroke(255, 0, 0);
               strokeWeight(defaultStroke);
               noFill();
               rectMode(CENTER);
               rect(0, 0, cellSize * 0.8, cellSize * 0.8);
            }
            pop();
         }
         pop();
      }
      pop();
   }

	// External lines
	strokeWeight(defaultStroke * 2);
	stroke(0);
	fill(0);
	line(0, 0, 0, cellSize * 9);
	line(0, 0, cellSize * 9, 0);
	line(cellSize * 9, 0, cellSize * 9, cellSize * 9);
	line(0, cellSize * 9, cellSize * 9, cellSize * 9);

	// Draws all 4 walls for each cell, stroke weight changes if neighboring cell is of a different box/irregular region
	push();
	for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
			// Left Wall
			if (j == 0 || (j !== 0 && boxNum[i][j] !== boxNum[i][j - 1])) {
				strokeWeight(defaultStroke * 2);
			} else {
				strokeWeight(defaultStroke);
			}

			line(0, 0, 0, cellSize);

			// Right Wall
			if (j == 8 || (j !== 8 && boxNum[i][j] !== boxNum[i][j + 1])) {
				strokeWeight(defaultStroke * 2);
			} else {
				strokeWeight(defaultStroke);
			}

			line(cellSize, 0, cellSize, cellSize);

			// Top Wall
			if (i == 0 || (i !== 0 && boxNum[i][j] !== boxNum[i - 1][j])) {
				strokeWeight(defaultStroke * 2);
			} else {
				strokeWeight(defaultStroke);
			}

			line(0, 0, cellSize, 0);

			// Bottom Wall
			if (i == 8 || (i !== 8 && boxNum[i][j] !== boxNum[i + 1][j])) {
				strokeWeight(defaultStroke * 2);
			} else {
				strokeWeight(defaultStroke);
			}

			line(0, cellSize, cellSize, cellSize);

			// Move to next cell
	      translate(cellSize, 0);
	   }

		// Move to next row
      translate(-cellSize * 9, cellSize);
	}
	pop();

	// Draws digit or notes for each cell
   noStroke();
	for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         push();
         translate(cellSize * j + cellSize / 2, cellSize * i + cellSize / 2);
         if (digits[i][j] == 0) {
            printNotes(i, j);
         } else {
            fill(digitColor[i][j]);
            textSize(defaultText);
            text(digits[i][j], 0, 0);
         }
         pop();
	   }
	}

   pop();

	selection.show();
	keypad.show();
}

function loading() {
	// Loading screen animation, displayed during recursive uniquely solvable check
	background(255);
	push();

	// Below code is antiquated, just displays text to user
	// translate(cellSize * 3, cellSize * 5);
	// fill(0);
	// textSize(floor(defaultText * 0.6));
	// text("Please press space bar to have solver determine if puzzle has a unique solution. Grid will return when check is complete. This can take several minutes.", 0, 0, cellSize * 5);
	// textSize(defaultText);


   translate(cellSize * 4.5, cellSize * 4.5);
   noStroke();
   colorMode(HSB)

	// Draw 5 colored bubbles at different heights and sizes accoring to a sin function
   for (let i = -2; i <= 2; i++) {
      let d = map(sin((PI * angle) + (-0.5 * i)), -1, 1, 20, 100);
      let h = map(sin((PI * angle) + (-0.5 * i)), -1, 1, 0, -50);

      push();
      translate(i * 100, h);
      fill((i + 2) * 60, 100, 100);
      circle(0, 0, d);
      pop();
   }

	// Displays message to user
   translate(-cellSize * 2.5, cellSize);
   fill(0);
	textSize(floor(defaultText * 0.6));
   if (guessing) {
      text("Solver has run out of logical deductions, and is finding the quickest deduction. This can take several minutes.", 0, 0, cellSize * 5);
   } else {
      text("Solver is determining if puzzle has a unique solution. Grid will return when check is complete. This can take several minutes.", 0, 0, cellSize * 5);
   }
	textSize(defaultText);
	pop();

   colorMode(RGB, 255);

   angle += 0.05;
}

// These functions handle Buttons
function makeButtons() {
	buttons = [];
	for (let i = 0; i < 12; i++) {
		let text;
		let toggle;
		switch (i) {
			case 0:
				text = "Number";
				toggle = true;
				break;
			case 1:
				text = "Note";
				toggle = true;
				break;
			case 2:
				text = "Thermo";
				toggle = false;
				break;
			case 3:
				text = "Sandwich";
				toggle = true;
				break;
			case 4:
				text = "King's Move Restriction";
				toggle = true;
				break;
			case 5:
				text = "Knight's Move Restriction";
				toggle = true;
				break;
			case 6:
				text = "Queen's Move Restriction";
				toggle = true;
				break;
			case 7:
				text = "Diagonal Restriction";
				toggle = true;
				break;
			case 8:
				text = "Non-consecutive Restriction";
				toggle = true;
				break;
			case 9:
				text = "Magic Square Restriction";
				toggle = false;
				break;
			case 10:
				text = "Irregular Regions";
				toggle = true;
				break;
			case 11:
				text = "Check for unique Solution";
				toggle = true;
				break;
		}
		buttons.push(new Button(cellSize * 11.5, cellSize * (4.1 + (i / 2)), cellSize * 2 * 0.97, cellSize * 0.4, text, toggle));

		switch (i) {
			case 0:
				buttons[i].active = true;
				break;
			case 11:
				buttons[i].active = true;
				break;
			default:
				buttons[i].active = false;
		}
	}

	buttonChanged();
}

function buttonPressed() {
	let clickedOn = false;
	for (let i = 0; i < buttons.length; i++) {
		let temp = buttons[i].clicked(mouseX, mouseY, buttons);

		if (!clickedOn) {
			clickedOn = temp;
		}
	}

   if (!clickedOn) {
      for (let i = 0; i < buttons.length; i++) {
         buttons[i].selected = false;
      }
   }

	buttonChanged();

	return clickedOn;
}

function buttonChanged() {
	for (let n = 2; n < buttons.length; n++) {
		switch (n) {
			case 2:
				if (thermometers.length > 0 && thermometers[thermometers.length - 1].length <= 1) {
					thermometers.splice(thermometers.length - 1);
				}

				drawing = buttons[n].selected;

				if (drawing) {
					thermometers.push([]);
				}

				resetNotes();
				break;
			case 3:
				sandwich = buttons[n].active;

				if (sandwich) {
					sandwiches = new Array(2);
					for (let i = 0; i < sandwiches.length; i++) {
						sandwiches[i] = new Array(9);
						for (let j = 0; j < sandwiches[i].length; j++) {
							sandwiches[i][j] = -1;
						}
					}

					selectedSandwich = [];
				}
				break;
			case 4:
				kingsMove = buttons[n].active;

				resetNotes();
				break;
			case 5:
				knightsMove = buttons[n].active;

			   resetNotes();
				break;
			case 6:
				changingQueens = buttons[n].selected;
				queensMove = buttons[n].active;
				for (let i = 0; i < 9; i++) {
		         queensDigits[i] = (i == 8 && queensMove);
		      }

			   resetNotes();
				break;
			case 7:
				diagonals = buttons[n].active;

			   resetNotes();
				break;
			case 8:
				nonConsecutive = buttons[n].active;

				resetNotes();
				break;
			case 9:
				makingSquare = buttons[n].selected;

				resetNotes();
				break;
			case 10:
				irregular = buttons[n].active;

				if (irregular) {
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							boxNum[i][j] = -1;
						}
					}

					cells = [];
					regionCount = 0;
				} else {
					for (let i = 0; i < 9; i++) {
						for (let j = 0; j < 9; j++) {
							boxNum[i][j] = floor(i / 3) * 3 + floor(j / 3);
						}
					}
				}

				resetNotes();
				break;
			case 11:
				uniqueCheck = buttons[n].active;
				break;
		}
	}

	if (buttons[0].selected) {
		noteToggle = false;
		buttons[1].active = false;
	}

	if (buttons[1].selected) {
		noteToggle = true;
		buttons[0].active = false;
	}
}

function printNotes(row, col) {
	// Prints the notes and background color for each note in a cell
   strokeWeight(0);
	let noteColored = false;
	for (let i = 0; i < 9; i++) {
		if (!compareColor(noteColor[row][col][i], color("white"))) {
			noteColored = true;
			break;
		}
	}
   if (numPossible[row][col] !== 9 || noteColored) {
      textSize(floor(defaultText * 0.3));

      for (let i = 0; i < 9; i++) {
         push();
         translate(((i % 3) - 1) * (cellSize / 3), ((i - i % 3) / 3 - 1) * (cellSize / 3));
         if (notes[row][col][i]) {
            if (!compareColor(noteColor[row][col][i], color("white"))) {
               noStroke();
               rectMode(CENTER);
               fill(noteColor[row][col][i]);
               rect(0, 0, cellSize * 9 / 40, cellSize * 9 / 40);
            }
            strokeWeight(0);
            rectMode(CORNER);
            fill(0);
            text(i + 1, 0, 0);
         }
         pop();
      }

      textSize(defaultText);
   }
}

function mousePressed() {
   if (loadingScreen || guessing) {
		return;
	}

   let x = mouseX - cellSize;
   let y = mouseY - cellSize;
   if (x >= 0 && x <= cellSize * 9 && y >= 0 && y <= cellSize * 9) {
		// Handles clicks inside the grid
      if (sandwich) {
         selectedSandwich = [];
      }

	   if (!checkSolved()) {
         highlightedCell[0] = floor(y / cellSize);
         highlightedCell[1] = floor(x / cellSize);

         if (drawing) {
            newThermoCell(highlightedCell[0], highlightedCell[1]);
            thermoNotes();
            updateGrid();
         }

         if (makingSquare) {
            if (highlightedCell[0] > 0 && highlightedCell[0] < 8 && highlightedCell[1] > 0 && highlightedCell[1] < 8) {
					let exists = false;
					for (let i = 0; i < magicSquares.length; i++) {
						if (magicSquares[i][0] == highlightedCell[0] && magicSquares[i][1] == highlightedCell[1]) {
							magicSquares.splice(i);
							if (compareColor(digitColor[highlightedCell[0]][highlightedCell[1]], color("blue"))) {
								removeDigit(highlightedCell[0], highlightedCell[1]);
							} else {
								resetNotes();
							}
							exists = true;
							break;
						}
					}

					if (!exists) {
	               let valid = true;
	               for (let i = 0; i < magicSquares.length; i++) {
	                  if (orthoDist(magicSquares[i][0], magicSquares[i][1], highlightedCell[0], highlightedCell[1]) <= 3) {
	                     valid = false;
	                     break;
	                  }
	               }

	               if (checkValid(highlightedCell[0], highlightedCell[1], 5) && valid) {
	                  magicSquares.push([highlightedCell[0], highlightedCell[1]]);
							if (!compareColor(digitColor[highlightedCell[0]][highlightedCell[1]], color("black"))) {
								digitColor[highlightedCell[0]][highlightedCell[1]] = color("blue");
							}

							if (digits[highlightedCell[0]][highlightedCell[1]] == 0) {
								placeDigit(highlightedCell[0], highlightedCell[1], 5);
							}

							for (let i = -1; i <= 1; i++) {
								for (let j = -1; j <= 1; j++) {
									if (i !== 0 || j !== 0) {
										let row = highlightedCell[0] + i;
										let col = highlightedCell[1] + j;
										for (let k = 0; k < 4; k++) {
											let note;
											if (i == 0 || j == 0) {
												note = k * 2 + 1;
											} else {
												note = (k < 2) ? k * 2 : (k + 1) * 2;
											}

											numPossible[row][col] -= notes[row][col][note] ? 1 : 0;
											notes[row][col][note] = false;
										}
									}
								}
							}
	               }
					}
            }
         }
	   }
	} else if (x < 0 && y >= 0 && y <= cellSize * 9) {
      selectedSandwich = [0, floor(y / cellSize)];
      highlightedCell = [-1, -1];
   } else if (y < 0 && x >= 0 && x <= cellSize * 9) {
      selectedSandwich = [1, floor(x / cellSize)];
      highlightedCell = [-1, -1];
   } else {
      selectedSandwich = [];

		selection.clicked(mouseX, mouseY);
   }
}

function mouseDragged() {
   if (irregular) {
		// Adds cells to an irregular region
      if (cells.length < 9 && regionCount < 9) {
         let x = floor((mouseX - cellSize) / cellSize);
         let y = floor((mouseY - cellSize) / cellSize);

         if (boxNum[y][x] == -1) {
            let exists = false;

            for (let i = 0; i < cells.length; i++) {
               if (cells[i][0] == y && cells[i][1] == x) {
                  exists = true;
                  break;
               }
            }

            if (!exists) {
               cells.push([y, x]);
            }
         }
      }
   }
}

function mouseReleased() {
   if (irregular) {
		// Finalizes region
      if (cells.length == 9 && regionCount < 9) {
         for (let i = 0; i < cells.length; i++) {
            let row = cells[i][0];
            let col = cells[i][1];

            boxNum[row][col] = regionCount;
         }

         regionCount++;
      }

      cells = [];
   }
}

async function keyPressed() {
	// Function is async to handle awaiting checkSolvable, prevents recursive function from blocking animation
   if (loadingScreen || guessing) {
		loading();
	}

   if (!checkSolved()) {
      if (changingQueens && key >= 1 && key <= 9) {
         queensDigits[key - 1] = !queensDigits[key - 1];
         return;
      }
      if (sandwich && selectedSandwich.length !== 0) {
			// Handles sandwich control
         if (key >= 0 && key <= 9 && !loadingScreen) {
            if (sandwiches[selectedSandwich[0]][selectedSandwich[1]] == -1) {
               sandwiches[selectedSandwich[0]][selectedSandwich[1]] = 0;
            }

            sandwiches[selectedSandwich[0]][selectedSandwich[1]] *= 10;
            sandwiches[selectedSandwich[0]][selectedSandwich[1]] += parseInt(key);

            if (sandwiches[selectedSandwich[0]][selectedSandwich[1]] >= 10) {
               selectedSandwich[1]++;
            }

            if (selectedSandwich[1] == 9) {
               selectedSandwich[0] = (selectedSandwich[0] == 0) ? 1 : 0;
               selectedSandwich[1] = 0;
            }
         } else if (keyCode == DELETE || keyCode == BACKSPACE) {
				sandwiches[selectedSandwich[0]][selectedSandwich[1]] = -1;
         } else if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {
            selectedSandwich[1] += (selectedSandwich[0] == 0) ? ((keyCode == DOWN_ARROW) ? 1 : -1) : 0;
            selectedSandwich[0] = 0;

            if (selectedSandwich[1] < 0 || selectedSandwich[1] > 8) {
               selectedSandwich[0] = 1;
               selectedSandwich[1] = 0;
            }
         } else if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) {
            selectedSandwich[1] += (selectedSandwich[0] == 1) ? ((keyCode == RIGHT_ARROW) ? 1 : -1) : 0;
            selectedSandwich[0] = 1;

            if (selectedSandwich[1] < 0 || selectedSandwich[1] > 8) {
               selectedSandwich[0] = 0;
               selectedSandwich[1] = 0;
            }
         }
      } else if (thermo && drawing && (keyCode == DELETE || keyCode == BACKSPACE)) {
			thermometers.splice(thermometers.length - 1);
			resetNotes();
		} else if (magicSquare && makingSquare && (keyCode == DELETE || keyCode == BACKSPACE)) {
			let row = magicSquares[magicSquares.length - 1][0];
			let col = magicSquares[magicSquares.length - 1][1];
			removeDigit(row, col);

			magicSquares.splice(magicSquares.length - 1);
			resetNotes();
		} else if (key >= 1 && key <= 9 && !loadingScreen) {
			// Places digits and edits notes
         if (noteToggle) {
            notes[highlightedCell[0]][highlightedCell[1]][parseInt(key) - 1] = !notes[highlightedCell[0]][highlightedCell[1]][parseInt(key) - 1];
            numPossible[highlightedCell[0]][highlightedCell[1]] += notes[highlightedCell[0]][highlightedCell[1]][parseInt(key) - 1] ? 1 : -1;

            if (notes[highlightedCell[0]][highlightedCell[1]][parseInt(key) - 1]) {
               for (let i = 0; i < 9; i++) {
                  for (let j = 0; j < 9; j++) {
                     if (sees(i, j, highlightedCell[0], highlightedCell[1], digits[i][j], parseInt(key)) && digits[i][j] !== 0) {
                        notes[highlightedCell[0]][highlightedCell[1]][parseInt(key) - 1] = false;
                        numPossible[highlightedCell[0]][highlightedCell[1]]--;
                     }
                  }
               }
            }
         } else if (!noteToggle && checkValid(highlightedCell[0], highlightedCell[1], parseInt(key))) {
				if (!compareColor(digitColor[highlightedCell[0]][highlightedCell[1]], color("blue"))) {
	            digitColor[highlightedCell[0]][highlightedCell[1]] = color("black");
				}
            placeDigit(highlightedCell[0], highlightedCell[1], parseInt(key));
            highlightedCell[1]++;

            cursorWrap();
         } else if (!noteToggle && digits[highlightedCell[0]][highlightedCell[1]] !== 0) {
            let pval = digits[highlightedCell[0]][highlightedCell[1]];
            removeDigit(highlightedCell[0], highlightedCell[1]);
            if (checkValid(highlightedCell[0], highlightedCell[1], parseInt(key))) {
               placeDigit(highlightedCell[0], highlightedCell[1], parseInt(key));
            } else {
               placeDigit(highlightedCell[0], highlightedCell[1], pval);
            }
            highlightedCell[1]++;

            cursorWrap();
         }
      } else if ((keyCode == DELETE || keyCode == BACKSPACE) && !loadingScreen) {
			// Removes digits
         if (digits[highlightedCell[0]][highlightedCell[1]] == 0 && irregular) {
            regionCount--;
            for (let i = 0; i < 9; i++) {
               for (let j = 0; j < 9; j++) {
                  if (boxNum[i][j] == regionCount) {
                     boxNum[i][j] = -1;
                  }
               }
            }
         } else {
            removeDigit(highlightedCell[0], highlightedCell[1]);
         }
      } else if (keyCode == UP_ARROW || keyCode == DOWN_ARROW || key == 38 || keyCode == 40 && !loadingScreen) {
			// Scrolls up and down
         highlightedCell[0] += (keyCode == DOWN_ARROW || keyCode == 40) ? 1 : -1;

         cursorWrap();
      } else if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW || keyCode == 37 || keyCode == 39 && !loadingScreen) {
			// Scrolls left and right
         highlightedCell[1] += (keyCode == RIGHT_ARROW || keyCode == 39) ? 1 : -1;

         cursorWrap();
      } else if (key == ' ') {
			// Checks for unique solution or takes a step in the solution path
         highlightedCell = [-1, -1];

         if (!uniqueCheck) {
            await solve();
         } else if (recursDone) {
				if (await checkSolvable()) {
   	         await solve();
            } else {
               console.log("Puzzle is not uniquely solvable");
            }
			} else {
            loadingScreen = true;
				console.log("Checking if uniquely solvable");
				if (await checkSolvable()) {
					console.log("Puzzle is uniquely solvable");
				} else {
					console.log("Puzzle is not uniquely solvable");
				}

				loadingScreen = false;
			}
      }
   } else {
		// Shows the puzzle is solved or resets the grid
      if (key == " ") {
			console.log("Puzzle Solved!");
         for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
               digitColor[i][j] = color("green");
            }
         }

         highlightedCell = [-1, -1];
      } else if (keyCode == DELETE || keyCode == BACKSPACE) {
			console.log("Resetting grid!");
         initialize();
      }
   }
}

function cursorWrap() {
	// Handles wraping around grid during scrolling
   if (highlightedCell[1] == 9) {
      highlightedCell[1] = 0;
      highlightedCell[0]++;
   }

   if (highlightedCell[1] == -1) {
      highlightedCell[1] = 8;
      highlightedCell[0]--;
   }

   if (highlightedCell[0] == 9) {
      highlightedCell[0] = 0
   }

   if (highlightedCell[0] == -1) {
      highlightedCell[0] = 8;
   }
}

async function solve() {
	// Takes a step in solution path. Functions occur until the grid is changed
   changed = false;

   if (!changed) {
      updateGrid();
   }

	if (!changed) {
		singles();
	}

	if (!changed) {
		pairs();
	}

	if (!changed) {
		triples();
	}

   if (!changed) {
		quads();
	}

   if (!changed) {
		eliminate();
	}

   if (!changed) {
      xWing();
   }

   if (!changed) {
      yWing();
   }

   if (!changed) {
      swordfish();
   }

   if (!changed) {
      xyzWing();
   }

   if (!changed) {
      jellyfish();
   }

   if (!changed) {
      simpleChains();
   }

   if (!changed) {
      await guess();
   }


   if (!changed) {
      console.log("Sovler is stuck!");
   }

   // console.log("Solving!");
}

function placeDigit(row, col, num) {
	// Places a digit in a cell
   if (notes[row][col][num - 1] && numPossible[row][col] !== 0 && digits[row][col] == 0) {
      digits[row][col] = num;
      numPossible[row][col] = 0;
      for (let i = 0; i < 9; i++) {
         notes[row][col][i] = false;
      }
   }

   updateNotes(row, col, num);
}

function removeDigit(row, col) {
	// Removes a digit from a cell
   let pVal = digits[row][col];
   digits[row][col] = 0;

   for (let i = 0; i < 9; i++) {
      notes[row][col][i] = true;
   }

   numPossible[row][col] = 9;

	resetNotes();
}

function updateNotes(row, col, num) {
	// Updates the notes in the grid after placing a number
   for (let num2 = 1; num2 <= 9; num2++) {
      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            if (sees(row, col, i, j, num, num2) && digits[i][j] == 0) {
               numPossible[i][j] += notes[i][j][num2 - 1] ? -1 : 0;
               notes[i][j][num2 - 1] = false;
            }
         }
      }
   }

	if (thermo) {
		thermoNotes();
		updateGrid();
	}
}

function resetNotes() {
	// Resets notes as far as they can for the current placed digits
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (digits[i][j] == 0) {
				numPossible[i][j] = 9
				for (let k = 0; k < 9; k++) {
					notes[i][j][k] = true;
				}
			} else {
				for (let k = 0; k < 9; k++) {
					notes[i][j][k] = false;
				}
				numPossible[i][j] = 0;
			}
		}
	}

	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (digits[i][j] == 0) {
				for (let k = 0; k < 9; k++) {
					if (!checkValid(i, j, k + 1)) {
						notes[i][j][k] = false;
						numPossible[i][j]--;
					}
				}
			}
		}
	}

	if (thermo) {
		thermoNotes();
		updateGrid();
	}

	if (magicSquare) {
		for (let n = 0; n < magicSquares.length; n++) {
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (i !== 0 || j !== 0) {
						let row = magicSquares[n][0] + i;
						let col = magicSquares[n][1] + j;
						for (let k = 0; k < 4; k++) {
							let note;
							if (i == 0 || j == 0) {
								note = k * 2 + 1;
							} else {
								note = (k < 2) ? k * 2 : (k + 1) * 2;
							}

							numPossible[row][col] -= notes[row][col][note] ? 1 : 0;
							notes[row][col][note] = false;
						}
					}
				}
			}
		}
	}
}

function changeColor(row, col, note, c) {
	// Changes the color of a note, so the update grid function knows what to do
   if (!compareColor(noteColor[row][col][note - 1], color("red")) && !compareColor(noteColor[row][col][note - 1], color("green"))) {
      noteColor[row][col][note - 1] = c;
   }
}

function updateGrid() {
	// Places digit in cell if note is green, removes candidate from cell if note is red. Resets all colors to white after
   for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (digits[i][j] == 0) {
				for (let k = 0; k < 9; k++) {
					if (notes[i][j][k]) {
						if (compareColor(noteColor[i][j][k], color("green"))) {
							digitColor[i][j] = color("blue");
							placeDigit(i, j, k + 1);
							noteColor[i][j][k] = color("white");
							changed = true;
						} else if (compareColor(noteColor[i][j][k], color("red"))) {
							notes[i][j][k] = false;
							numPossible[i][j]--;
							noteColor[i][j][k] = color("white");
							changed = true;
						}
					}
				}
			}
		}
	}

	for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         for (let k = 0; k < 9; k++) {
            if (!compareColor(noteColor[i][j][k], color("white"))) {
               noteColor[i][j][k] = color("white");
            }
         }
      }
   }
}

function findMin(row, col) {
   if (digits[row][col] !== 0) {
      return digits[row][col];
   }

   let val = 1;

   for (val = 1; val <= 9; val++) {
      if (notes[row][col][val - 1]) {
         break;
      }
   }

   if (thermo) {
      let info = onThermo(row, col);

      if (info.length > 1) {
         // Detect Split at this cell
         let prevCells = [];
         for (let i = 0; i < info.length; i++) {
            let index = info[i][0];
            let cell = info[i][1];

            if (cell > 0) {
               let exists = false;
               for (let j = 0; j < prevCells.length; j++) {
                  if (thermometers[index][cell - 1][0] == prevCells[j][0] && thermometers[index][cell - 1][1] == prevCells[j][1]) {
                     exists = true;
                     break;
                  }
               }

               if (!exists) {
                  prevCells.push(thermometers[index][cell - 1]);
               }
            }
         }

         if (prevCells.length > 1) {
            // Loop through prevCells, find all that see each other, set up arr of cells in those thermos, determine how many different nums are needed

            for (let n = 0; n < prevCells.length; n++) {
               let seenCells = [prevCells[n]];
               for (let i = 0; i < prevCells.length; i++) {
                  let exists = false;
                  let seesAll = true;
                  for (let j = 0; j < seenCells.length; j++) {
                     if (prevCells[i][0] == seenCells[j][0] && prevCells[i][1] == seenCells[j][1]) {
                        exists = true;
                        break;
                     }

                     if (!sees(prevCells[i][0], prevCells[i][1], seenCells[j][0], seenCells[j][1])) {
                        seesAll = false;
                        break;
                     }
                  }

                  if (!exists && seesAll) {
                     seenCells.push(prevCells[i]);
                  }
               }

               let thermos = [];
               for (let j = 0; j < seenCells.length; j++) {
                  let thermoInfo = onThermo(seenCells[j][0], seenCells[j][1]);
                  for (let k = 0; k < thermoInfo.length; k++) {
                     for (let m = 0; m < info.length; m++) {
                        if (info[m][0] == thermoInfo[k][0]) {
                           thermos.push(info[m]);
                           break;
                        }
                     }
                  }
               }

               let arr = [];
               for (let j = 0; j < thermos.length; j++) {
                  for (let k = thermos[j][1] - 1; k >= 0; k--) {
                     let exists = false;
                     for (let m = 0; m < arr.length; m++) {
                        if (thermometers[thermos[j][0]][k][0] == arr[m][0] && thermometers[thermos[j][0]][k][1] == arr[m][1]) {
                           exists = true;
                           break;
                        }
                     }

                     if (!exists) {
                        arr.push(thermometers[thermos[j][0]][k]);
                     }
                  }
               }

               thermo = false;
               let smallerCells = differentCellNums(arr);
               for (let j = 0; j < seenCells.length; j++) {
                  if (!sees(row, col, seenCells[j][0], seenCells[j][1])) {
                     smallerCells--;
                  }
               }
               thermo = true;

               if (val <= smallerCells) {
                  val = smallerCells + 1;
               }
            }
         }
      }

      for (let i = 0; i < info.length; i++) {
         let thermometer = info[i][0];
         let index = info[i][1];

         if (index > 0) {
            let row1 = thermometers[thermometer][index - 1][0];
            let col1 = thermometers[thermometer][index - 1][1];
            let minVal = findMin(row1, col1);

            if (val < minVal + 1) {
               val = minVal + 1;
            }
         }
      }
   }

   return val;
}

function findMax(row, col) {
   if (digits[row][col] !== 0) {
      return digits[row][col];
   }

   let val = 9;

   for (val = 9; val >= 1; val--) {
      if (notes[row][col][val - 1]) {
         break;
      }
   }

   if (thermo) {
      let info = onThermo(row, col);

      if (info.length !== 1) {
         // Detect Split at this cell
         let nextCells = [];
         for (let i = 0; i < info.length; i++) {
            let index = info[i][0];
            let cell = info[i][1];

            if (cell < thermometers[index].length - 1) {
               let exists = false;
               for (let j = 0; j < nextCells.length; j++) {
                  if (thermometers[index][cell + 1][0] == nextCells[j][0] && thermometers[index][cell + 1][1] == nextCells[j][1]) {
                     exists = true;
                     break;
                  }
               }

               if (!exists) {
                  nextCells.push(thermometers[index][cell + 1]);
               }
            }
         }

         if (nextCells.length > 1) {
            // Loop through nextCells, find all that see each other, set up arr of cells in those thermos, determine how many different nums are needed

            for (let n = 0; n < nextCells.length; n++) {
               let seenCells = [nextCells[n]];
               for (let i = 0; i < nextCells.length; i++) {
                  let exists = false;
                  let seesAll = true;
                  for (let j = 0; j < seenCells.length; j++) {
                     if (nextCells[i][0] == seenCells[j][0] && nextCells[i][1] == seenCells[j][1]) {
                        exists = true;
                        break;
                     }

                     if (!sees(nextCells[i][0], nextCells[i][1], seenCells[j][0], seenCells[j][1])) {
                        seesAll = false;
                        break;
                     }
                  }

                  if (!exists && seesAll) {
                     seenCells.push(nextCells[i]);
                  }
               }

               let thermos = [];
               for (let j = 0; j < seenCells.length; j++) {
                  let thermoInfo = onThermo(seenCells[j][0], seenCells[j][1]);
                  for (let k = 0; k < thermoInfo.length; k++) {
                     for (let m = 0; m < info.length; m++) {
                        if (info[m][0] == thermoInfo[k][0]) {
                           thermos.push(info[m]);
                           break;
                        }
                     }
                  }
               }

               let arr = [];
               for (let j = 0; j < thermos.length; j++) {
                  for (let k = thermos[j][1] + 1; k < thermometers[thermos[j][0]].length; k++) {
                     let exists = false;
                     for (let m = 0; m < arr.length; m++) {
                        if (thermometers[thermos[j][0]][k][0] == arr[m][0] && thermometers[thermos[j][0]][k][1] == arr[m][1]) {
                           exists = true;
                           break;
                        }
                     }

                     if (!exists) {
                        arr.push(thermometers[thermos[j][0]][k]);
                     }
                  }
               }

               thermo = false;
               let largerCells = differentCellNums(arr);
               for (let j = 0; j < seenCells.length; j++) {
                  if (!sees(row, col, seenCells[j][0], seenCells[j][1])) {
                     largerCells--;
                  }
               }
               thermo = true;

               if (val > (9 - largerCells)) {
                  val = (9 - largerCells);
               }
            }
         }
      }

      for (let i = 0; i < info.length; i++) {
         let therm = info[i][0];
         let index = info[i][1];
         if (index < thermometers[therm].length - 1) {
            let row1 = thermometers[therm][index + 1][0];
            let col1 = thermometers[therm][index + 1][1];
            let maxVal = findMax(row1, col1);

            if (val > maxVal - 1) {
               val = maxVal - 1;
            }
         }
      }
   }

   return val;
}

function differentCellNums(arr) {
   let count = 0;

   for (let i = 0; i < arr.length; i++) {
      let row = arr[i][0];
      let col = arr[i][1];
      let cellSees = 0;

      for (let j = 0; j < arr.length; j++) {
         let row1 = arr[j][0];
         let col1 = arr[j][1];

         cellSees += (sees(row1, col1, row, col)) ? 1 : 0;
      }

      if (cellSees > count) {
         count = cellSees;
      }
   }

   return count + 1;
}

function newThermoCell(row, col) {
   let onThisThermo = false;
   let thermoInfo = onThermo(row, col);
   for (let i = 0; i < thermoInfo.length; i++) {
      let index = thermoInfo[i][0];
      if (index == thermometers.length - 1) {
         onThisThermo = true;
         break;
      }
   }

	if (buttons[2].selected && thermometers.length == 0) {
		thermometers.push([]);
	}

   if (onThisThermo) {
      for (let i = 0; i < thermometers[thermometers.length - 1].length; i++) {
         let row1 = thermometers[thermometers.length - 1][i][0];
         let col1 = thermometers[thermometers.length - 1][i][1];
         if (row1 == row && col1 == col) {
            for (let j = thermometers[thermometers.length - 1].length - 1; j > i; j--) {
               let row2 = thermometers[thermometers.length - 1][j][0];
               let col2 = thermometers[thermometers.length - 1][j][1];

               thermometers[thermometers.length - 1].splice(j);
               resetNotes();
            }
         }
      }
   } else {
      if (thermometers[thermometers.length - 1].length !== 0) {
         let row1 = thermometers[thermometers.length - 1][thermometers[thermometers.length - 1].length - 1][0];
         let col1 = thermometers[thermometers.length - 1][thermometers[thermometers.length - 1].length - 1][1];

         if (abs(row1 - row) <= 1 && abs(col1 - col) <= 1 && thermometers[thermometers.length - 1].length !== 9) {
            thermometers[thermometers.length - 1].push([row, col]);
         }
      } else {
         thermometers[thermometers.length - 1].push([row, col]);
      }
   }
}

function onThermo(row, col) {
	// Determines if a specific cell is on any thermo
	let thermoInfo = [];
	for (let i = 0; i < thermometers.length; i++) {
      for (let j = 0; j < thermometers[i].length; j++) {
         let row1 = thermometers[i][j][0];
         let col1 = thermometers[i][j][1];
   		if (row1 == row && col1 == col) {
   			let index = thermoIndex(row, col, i);
   			thermoInfo.push([i, index]);
   		}
      }
	}

	return thermoInfo;
}

function thermoIndex(row, col, index) {
   for (let i = 0; i < thermometers[index].length; i++) {
      let row1 = thermometers[index][i][0];
      let col1 = thermometers[index][i][1]
      if (row1 == row && col1 == col) {
         return i;
      }
   }
}

function thermoGridIndex(thermometer, index) {
   if (index < thermometers[thermometer].length && index >= 0) {
      return thermometers[thermometer][index];
   }
}


function thermoBreaks(num, row, col, index) {
   let min = findMin(row, col);
   let max = findMax(row, col);

   return (num < min || num > max);
}

function thermoInOrder(index) {
   for (let i = 0; i < thermometers[index].length; i++) {
      let row = thermometers[index][i][0];
      let col = thermometers[index][i][1];

      for (let j = 0; j < thermometers[index].length; j++) {
         let row1 = thermometers[index][j][0];
         let col1 = thermometers[index][j][1];

         if (j < i) {
            if (digits[row1][col1] > digits[row][col]) {
               return false;
            }
         } else if (j > i) {
            if (digits[row1][col1] < digits[row][col]) {
               return false;
            }
         }
      }
   }

   return true;
}

function thermoFilled(index) {
   for (let i = 0; i < thermometers[index].length; i++) {
      let row = thermometers[index][i][0];
      let col = thermometers[index][i][1];

      if (digits[row][col] == 0) {
         return false;
      }
   }

   return true;
}

function thermoNotes() {
	// Handles notes along thermometers
   for (let n = 0; n < thermometers.length; n++) {
		for (let i = 0; i < thermometers[n].length; i++) {
			let changeMade = false;
			let row = thermometers[n][i][0];
			let col = thermometers[n][i][1];
			let min = findMin(row, col);
			let max = findMax(row, col);

			for (let j = 1; j <= 9; j++) {
				if (notes[row][col][j - 1] && (j < min || j > max)) {
					changeColor(row, col, j, color("red"));
					changeMade = true;
					changed = true;
				}
			}

			if (changeMade) {
				for (let j = 1; j <= 9; j++) {
					if (notes[row][col][j - 1] && (j >= min && j <= max)) {
						changeColor(row, col, j, color("yellow"));
					}
				}
			}
		}
	}
}

function magicNotes() {
	// Handles notes in magic square and ensures rows, columns, and diagonals all sum to 15
	for (let n = 0; n < magicSquares.length; n++) {
		let row = magicSquares[n][0];
		let col = magicSquares[n][1];

		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				if (i !== 0 && j !== 0) {
					if (digits[row + i][col + j] == 0) {
						for (let num = 1; num <= 9; num++) {
							if (!notes[row - i][col - j][(10 - num) - 1] && notes[row + i][col + j][num - 1]) {
								changeColor(row + i, col + j, num, color("red"));
							}
						}
					} else {
						changeColor(row - i, col - j, 10 - digits[row + i][col + j], color("green"));
					}
				}
			}
		}

		for (let num = 1; num <= 9; num++) {
			if (num !== 5) {
				let locs = [];
				for (let i = -1; i <= 1; i++) {
					for (let j = -1; j <= 1; j++) {
						if (digits[row + i][col + j] !== 0 && notes[row + i][col + j][num - 1]) {
							locs.push([i, j]);
						}
					}
				}

				if (locs.length == 2) {
					if (num % 2 == 0) {
						// Even Numbers

						if (locs[0][0] == locs[1][0] || locs[0][1] == locs[1][1]) {
							let changeMade = false;
							let tempRow = row + (locs[0][0] + locs[1][0]) * 0.5;
							let tempCol = col + (locs[0][1] + locs[1][1]) * 0.5;

							switch (num) {
								case 2:
									if (notes[tempRow][tempCol][0] || notes[tempRow][tempCol][2]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 1, color("red"));
									changeColor(tempRow, tempCol, 3, color("red"));
									break;
								case 4:
									if (notes[tempRow][tempCol][0] || notes[tempRow][tempCol][6]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 1, color("red"));
									changeColor(tempRow, tempCol, 7, color("red"));
									break;
								case 6:
									if (notes[tempRow][tempCol][2] || notes[tempRow][tempCol][8]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 3, color("red"));
									changeColor(tempRow, tempCol, 9, color("red"));
									break;
								case 8:
									if (notes[tempRow][tempCol][6] || notes[tempRow][tempCol][8]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 7, color("red"));
									changeColor(tempRow, tempCol, 9, color("red"));
									break;
							}

							if (changeMade) {
								changeColor(locs[0][0], locs[0][1], num, color("yellow"));
								changeColor(locs[1][0], locs[1][1], num, color("yellow"));
							}
						}
					} else {
						// Odd Numbers

						if (!(locs[0][0] == locs[1][0] || locs[0][1] == locs[1][1])) {
							let changeMade = false;
							let tempRow = row + locs[0][0] + locs[1][0];
							let tempCol = col + locs[0][1] + locs[1][1];

							switch (num) {
								case 1:
									if (notes[tempRow][tempCol][1] || notes[tempRow][tempCol][3]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 2, color("red"));
									changeColor(tempRow, tempCol, 4, color("red"));
									break;
								case 3:
									if (notes[tempRow][tempCol][1] || notes[tempRow][tempCol][5]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 2, color("red"));
									changeColor(tempRow, tempCol, 6, color("red"));
									break;
								case 7:
									if (notes[tempRow][tempCol][3] || notes[tempRow][tempCol][7]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 4, color("red"));
									changeColor(tempRow, tempCol, 8, color("red"));
									break;
								case 9:
									if (notes[tempRow][tempCol][5] || notes[tempRow][tempCol][7]) {
										changeMade = true;
									}
									changeColor(tempRow, tempCol, 6, color("red"));
									changeColor(tempRow, tempCol, 8, color("red"));
									break;
							}

							if (changeMade) {
								changeColor(locs[0][0], locs[0][1], num, color("yellow"));
								changeColor(locs[1][0], locs[1][1], num, color("yellow"));
							}
						}
					}
				}
			}
		}

		for (let num = 1; num <= 9; num++) {
         if (num == 5) {
            continue;
         }
			let found = false;
			for (let i = -1; i <= 1; i++) {
				for (let j = -1; j <= 1; j++) {
					if (digits[row + i][col + j] == num) {
						found = true;

                  for (let a = -1; a <= 1; a++) {
                     for (let b = -1; b <= 1; b++) {
                        if (!(a == 0 && b == 0) && (orthoDist(i, j, a, b) == 1)) {
                           switch (num) {
                              case 1:
                                 if ((notes[row + a][col + b][5] || notes[row + a][col + b][7]) && (notes[row + a][col + b][1] || notes[row + a][col + b][3])) {
                                    changeColor(row + a, col + b, 6, color("yellow"));
                                    changeColor(row + a, col + b, 8, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 2, color("red"));
                                 changeColor(row + a, col + b, 4, color("red"));
                                 break;
                              case 2:
                                 if ((notes[row + a][col + b][6] || notes[row + a][col + b][8]) && (notes[row + a][col + b][0] || notes[row + a][col + b][2])) {
                                    changeColor(row + a, col + b, 7, color("yellow"));
                                    changeColor(row + a, col + b, 9, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 1, color("red"));
                                 changeColor(row + a, col + b, 3, color("red"));
                                 break;
                              case 3:
                                 if ((notes[row + a][col + b][3] || notes[row + a][col + b][7]) && (notes[row + a][col + b][1] || notes[row + a][col + b][5])) {
                                    changeColor(row + a, col + b, 4, color("yellow"));
                                    changeColor(row + a, col + b, 8, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 2, color("red"));
                                 changeColor(row + a, col + b, 6, color("red"));
                                 break;
                              case 4:
                                 if ((notes[row + a][col + b][2] || notes[row + a][col + b][8]) && (notes[row + a][col + b][0] || notes[row + a][col + b][6])) {
                                    changeColor(row + a, col + b, 3, color("yellow"));
                                    changeColor(row + a, col + b, 9, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 1, color("red"));
                                 changeColor(row + a, col + b, 7, color("red"));
                                 break;
                              case 6:
                                 if ((notes[row + a][col + b][0] || notes[row + a][col + b][6]) && (notes[row + a][col + b][2] || notes[row + a][col + b][8])) {
                                    changeColor(row + a, col + b, 1, color("yellow"));
                                    changeColor(row + a, col + b, 7, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 3, color("red"));
                                 changeColor(row + a, col + b, 9, color("red"));
                                 break;
                              case 7:
                                 if ((notes[row + a][col + b][1] || notes[row + a][col + b][5]) && (notes[row + a][col + b][3] || notes[row + a][col + b][7])) {
                                    changeColor(row + a, col + b, 2, color("yellow"));
                                    changeColor(row + a, col + b, 6, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 4, color("red"));
                                 changeColor(row + a, col + b, 8, color("red"));
                                 break;
                              case 8:
                                 if ((notes[row + a][col + b][0] || notes[row + a][col + b][2]) && (notes[row + a][col + b][6] || notes[row + a][col + b][8])) {
                                    changeColor(row + a, col + b, 1, color("yellow"));
                                    changeColor(row + a, col + b, 3, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 7, color("red"));
                                 changeColor(row + a, col + b, 9, color("red"));
                                 break;
                              case 9:
                                 if ((notes[row + a][col + b][1] || notes[row + a][col + b][3]) && (notes[row + a][col + b][5] || notes[row + a][col + b][7])) {
                                    changeColor(row + a, col + b, 2, color("yellow"));
                                    changeColor(row + a, col + b, 4, color("yellow"));
                                 }
                                 changeColor(row + a, col + b, 6, color("red"));
                                 changeColor(row + a, col + b, 8, color("red"));
                                 break;
                              }
                           }
                        }
                     }

                  break;
               }
				}

				if (found) {
					break;
				}
			}
		}
	}
}

function singles() {
	// Hidden Singles
	for (let num = 1; num <= 9; num++) {
		for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
			let locs = numberLocs(unit, num);

         if (locs == -1) {
            continue;
         }

			if (locs.length == 1) {
            if (!compareColor(noteColor[locs[0][0]][locs[0][1]][num - 1], color("green"))) {
   				changeColor(locs[0][0], locs[0][1], num, color("green"));
   				changed = true;
               console.log("Hidden single in " + getUnitString(unit) + ". " + num + " can be placed at r" + (locs[0][0] + 1) + "c" + (locs[0][1] + 1) + ".");
            }
			}
		}
	}

   if (changed) {
      return;
   }


   // Naked Singles
   for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         if (numPossible[i][j] == 1) {
            for (let num = 1; num <= 9; num++) {
               if (notes[i][j][num - 1] && !compareColor(noteColor[i][j][num - 1], color("green"))) {
                  changeColor(i, j, num, color("green"));
						changed = true;
                  console.log("Naked single at r" + (i + 1) + "c" + (j + 1) + ". " + num + " can be placed at r" + (i + 1) + "c" + (j + 1));
               }
            }
         }
      }
   }
}

function pairs() {
	// Naked pairs
	for (let a = 1; a <= 8; a++) {
		for (let b = a + 1; b <= 9; b++) {
			for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
				let aLocs = numberLocs(unit, a);
				let bLocs = numberLocs(unit, b);

            if (aLocs == -1 || bLocs == -1) {
               continue;
            }

				let locs = [];

				for (let i = 0; i < aLocs.length; i++) {
					let row = aLocs[i][0];
					let col = aLocs[i][1];

					if (numPossible[row][col] == 2 && notes[row][col][a - 1] && notes[row][col][b - 1]) {
						locs.push([row, col]);
					}
				}

				for (let i = 0; i < bLocs.length; i++) {
					let row = bLocs[i][0];
					let col = bLocs[i][1];

					if (numPossible[row][col] == 2 && notes[row][col][a - 1] && notes[row][col][b - 1]) {
						let exists = false;
						for (let j = 0; j < locs.length; j++) {
							if (locs[j][0] == row && locs[j][1] == col) {
								exists = true;
								break;
							}
						}

						if (!exists) {
							locs.push([row, col]);
						}
					}
				}

				if (locs.length == 2) {
					let row1 = locs[0][0];
					let col1 = locs[0][1];
					let row2 = locs[1][0];
					let col2 = locs[1][1];

               for (let num = 1; num <= 9; num++) {
   					for (let i = 0; i < 9; i++) {
   						for (let j = 0; j < 9; j++) {
   							if (((sees(i, j, row1, col1, num, a) && sees(i, j, row2, col2, num, a)) || (sees(i, j, row1, col1, num, b) && sees(i, j, row2, col2, num, b))) && notes[i][j][num - 1]) {
   								changeColor(i, j, num, color("red"));
   								changed = true;
   							}
   						}
   					}
               }

					if (changed) {
						changeColor(row1, col1, a, color("yellow"));
						changeColor(row1, col1, b, color("yellow"));
						changeColor(row2, col2, a, color("yellow"));
						changeColor(row2, col2, b, color("yellow"));
                  console.log("Naked pair in " + getUnitString(unit) + ". " + a +  " and " + b + " can be removed at all cells seen by r" + (row1 + 1) + "c" + (col1 + 1) + " and r" + (row2 + 1) + "c" + (col2 + 1) + ".");
						return;
					}
				}
			}
		}
	}

	// Hidden pairs
	for (let a = 1; a <= 8; a++) {
		for (let b = a + 1; b <= 9; b++) {
			for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
				let aLocs = numberLocs(unit, a);
				let bLocs = numberLocs(unit, b);

            if (aLocs == -1 || bLocs == -1) {
               continue;
            }

				if (aLocs.length == 2 && bLocs.length == 2) {
					let locs = [];
					for (let i = 0; i < aLocs.length; i++) {
						let aRow = aLocs[i][0];
						let aCol = aLocs[i][1];
						for (let j = 0; j < bLocs.length; j++) {
							let bRow = bLocs[j][0];
							let bCol = bLocs[j][1];

							if (aRow == bRow && aCol == bCol) {
								locs.push([aRow, aCol]);
							}
						}
					}

					if (locs.length == 2) {
						let row1 = locs[0][0];
						let col1 = locs[0][1];
						let row2 = locs[1][0];
						let col2 = locs[1][1];

						for (let num = 1; num <= 9; num++) {
							if (num !== a && num !== b) {
								if (notes[row1][col1][num - 1]) {
									changeColor(row1, col1, num, color("red"));
									changed = true;
								}

								if (notes[row2][col2][num - 1]) {
									changeColor(row2, col2, num, color("red"));
									changed = true;
								}
							}
						}

						if (changed) {
							changeColor(row1, col1, a, color("yellow"));
							changeColor(row1, col1, b, color("yellow"));
							changeColor(row2, col2, a, color("yellow"));
							changeColor(row2, col2, b, color("yellow"));
                     console.log("Hidden pair in " + getUnitString(unit) + ". All candidates except " + a +  " and " + b + " can be removed at r" + (row1 + 1) + "c" + (col1 + 1) + " and r" + (row2 + 1) + "c" + (col2 + 1) + ".");
							return;
						}
					}
				}
			}
		}
	}
}

function triples() {
	// Naked triples
	for (let a = 1; a <= 7; a++) {
		for (let b = a + 1; b <= 8; b++) {
			for (let c = b + 1; c <= 9; c++) {
				for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
					let aLocs = numberLocs(unit, a);
					let bLocs = numberLocs(unit, b);
					let cLocs = numberLocs(unit, c);
					let locs = [];

               if (aLocs == -1 || bLocs == -1 || cLocs == -1) {
                  continue;
               }

					if (!(aLocs.length == 0 || bLocs.length == 0 || cLocs.length == 0)) {
						for (let i = 0; i < aLocs.length; i++) {
							let row = aLocs[i][0];
							let col = aLocs[i][1];

							let onlyNums = true;
							for (let num = 1; num <= 9; num++) {
								if (num !== a && num !== b && num !== c && notes[row][col][num - 1]) {
									onlyNums = false;
									break;
								}
							}

							if (onlyNums) {
								locs.push([row, col]);
							}
						}

						for (let i = 0; i < bLocs.length; i++) {
							let row = bLocs[i][0];
							let col = bLocs[i][1];

							let onlyNums = true;
							for (let num = 1; num <= 9; num++) {
								if (num !== a && num !== b && num !== c && notes[row][col][num - 1]) {
									onlyNums = false;
									break;
								}
							}

							if (onlyNums) {
								let exists = false;
								for (let j = 0; j < locs.length; j++) {
									if (locs[j][0] == row && locs[j][1] == col) {
										exists = true;
										break;
									}
								}

								if (!exists) {
									locs.push([row, col]);
								}
							}
						}

						for (let i = 0; i < cLocs.length; i++) {
							let row = cLocs[i][0];
							let col = cLocs[i][1];

							let onlyNums = true;
							for (let num = 1; num <= 9; num++) {
								if (num !== a && num !== b && num !== c && notes[row][col][num - 1]) {
									onlyNums = false;
									break;
								}
							}

							if (onlyNums) {
								let exists = false;
								for (let j = 0; j < locs.length; j++) {
									if (locs[j][0] == row && locs[j][1] == col) {
										exists = true;
										break;
									}
								}

								if (!exists) {
									locs.push([row, col]);
								}
							}
						}

						if (locs.length == 3) {
							let row1 = locs[0][0];
							let col1 = locs[0][1];
							let row2 = locs[1][0];
							let col2 = locs[1][1];
							let row3 = locs[2][0];
							let col3 = locs[2][1];

                     for (let num = 1; num <= 9; num++) {
   							for (let i = 0; i < 9; i++) {
   								for (let j = 0; j < 9; j++) {
   									if (((sees(i, j, row1, col1, num, a) && sees(i, j, row2, col2, num, a) && sees(i, j, row3, col3, num, a)) || (sees(i, j, row1, col1, num, b) && sees(i, j, row2, col2, num, b) && sees(i, j, row3, col3, num, b)) || (sees(i, j, row1, col1, num, c) && sees(i, j, row2, col2, num, c) && sees(i, j, row3, col3, num, c))) && notes[i][j][num - 1]) {
   										changeColor(i, j, num, color("red"));
   										changed = true;
   									}
   								}
   							}
                     }

							if (changed) {
								changeColor(row1, col1, a, color("yellow"));
								changeColor(row1, col1, b, color("yellow"));
								changeColor(row1, col1, c, color("yellow"));
								changeColor(row2, col2, a, color("yellow"));
								changeColor(row2, col2, b, color("yellow"));
								changeColor(row2, col2, c, color("yellow"));
								changeColor(row3, col3, a, color("yellow"));
								changeColor(row3, col3, b, color("yellow"));
								changeColor(row3, col3, c, color("yellow"));
                        console.log("Naked triple in " + getUnitString(unit) + ". " + a +  ", " + b +  ", and " + c + " can be removed at all cells seen by r" + (row1 + 1) + "c" + (col1 + 1) + ", r" + (row2 + 1) + "c" + (col2 + 1) + ", and r" + (row3 + 1) + "c" + (col3 + 1) + ".");
								return;
							}
						}
					}
				}
			}
		}
	}

	// Hidden triples
	for (let a = 1; a <= 7; a++) {
		for (let b = a + 1; b <= 8; b++) {
			for (let c = b + 1; c <= 9; c++) {
				for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
					let aLocs = numberLocs(unit, a);
					let bLocs = numberLocs(unit, b);
					let cLocs = numberLocs(unit, c);

               if (aLocs == -1 || bLocs == -1 || cLocs == -1) {
                  continue;
               }

					if (aLocs.length <= 3 && bLocs.length <= 3 && cLocs.length <= 3 && !(aLocs.length == 0 || bLocs.length == 0 || cLocs.length == 0)) {
						let locs = [];

						for (let i = 0; i < aLocs.length; i++) {
							let row = aLocs[i][0];
							let col = aLocs[i][1];

							locs.push([row, col]);
						}

						for (let i = 0; i < bLocs.length; i++) {
							let row = bLocs[i][0];
							let col = bLocs[i][1];

							let exists = false;
							for (let j = 0; j < locs.length; j++) {
								if (locs[j][0] == row && locs[j][1] == col) {
									exists = true;
									break;
								}
							}

							if (!exists) {
								locs.push([row, col]);
							}
						}

						for (let i = 0; i < cLocs.length; i++) {
							let row = cLocs[i][0];
							let col = cLocs[i][1];

							let exists = false;
							for (let j = 0; j < locs.length; j++) {
								if (locs[j][0] == row && locs[j][1] == col) {
									exists = true;
									break;
								}
							}

							if (!exists) {
								locs.push([row, col]);
							}
						}

						if (locs.length == 3) {
							let row1 = locs[0][0];
							let col1 = locs[0][1];
							let row2 = locs[1][0];
							let col2 = locs[1][1];
							let row3 = locs[2][0];
							let col3 = locs[2][1];


							for (let num = 1; num <= 9; num++) {
								if (num !== a && num !== b && num !== c) {
									if (notes[row1][col1][num - 1]) {
										changeColor(row1, col1, num, color("red"));
										changed = true;
									}

									if (notes[row2][col2][num - 1]) {
										changeColor(row2, col2, num, color("red"));
										changed = true;
									}

									if (notes[row3][col3][num - 1]) {
										changeColor(row3, col3, num, color("red"));
										changed = true;
									}
								}
							}

							if (changed) {
								changeColor(row1, col1, a, color("yellow"));
								changeColor(row1, col1, b, color("yellow"));
								changeColor(row1, col1, c, color("yellow"));
								changeColor(row2, col2, a, color("yellow"));
								changeColor(row2, col2, b, color("yellow"));
								changeColor(row2, col2, c, color("yellow"));
								changeColor(row3, col3, a, color("yellow"));
								changeColor(row3, col3, b, color("yellow"));
								changeColor(row3, col3, c, color("yellow"));
                        console.log("Hidden triple in " + getUnitString(unit) + ". All candidates except " + a +  ", " + b +  ", and " + c + " can be removed at r" + (row1 + 1) + "c" + (col1 + 1) + ", r" + (row2 + 1) + "c" + (col2 + 1) + ", and r" + (row3 + 1) + "c" + (col3 + 1) + ".");
								return;
							}
						}
					}
				}
			}
		}
	}
}

function quads() {
   // Naked quads
	for (let a = 1; a <= 6; a++) {
		for (let b = a + 1; b <= 7; b++) {
			for (let c = b + 1; c <= 8; c++) {
            for (let d = c + 1; d <= 9; d++) {
   				for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
   					let aLocs = numberLocs(unit, a);
   					let bLocs = numberLocs(unit, b);
   					let cLocs = numberLocs(unit, c);
                  let dLocs = numberLocs(unit, d);

                  if (aLocs == -1 || bLocs == -1 || cLocs == -1 || dLocs == -1) {
                     continue;
                  }

   					let locs = [];

   					if (!(aLocs.length == 0 || bLocs.length == 0 || cLocs.length == 0 || dLocs.length == 0)) {
   						for (let i = 0; i < aLocs.length; i++) {
   							let row = aLocs[i][0];
   							let col = aLocs[i][1];

   							let onlyNums = true;
   							for (let num = 1; num <= 9; num++) {
   								if (num !== a && num !== b && num !== c && num !== d && notes[row][col][num - 1]) {
   									onlyNums = false;
   									break;
   								}
   							}

   							if (onlyNums) {
   								locs.push([row, col]);
   							}
   						}

   						for (let i = 0; i < bLocs.length; i++) {
   							let row = bLocs[i][0];
   							let col = bLocs[i][1];

   							let onlyNums = true;
   							for (let num = 1; num <= 9; num++) {
   								if (num !== a && num !== b && num !== c && num !== d && notes[row][col][num - 1]) {
   									onlyNums = false;
   									break;
   								}
   							}

   							if (onlyNums) {
   								let exists = false;
   								for (let j = 0; j < locs.length; j++) {
   									if (locs[j][0] == row && locs[j][1] == col) {
   										exists = true;
   										break;
   									}
   								}

   								if (!exists) {
   									locs.push([row, col]);
   								}
   							}
   						}

   						for (let i = 0; i < cLocs.length; i++) {
   							let row = cLocs[i][0];
   							let col = cLocs[i][1];

   							let onlyNums = true;
   							for (let num = 1; num <= 9; num++) {
   								if (num !== a && num !== b && num !== c && num !== d && notes[row][col][num - 1]) {
   									onlyNums = false;
   									break;
   								}
   							}

   							if (onlyNums) {
   								let exists = false;
   								for (let j = 0; j < locs.length; j++) {
   									if (locs[j][0] == row && locs[j][1] == col) {
   										exists = true;
   										break;
   									}
   								}

   								if (!exists) {
   									locs.push([row, col]);
   								}
   							}
   						}

                     for (let i = 0; i < dLocs.length; i++) {
   							let row = dLocs[i][0];
   							let col = dLocs[i][1];

   							let onlyNums = true;
   							for (let num = 1; num <= 9; num++) {
   								if (num !== a && num !== b && num !== c && num !== d && notes[row][col][num - 1]) {
   									onlyNums = false;
   									break;
   								}
   							}

   							if (onlyNums) {
   								let exists = false;
   								for (let j = 0; j < locs.length; j++) {
   									if (locs[j][0] == row && locs[j][1] == col) {
   										exists = true;
   										break;
   									}
   								}

   								if (!exists) {
   									locs.push([row, col]);
   								}
   							}
   						}

   						if (locs.length == 4) {
   							let row1 = locs[0][0];
   							let col1 = locs[0][1];
   							let row2 = locs[1][0];
   							let col2 = locs[1][1];
   							let row3 = locs[2][0];
   							let col3 = locs[2][1];
                        let row4 = locs[3][0];
   							let col4 = locs[3][1];

                        for (let num = 1; num <= 9; num++) {
      							for (let i = 0; i < 9; i++) {
      								for (let j = 0; j < 9; j++) {
                                 if (((sees(i, j, row1, col1, num, a) && sees(i, j, row2, col2, num, a) && sees(i, j, row3, col3, num, a) && sees(i, j, row4, col4, num, a)) || (sees(i, j, row1, col1, num, b) && sees(i, j, row2, col2, num, b) && sees(i, j, row3, col3, num, b) && sees(i, j, row4, col4, num, b)) || (sees(i, j, row1, col1, num, c) && sees(i, j, row2, col2, num, c) && sees(i, j, row3, col3, num, c) && sees(i, j, row4, col4, num, c)) || (sees(i, j, row1, col1, num, d) && sees(i, j, row2, col2, num, d) && sees(i, j, row3, col3, num, d) && sees(i, j, row4, col4, num, d))) && notes[i][j][num - 1]) {
      										changeColor(i, j, num, color("red"));
      										changed = true;
      									}
      								}
      							}
                        }

   							if (changed) {
   								changeColor(row1, col1, a, color("yellow"));
   								changeColor(row1, col1, b, color("yellow"));
   								changeColor(row1, col1, c, color("yellow"));
                           changeColor(row1, col1, d, color("yellow"));
   								changeColor(row2, col2, a, color("yellow"));
   								changeColor(row2, col2, b, color("yellow"));
   								changeColor(row2, col2, c, color("yellow"));
                           changeColor(row2, col2, d, color("yellow"));
   								changeColor(row3, col3, a, color("yellow"));
   								changeColor(row3, col3, b, color("yellow"));
   								changeColor(row3, col3, c, color("yellow"));
                           changeColor(row3, col3, d, color("yellow"));
                           changeColor(row4, col4, a, color("yellow"));
   								changeColor(row4, col4, b, color("yellow"));
   								changeColor(row4, col4, c, color("yellow"));
                           changeColor(row4, col4, d, color("yellow"));
                           console.log("Naked quad in " + getUnitString(unit) + ". " + a +  ", " + b + ", " + c + ", and " + d + " can be removed at all cells seen by r" + (row1 + 1) + "c" + (col1 + 1) + ", r" + (row2 + 1) + "c" + (col2 + 1) + ", r" + (row3 + 1) + "c" + (col3 + 1) + ", and r" + (row4 + 1) + "c" + (col4 + 1) + ".");
   								return;
   							}
   						}
   					}
   				}
            }
			}
		}
	}

	// Hidden quads
	for (let a = 1; a <= 6; a++) {
		for (let b = a + 1; b <= 7; b++) {
			for (let c = b + 1; c <= 8; c++) {
            for (let d = c + 1; d <= 9; d++) {
   				for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
   					let aLocs = numberLocs(unit, a);
   					let bLocs = numberLocs(unit, b);
   					let cLocs = numberLocs(unit, c);
                  let dLocs = numberLocs(unit, d);

                  if (aLocs == -1 || bLocs == -1 || cLocs == -1 || dLocs == -1) {
                     continue;
                  }

   					if (aLocs.length <= 4 && bLocs.length <= 4 && cLocs.length <= 4 && dLocs.length <= 4 && !(aLocs.length == 0 || bLocs.length == 0 || cLocs.length == 0 || dLocs.length == 0)) {
   						let locs = [];

   						for (let i = 0; i < aLocs.length; i++) {
   							let row = aLocs[i][0];
   							let col = aLocs[i][1];

   							locs.push([row, col]);
   						}

   						for (let i = 0; i < bLocs.length; i++) {
   							let row = bLocs[i][0];
   							let col = bLocs[i][1];

   							let exists = false;
   							for (let j = 0; j < locs.length; j++) {
   								if (locs[j][0] == row && locs[j][1] == col) {
   									exists = true;
   									break;
   								}
   							}

   							if (!exists) {
   								locs.push([row, col]);
   							}
   						}

   						for (let i = 0; i < cLocs.length; i++) {
   							let row = cLocs[i][0];
   							let col = cLocs[i][1];

   							let exists = false;
   							for (let j = 0; j < locs.length; j++) {
   								if (locs[j][0] == row && locs[j][1] == col) {
   									exists = true;
   									break;
   								}
   							}

   							if (!exists) {
   								locs.push([row, col]);
   							}
   						}

                     for (let i = 0; i < dLocs.length; i++) {
   							let row = dLocs[i][0];
   							let col = dLocs[i][1];

   							let exists = false;
   							for (let j = 0; j < locs.length; j++) {
   								if (locs[j][0] == row && locs[j][1] == col) {
   									exists = true;
   									break;
   								}
   							}

   							if (!exists) {
   								locs.push([row, col]);
   							}
   						}

   						if (locs.length == 4) {
   							let row1 = locs[0][0];
   							let col1 = locs[0][1];
   							let row2 = locs[1][0];
   							let col2 = locs[1][1];
   							let row3 = locs[2][0];
   							let col3 = locs[2][1];
                        let row4 = locs[3][0];
   							let col4 = locs[3][1];

   							for (let num = 1; num <= 9; num++) {
   								if (num !== a && num !== b && num !== c && num !== d) {
   									if (notes[row1][col1][num - 1]) {
   										changeColor(row1, col1, num, color("red"));
   										changed = true;
   									}

   									if (notes[row2][col2][num - 1]) {
   										changeColor(row2, col2, num, color("red"));
   										changed = true;
   									}

   									if (notes[row3][col3][num - 1]) {
   										changeColor(row3, col3, num, color("red"));
   										changed = true;
   									}

                              if (notes[row4][col4][num - 1]) {
   										changeColor(row4, col4, num, color("red"));
   										changed = true;
   									}
   								}
   							}

   							if (changed) {
   								changeColor(row1, col1, a, color("yellow"));
   								changeColor(row1, col1, b, color("yellow"));
   								changeColor(row1, col1, c, color("yellow"));
                           changeColor(row1, col1, d, color("yellow"));
   								changeColor(row2, col2, a, color("yellow"));
   								changeColor(row2, col2, b, color("yellow"));
   								changeColor(row2, col2, c, color("yellow"));
                           changeColor(row2, col2, d, color("yellow"));
   								changeColor(row3, col3, a, color("yellow"));
   								changeColor(row3, col3, b, color("yellow"));
   								changeColor(row3, col3, c, color("yellow"));
                           changeColor(row3, col3, d, color("yellow"));
                           changeColor(row4, col4, a, color("yellow"));
   								changeColor(row4, col4, b, color("yellow"));
   								changeColor(row4, col4, c, color("yellow"));
                           changeColor(row4, col4, d, color("yellow"));
                           console.log("Hidden quad in " + getUnitString(unit) + ". All candidates except " + a + ", " + b + ", " + c + ", and " + d + " can be removed at r" + (row1 + 1) + "c" + (col1 + 1) + ", r" + (row2 + 1) + "c" + (col2 + 1) + ", r" + (row3 + 1) + "c" + (col3 + 1) + ", and r" + (row4 + 1) + "c" + (col4 + 1) + ".");
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

function eliminate() {
   // Eliminate candidates at cells that see every possible cell for a number in a unit
   for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
      for (let num = 1; num <= 9; num++) {
         let locs = numberLocs(unit, num);

         if (locs == -1) {
            continue;
         }

         if (locs.length !== 0) {
            let locsString = "";
            for (let num1 = 1; num1 <= 9; num1++) {
               for (let i = 0; i < 9; i++) {
                  for (let j = 0; j < 9; j++) {
                     let seesAll = true;

                     for (let k = 0; k < locs.length; k++) {
                        let row = locs[k][0];
                        let col = locs[k][1];

                        if (!sees(i, j, row, col, num1, num)) {
                           seesAll = false;
                           break;
                        }
                     }

                     if (seesAll) {
                        if (notes[i][j][num1 - 1]) {
                           changeColor(i, j, num1, color("red"));
                           changed = true;

                           if (locsString.localeCompare("") !== 0) {
                              locsString = locsString + ","
                           }
                           locsString = locsString + " " + num1 + " at r" + (i + 1) + "c" + (j + 1);
                        }
                     }
                  }
               }
            }

            if (changed) {
               for (let i = 0; i < locs.length; i++) {
                  changeColor(locs[i][0], locs[i][1], num, color("yellow"));
               }
               console.log("Placing a" + locsString + " eliminates all possible cells for a " + num + " in " + getUnitString(unit));
               return;
            }
         }
      }
   }
}

function xWing() {
   let inRow = true;
   do {
      for (let num = 1; num <= 9; num++) {
         for (let a = 0; a < 8; a++) {
            for (let b = a + 1; b < 9; b++) {
               unitA = a + ((inRow) ? 0 : 9);
               unitB = b + ((inRow) ? 0 : 9);

               let aLocs = numberLocs(unitA, num);
               let bLocs = numberLocs(unitB, num);

               if (aLocs == -1 || bLocs == -1) {
                  continue;
               }

               if (aLocs.length !== 0 && bLocs.length !== 0) {
                  let locs = [];
                  for (let i = 0; i < aLocs.length; i++) {
                     let exists = false;
                     for (let j = 0; j < locs.length; j++) {
                        if (locs[j] == aLocs[i][(inRow) ? 1 : 0]) {
                           exists = true;
                           break;
                        }
                     }

                     if (!exists) {
                        locs.push(aLocs[i][(inRow) ? 1 : 0]);
                     }
                  }

                  for (let i = 0; i < bLocs.length; i++) {
                     let exists = false;
                     for (let j = 0; j < locs.length; j++) {
                        if (locs[j] == bLocs[i][(inRow) ? 1 : 0]) {
                           exists = true;
                           break;
                        }
                     }

                     if (!exists) {
                        locs.push(bLocs[i][(inRow) ? 1 : 0]);
                     }
                  }

                  if (locs.length == 2) {
                     let removedString = "";
                     for (let num1 = 1; num1 <= 9; num1++) {
                        let removed = "";
                        for (let i = 0; i < 9; i++) {
                           for (let j = 0; j < 9; j++) {
                              if (notes[i][j][num1 - 1]) {
                                 for (let unit = 0; unit < 9; unit++) {
                                    if (unit == locs[0] || unit == locs[1]) {
                                       let seesAll = true;

                                       for (let cell = 0; cell < 2; cell++) {
                                          let option;
                                          switch (cell) {
                                             case 0:
                                                option = a;
                                                break;
                                             case 1:
                                                option = b;
                                                break;
                                          }

                                          let row = (inRow) ? option : unit;
                                          let col = (inRow) ? unit : option;

                                          if (notes[row][col][num - 1] && !sees(i, j, row, col, num1, num)) {
                                             seesAll = false;
                                             break;
                                          }
                                       }

                                       if (seesAll) {
                                          changeColor(i, j, num1, color("red"));
                                          changed = true;

                                          if (removed.localeCompare("") == 0) {
                                             removed = removed + num1 + " can be removed in";
                                          } else {
                                             removed = removed + ",";
                                          }

                                          removed = removed + " r" + (i + 1) + "c" + (j + 1);
                                       }
                                    }
                                 }
                              }
                           }
                        }

                        if (removed.localeCompare("") !== 0) {
                           removedString = removedString + ", " + removed;
                        }
                     }

                     if (changed) {
                        for (let unit = 0; unit < 9; unit++) {
                           if (unit == a || unit == b) {
                              for (let cell = 0; cell < 2; cell++) {
                                 let row = (inRow) ? unit : locs[cell];
                                 let col = (inRow) ? locs[cell] : unit;

                                 if (notes[row][col][num - 1]) {
                                    changeColor(row, col, num, color("yellow"));
                                 }
                              }
                           }
                        }

                        console.log("X-Wing on " + num + " found in " + getUnitString(unitA) + " and " + getUnitString(unitB) + ". Therefore" + removedString + ".");
                        return;
                     }
                  }
               }
            }
         }
      }
      inRow = !inRow;
   } while (!inRow);
}

function yWing() {
   for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         if (numPossible[i][j] == 2) {
            let posPivot = [];
            for (let num = 1; num <= 9; num++) {
               if (notes[i][j][num - 1]) {
                  posPivot.push(num);
               }
            }

            for (let a = 0; a < 9; a++) {
               for (let b = 0; b < 9; b++) {
                  if (numPossible[a][b] == 2) {
                     let posCor1 = [];
                     for (let num = 1; num <= 9; num++) {
                        if (notes[a][b][num - 1]) {
                           posCor1.push(num);
                        }
                     }

                     if (sees(a, b, i, j, posCor1[0], posPivot[0]) || sees(a, b, i, j, posCor1[0], posPivot[1]) || sees(a, b, i, j, posCor1[1], posPivot[0]) || sees(a, b, i, j, posCor1[1], posPivot[1])) {
                        for (let x = 0; x < 9; x++) {
                           for (let y = 0; y < 9; y++) {
                              if (numPossible[x][y] == 2) {
                                 let posCor2 = [];
                                 for (let num = 1; num <= 9; num++) {
                                    if (notes[x][y][num - 1]) {
                                       posCor2.push(num);
                                    }
                                 }

                                 if (sees(x, y, i, j, posCor2[0], posPivot[0]) || sees(x, y, i, j, posCor2[0], posPivot[1]) || sees(x, y, i, j, posCor2[1], posPivot[0]) || sees(x, y, i, j, posCor2[1], posPivot[1])) {
                                    for (let option = 0; option < 8; option++) {
                                       let pivotNum1 = posPivot[option % 2];
                                       let pivotNum2 = posPivot[(option + 1) % 2];
                                       let cor1 = posCor1[floor(option / 2) % 2];
                                       let cor2 = posCor2[floor(option / 4)];

                                       if (!sees(a, b, i, j, cor1, pivotNum1)) {
                                          continue;
                                       }

                                       if (!sees(x, y, i, j, cor2, pivotNum2)) {
                                          continue;
                                       }

                                       let other1 = posCor1[((floor(option / 2) % 2) + 1) % 2];
                                       let other2 = posCor2[((floor(option / 4)) + 1) % 2];

                                       let removed = "";
                                       for (let num = 1; num <= 9; num++) {
                                          for (let m = 0; m < 9; m++) {
                                             for (let n = 0; n < 9; n++) {
                                                if (notes[m][n][num - 1] && sees(m, n, a, b, num, other1) && sees(m, n, x, y, num, other2)) {
                                                   changeColor(m, n, num, color("red"));
                                                   removed = removed + ", " + num + " can be removed at r" + (m + 1) + "c" + (n + 1);
                                                   changed = true;
                                                }
                                             }
                                          }
                                       }
                                       removed = removed + ".";

                                       if (changed) {
                                          for (let num = 1; num <= 9; num++) {
                                             changeColor(i, j, num, color("yellow"));
                                             changeColor(a, b, num, color("yellow"));
                                             changeColor(x, y, num, color("yellow"));
                                          }

                                          console.log("Y-wing found with hinge at r" + (i + 1) + "c" + (j + 1) + " and wings at r" + (a + 1) + "c" + (b + 1) + " and r" + (x + 1) + "c" + (y + 1) + ". Therefore" + removed);
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

function swordfish() {
   let inRow = true;
   do {
      for (let num = 1; num <= 9; num++) {
         for (let a = 0; a < 7; a++) {
            for (let b = a + 1; b < 8; b++) {
               for (let c = b + 1; c < 9; c++) {
                  unitA = a + ((inRow) ? 0 : 9);
                  unitB = b + ((inRow) ? 0 : 9);
                  unitC = c + ((inRow) ? 0 : 9);

                  let aLocs = numberLocs(unitA, num);
                  let bLocs = numberLocs(unitB, num);
                  let cLocs = numberLocs(unitC, num);

                  if (aLocs == -1 || bLocs == -1 || cLocs == -1) {
                     continue;
                  }

                  if (aLocs.length !== 0 && bLocs.length !== 0 && cLocs.length !== 0) {
                     let locs = [];
                     for (let i = 0; i < aLocs.length; i++) {
                        let exists = false;
                        for (let j = 0; j < locs.length; j++) {
                           if (locs[j] == aLocs[i][(inRow) ? 1 : 0]) {
                              exists = true;
                              break;
                           }
                        }

                        if (!exists) {
                           locs.push(aLocs[i][(inRow) ? 1 : 0]);
                        }
                     }

                     for (let i = 0; i < bLocs.length; i++) {
                        let exists = false;
                        for (let j = 0; j < locs.length; j++) {
                           if (locs[j] == bLocs[i][(inRow) ? 1 : 0]) {
                              exists = true;
                              break;
                           }
                        }

                        if (!exists) {
                           locs.push(bLocs[i][(inRow) ? 1 : 0]);
                        }
                     }

                     for (let i = 0; i < cLocs.length; i++) {
                        let exists = false;
                        for (let j = 0; j < locs.length; j++) {
                           if (locs[j] == cLocs[i][(inRow) ? 1 : 0]) {
                              exists = true;
                              break;
                           }
                        }

                        if (!exists) {
                           locs.push(cLocs[i][(inRow) ? 1 : 0]);
                        }
                     }

                     if (locs.length == 3) {
                        let removedString = "";
                        for (let num1 = 1; num1 <= 9; num1++) {
                           let removed = "";
                           for (let i = 0; i < 9; i++) {
                              for (let j = 0; j < 9; j++) {
                                 if (notes[i][j][num1 - 1]) {
                                    for (let unit = 0; unit < 9; unit++) {
                                       if (unit == locs[0] || unit == locs[1] || unit == locs[2]) {
                                          let seesAll = true;

                                          for (let cell = 0; cell < 3; cell++) {
                                             let option;
                                             switch (cell) {
                                                case 0:
                                                   option = a;
                                                   break;
                                                case 1:
                                                   option = b;
                                                   break;
                                                case 2:
                                                   option = c;
                                                   break;
                                             }

                                             let row = (inRow) ? option : unit;
                                             let col = (inRow) ? unit : option;

                                             if (notes[row][col][num - 1] && !sees(i, j, row, col, num1, num)) {
                                                seesAll = false;
                                                break;
                                             }
                                          }

                                          if (seesAll) {
                                             changeColor(i, j, num1, color("red"));
                                             changed = true;

                                             if (removed.localeCompare("") == 0) {
                                                removed = removed + num1 + " can be removed in";
                                             } else {
                                                removed = removed + ",";
                                             }

                                             removed = removed + " r" + (i + 1) + "c" + (j + 1);
                                          }
                                       }
                                    }
                                 }
                              }
                           }

                           if (removed.localeCompare("") !== 0) {
                              removedString = removedString + ", " + removed;
                           }
                        }

                        if (changed) {
                           for (let unit = 0; unit < 9; unit++) {
                              if (unit == a || unit == b || unit == c) {
                                 for (let cell = 0; cell < 3; cell++) {
                                    let row = (inRow) ? unit : locs[cell];
                                    let col = (inRow) ? locs[cell] : unit;

                                    if (notes[row][col][num - 1]) {
                                       changeColor(row, col, num, color("yellow"));
                                    }
                                 }
                              }
                           }

                           console.log("Swordfish on " + num + " found in " + getUnitString(unitA) + ", " + getUnitString(unitB) + ", and " + getUnitString(unitC) + ". Therefore" + removedString + ".");
                           return;
                        }
                     }
                  }
               }
            }
         }
      }
      inRow = !inRow;
   } while (!inRow);
}

function xyzWing() {
   for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
         if (a == b) {
            continue;
         }

         for (let c = 1; c <= 9; c++) {
            if (a == c || b == c) {
               continue;
            }

            for (let row = 0; row < 9; row++) {
               for (let col = 0; col < 9; col++) {
                  if (numPossible[row][col] == 3 && notes[row][col][a - 1] && notes[row][col][b - 1] && notes[row][col][c - 1]) {
                     for (let row1 = 0; row1 < 9; row1++) {
                        for (let col1 = 0; col1 < 9; col1++) {
                           if (numPossible[row1][col1] !== 2) {
                              continue;
                           }

                           let bothSee = true;
                           let options = [];
                           for (let num = 1; num <= 9; num++) {
                              if (notes[row1][col1][num - 1]) {
                                 options.push(num);
                              }
                           }

                           for (let i = 0; i < options.length; i++) {
                              if (!sees(row1, col1, row, col, options[i], a) && !sees(row1, col1, row, col, options[i], b) && !sees(row1, col1, row, col, options[i], c))
                              bothSee = false;
                           }

                           if (bothSee && (sees(row1, col1, row, col, options[0], a) || sees(row1, col1, row, col, options[1], a))) {
                              for (let row2 = 0; row2 < 9; row2++) {
                                 for (let col2 = 0; col2 < 9; col2++) {
                                    if (numPossible[row2][col2] !== 2 || (row2 == row1 && col2 == col1)) {
                                       continue;
                                    }

                                    let bothSee1 = true;
                                    let options1 = [];
                                    for (let num = 1; num <= 9; num++) {
                                       if (notes[row2][col2][num - 1]) {
                                          options1.push(num);
                                       }
                                    }

                                    for (let i = 0; i < options1.length; i++) {
                                       if (!sees(row2, col2, row, col, options1[i], a) && !sees(row2, col2, row, col, options1[i], b) && !sees(row2, col2, row, col, options1[i], c))
                                       bothSee1 = false;
                                    }

                                    if (bothSee1 && (sees(row2, col2, row, col, options1[0], a) || sees(row2, col2, row, col, options1[1], a))) {
                                       let bSeen = false, cSeen = false;

                                       for (let i = 0; i < options.length; i++) {
                                          if (sees(row1, col1, row, col, options[i], b) || sees(row2, col2, row, col, options1[i], b)) {
                                             bSeen = true;
                                          }

                                          if (sees(row1, col1, row, col, options[i], c) || sees(row2, col2, row, col, options1[i], c)) {
                                             cSeen = true;
                                          }
                                       }

                                       if (bSeen && cSeen) {
                                          let seesA = new Array(2);
                                          for (let i = 0; i < seesA.length; i++) {
                                             seesA[i] = 0;
                                          }

                                          for (let i = 0; i < options.length; i++) {
                                             if (seesA[0] == 0 && sees(row1, col1, row, col, options[i], a)) {
                                                seesA[0] = options[i];
                                             }

                                             if (seesA[1] == 0 && sees(row2, col2, row, col, options1[i], a)) {
                                                seesA[1] = options1[i];
                                             }
                                          }

                                          let removedString = "";
                                          for (let num = 1; num <= 9; num++) {
                                             let removed = "";
                                             for (let i = 0; i < 9; i++) {
                                                for (let j = 0; j < 9; j++) {
                                                   if (notes[i][j][num - 1] && sees(i, j, row, col, num, a) && sees(i, j, row1, col1, num, seesA[0]) && sees(i, j, row2, col2, num, seesA[1])) {
                                                      changeColor(i, j, num, color("red"));
                                                      changed = true;

                                                      if (removed.localeCompare("") == 0) {
                                                         removed = removed + num + " can be removed in";
                                                      } else {
                                                         removed = removed + ",";
                                                      }

                                                      removed = removed + " r" + (i + 1) + "c" + (j + 1);
                                                   }
                                                }
                                             }

                                             if (removed.localeCompare("") !== 0) {
                                                removedString = removedString + ", " + removed;
                                             }
                                          }

                                          if (changed) {
                                             for (let num = 1; num <= 9; num++) {
                                                changeColor(row, col, num, color("yellow"));
                                                changeColor(row1, col1, num, color("yellow"));
                                                changeColor(row2, col2, num, color("yellow"));
                                             }

                                             console.log("XYZ Wing with hinge at r" + (row + 1) + "c" + (col + 1) + ". Therefore" + removedString + ".");
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
}

function jellyfish() {
   let inRow = true;
   do {
      for (let num = 1; num <= 9; num++) {
         for (let a = 0; a < 6; a++) {
            for (let b = a + 1; b < 7; b++) {
               for (let c = b + 1; c < 8; c++) {
                  for (let d = c + 1; d < 9; d++) {
                     unitA = a + ((inRow) ? 0 : 9);
                     unitB = b + ((inRow) ? 0 : 9);
                     unitC = c + ((inRow) ? 0 : 9);
                     unitD = d + ((inRow) ? 0 : 9);

                     let aLocs = numberLocs(unitA, num);
                     let bLocs = numberLocs(unitB, num);
                     let cLocs = numberLocs(unitC, num);
                     let dLocs = numberLocs(unitD, num);

                     if (aLocs == -1 || bLocs == -1 || cLocs == -1 || dLocs == -1) {
                        continue;
                     }

                     if (aLocs.length !== 0 && bLocs.length !== 0 && cLocs.length !== 0 && dLocs.length !== 0) {
                        let locs = [];
                        for (let i = 0; i < aLocs.length; i++) {
                           let exists = false;
                           for (let j = 0; j < locs.length; j++) {
                              if (locs[j] == aLocs[i][(inRow) ? 1 : 0]) {
                                 exists = true;
                                 break;
                              }
                           }

                           if (!exists) {
                              locs.push(aLocs[i][(inRow) ? 1 : 0]);
                           }
                        }

                        for (let i = 0; i < bLocs.length; i++) {
                           let exists = false;
                           for (let j = 0; j < locs.length; j++) {
                              if (locs[j] == bLocs[i][(inRow) ? 1 : 0]) {
                                 exists = true;
                                 break;
                              }
                           }

                           if (!exists) {
                              locs.push(bLocs[i][(inRow) ? 1 : 0]);
                           }
                        }

                        for (let i = 0; i < cLocs.length; i++) {
                           let exists = false;
                           for (let j = 0; j < locs.length; j++) {
                              if (locs[j] == cLocs[i][(inRow) ? 1 : 0]) {
                                 exists = true;
                                 break;
                              }
                           }

                           if (!exists) {
                              locs.push(cLocs[i][(inRow) ? 1 : 0]);
                           }
                        }

                        for (let i = 0; i < dLocs.length; i++) {
                           let exists = false;
                           for (let j = 0; j < locs.length; j++) {
                              if (locs[j] == dLocs[i][(inRow) ? 1 : 0]) {
                                 exists = true;
                                 break;
                              }
                           }

                           if (!exists) {
                              locs.push(dLocs[i][(inRow) ? 1 : 0]);
                           }
                        }

                        if (locs.length == 4) {
                           let removedString = "";
                           for (let num1 = 1; num1 <= 9; num1++) {
                              let removed = "";
                              for (let i = 0; i < 9; i++) {
                                 for (let j = 0; j < 9; j++) {
                                    if (notes[i][j][num1 - 1]) {
                                       for (let unit = 0; unit < 9; unit++) {
                                          if (unit == locs[0] || unit == locs[1] || unit == locs[2] || unit == locs[3]) {
                                             let seesAll = true;

                                             for (let cell = 0; cell < 4; cell++) {
                                                let option;
                                                switch (cell) {
                                                   case 0:
                                                      option = a;
                                                      break;
                                                   case 1:
                                                      option = b;
                                                      break;
                                                   case 2:
                                                      option = c;
                                                      break;
                                                   case 3:
                                                      option = d;
                                                      break;
                                                }

                                                let row = (inRow) ? option : unit;
                                                let col = (inRow) ? unit : option;

                                                if (notes[row][col][num - 1] && !sees(i, j, row, col, num1, num)) {
                                                   seesAll = false;
                                                   break;
                                                }
                                             }

                                             if (seesAll) {
                                                changeColor(i, j, num1, color("red"));
                                                changed = true;

                                                if (removed.localeCompare("") == 0) {
                                                   removed = removed + num1 + " can be removed in";
                                                } else {
                                                   removed = removed + ",";
                                                }

                                                removed = removed + " r" + (i + 1) + "c" + (j + 1);
                                             }
                                          }
                                       }
                                    }
                                 }
                              }

                              if (removed.localeCompare("") !== 0) {
                                 removedString = removedString + ", " + removed;
                              }
                           }

                           if (changed) {
                              for (let unit = 0; unit < 9; unit++) {
                                 if (unit == a || unit == b || unit == c || unit == d) {
                                    for (let cell = 0; cell < 4; cell++) {
                                       let row = (inRow) ? unit : locs[cell];
                                       let col = (inRow) ? locs[cell] : unit;

                                       if (notes[row][col][num - 1]) {
                                          changeColor(row, col, num, color("yellow"));
                                       }
                                    }
                                 }
                              }

                              console.log("Jellyfish on " + num + " found in " + getUnitString(unitA) + ", " + getUnitString(unitB) + ", " + getUnitString(unitC) + ", and " + getUnitString(unitD) + ". Therefore" + removedString + ".");
                              return;
                           }
                        }
                     }
                  }
               }
            }
         }
      }
      inRow = !inRow;
   } while (!inRow);
}

function simpleChains() {
   for (let num = 1; num <= 9; num++) {
      for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
         let locs = numberLocs(unit, num);

         if (locs == -1) {
            continue;
         }

         if (locs.length == 2) {
            for (let i = 0; i < locs.length; i++) {
               colorChains(locs[i], unit, num, (i == 0));
            }

            let removedString = "";
            let removeLocs = [];
            for (let num1 = 1; num1 <= 9; num1++) {
               let removed = "";
               for (let i = 0; i < 9; i++) {
                  for (let j = 0; j < 9; j++) {
                     if (notes[i][j][num1 - 1]) {
                        let seesOrange = false;
                        let seesBlue = false;
                        for (let a = 0; a < 9; a++) {
                           for (let b = 0; b < 9; b++) {
                              if (a == i && b == j) {
                                 continue;
                              }

                              if (sees(i, j, a, b, num1, num) && !compareColor(noteColor[a][b][num - 1], color("white"))) {
                                 if (compareColor(noteColor[a][b][num - 1], color("deepskyblue"))) {
                                    seesBlue = true;
                                 } else if (compareColor(noteColor[a][b][num - 1], color("darkorange"))) {
                                    seesOrange = true;
                                 }
                              }
                           }
                        }

                        if (seesBlue && seesOrange) {
                           removeLocs.push([i, j, num1]);
                           changed = true;

                           if (removed.localeCompare("") == 0) {
                              removed = removed + num1 + " at ";
                           } else {
                              removed = removed + ", ";
                           }

                           removed = removed + "r" + (i + 1) + "c" + (j + 1);
                        }
                     }
                  }
               }

               if (removedString.localeCompare("") !== 0 && removed.localeCompare("") !== 0) {
                  removedString = removedString + ", ";
               }

               removedString = removedString + removed;
            }

            if (changed) {
               for (let i = 0; i < removeLocs.length; i++) {
                  changeColor(removeLocs[i][0], removeLocs[i][1], removeLocs[i][2], color("red"));
               }
               console.log("Placing " + removedString + " eliminates both simple chains (Orange and Blue) for " + num + ".");
               return;
            }

            for (let i = 0; i < 9; i++) {
               for (let j = 0; j < 9; j++) {
                  changeColor(i, j, num, color("white"));
               }
            }
         }
      }
   }
}

async function guess() {
   if (!uniqueCheck) {
      return;
   }

   guessing = true;
   let minTries = Infinity;
   let elimination = [];
   for (let possible = 1; possible <= 9; possible++) {
      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            if (digits[i][j] !== 0 || numPossible[i][j] > possible) {
               continue;
            }

            for (let num = 1; num <= 9; num++) {
               if (!notes[i][j][num - 1] || solution[i][j] == num) {
                  continue;
               }

               let pdigits = [];
         		let pnotes = [];
               let pdigitColor = [];
               let pnoteColor = [];
               let pnumPossible = [];
               let pSolveCount = solveCount;

               for (let i = 0; i < 9; i++) {
                  pdigits[i] = digits[i].slice();
                  pdigitColor[i] = digitColor[i].slice();
                  pnumPossible[i] = numPossible[i].slice();

                  pnotes[i] = [];
                  pnoteColor[i] =[];
                  for (let j = 0; j < 9; j++) {
                     pnotes[i][j] = notes[i][j].slice();
                     pnoteColor[i][j] = noteColor[i][j].slice();
                  }
               }

               recursCount = 0;
               solveCount = 0;

               placeDigit(i, j, num);
               await solveRecurs(false);
               removeDigit(i, j);

               for (let i = 0; i < 9; i++) {
                  digits[i] = pdigits[i].slice();
                  digitColor[i] = pdigitColor[i].slice();
                  numPossible[i] = pnumPossible[i].slice();

                  for (let j = 0; j < 9; j++) {
                     notes[i][j] = pnotes[i][j].slice();
                     noteColor[i][j] = pnoteColor[i][j].slice();
                  }
               }
               solveCount = pSolveCount;

               // console.log(i, j, num, recursCount);

               if (recursCount < minTries) {
                  minTries = recursCount;
                  elimination = [i, j, num];
                  // console.log("Min found", elimination, minTries);
               }

               if (minTries < threshold) {
                  break;
               }
            }

            if (minTries < threshold) {
               break;
            }
         }

         if (minTries < threshold) {
            break;
         }
      }

      if (minTries < threshold) {
         break;
      }
   }

   if (elimination.length !== 0) {
      let row = elimination[0];
      let col = elimination[1];
      let num = elimination[2];

      changeColor(row, col, num, color("red"));
      console.log("Placing " + num + " at r" + (row + 1) + "c" + (col + 1) + " breaks the puzzle the fastest, therefore, it can be eliminated as a candidate.");
      changed = true;
   }

   guessing = false;
}

function colorChains(loc, pUnit, num, c) {
   let row = loc[0];
   let col = loc[1];

   if (compareColor(noteColor[row][col][num - 1], color("white"))) {
      changeColor(row, col, num, (c) ? color("deepskyblue") : color("darkorange"));

      for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
         if (unit == pUnit) {
            continue;
         }

         let locs = numberLocs(unit, num);

         if (locs == -1) {
            continue;
         }

         if (locs.length !== 2) {
            continue;
         }

         let contained = false;
         for (let i = 0; i < locs.length; i++) {
            let row1 = locs[i][0];
            let col1 = locs[i][1];

            if (row1 == row && col1 == col) {
               contained = true;
               break;
            }
         }

         if (contained) {
            for (let i = 0; i < locs.length; i++) {
               let row1 = locs[i][0];
               let col1 = locs[i][1];

               if (row1 == row && col1 == col) {
                  continue;
               }

               colorChains(locs[i], unit, num, !c);
            }
         }
      }
   }
}

function gridFromBox(box, index) {
	// Returns row and col location for a specific index within a box/irregular region. Box from 0-8, index from 0-8
	let count = 0;

	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (boxNum[i][j] == box) {
				if (count == index) {
					return [i, j];
				}
				count++;
			}
		}
	}
}

function numberLocs(unit, num) {
	// Finds all possible locations for a number within a unit.
	let locs = [];
	for (let i = 0; i < 9; i++) {
		let row, col;

		switch (floor(unit / 9)) {
			case 0:
				row = unit % 9;
				col = i;
				break;
			case 1:
				row = i;
				col = unit % 9;
				break;
			case 2:
				let arr = gridFromBox(unit % 9, i);
				row = arr[0];
				col = arr[1];
				break;
			default:
				unit -= 27;
				if (diagonals && unit < 2) {
					row = i;
					col = (unit == 0) ? i : 8 - i;
				} else if (magicSquares) {
					let squareNum = unit - (diagonals ? 2 : 0);
					let cRow = magicSquares[squareNum][0];
					let cCol = magicSquares[squareNum][1];

					row = cRow + floor(i / 3) - 1;
					col = cCol + (i % 3) - 1;
				}

				break;
		}

		// console.log(unit, num, row, col);

		if (notes[row][col][num - 1]) {
			locs.push([row, col]);
		}

		if (digits[row][col] == num) {
			return -1;
		}
	}

	return locs;
}

function getUnitString(unit) {
	// Returns a string with the type of unit and what number of the unit the argument specifies. Used for identifying what logical deductions solver makes
   switch (floor(unit / 9)) {
      case 0:
         let row = unit % 9 + 1;
         return ("row " + row);
         break;
      case 1:
         let col = unit % 9 + 1;
         return ("col " + col);
         break;
      case 2:
         let box = unit % 9 + 1;
         return ("box " + box);
         break;
      default:
         unit -= 27;
         if (diagonals && unit < 2) {
            return ("diagonal " + (unit + 1));
         } else if (magicSquares) {
            let squareNum = unit - (diagonals ? 2 : 0);

            return ("magic square " + (squareNum + 1));
         }

         break;
   }
}

function findCombos(sum, noRepeat = false, notUsed = []) {
	// Finds all number combos that sum to a given total. If noRepeat is true, numbers are not allowed to repeat in a combo. If sandwichTotal is true, 1 and 9 are invalid numbers for a combo
   let arr = new Array(9);
   let combos = [];

   sumNums(arr, 0, sum, sum, combos, noRepeat, notUsed);

   return combos;
}

function sumNums(arr, index, num, reduced, combos, noRepeat, notUsed) {
	// Recursive function to generate combos that sum to a total.
   if (reduced < 0) {
      return;
   }

   if (reduced == 0) {
		// Copy current state of arr to a new element in combos if the current sum of the numbers in arr equals the sum
      let tempArr = [];
      for (let i = 0; i < index; i++) {
         tempArr[i] = arr[i];
      }

      if (tempArr.length <= 9) {
         combos.push(tempArr);
      }

      return;
   }

	// Calculate min and max val for the next number used in the sum
   let prev;
   if (index == 0) {
      prev = 1;
   } else {
      prev = arr[index - 1] + ((noRepeat) ? 1 : 0);
   }

	// Loop from min val to max val and recursively call this function
   for (let i = prev; i <= 9; i++) {
      let possible = true;
      for (let j = 0; j < notUsed.length; j++) {
         if (i == notUsed[j]) {
            possible = false;
            break;
         }
      }

      if (!possible) {
         continue;
      }

      arr[index] = i;

      sumNums(arr, index + 1, num, reduced - i, combos, noRepeat, notUsed);
   }
}

function onDiagonal(row, col, diagNum) {
	// Determines if a cell is on a major diagonal
   return (diagNum == 1) ? (row == col) : (8 - row == col);
}

function sees(r1, c1, r2, c2, num1 = 0, num2 = 0) {
	// Determines if num1 in r(r1)c(c1) eliminates num2 in r(r2)c(c2)
   if (num1 == num2) {
      if (r1 == r2 && c1 == c2) {
         return false;
      }

      if (r1 == r2 || c1 == c2) {
         return true;
      }

      if (boxNum[r1][c1] == boxNum[r2][c2]) {
         return true;
      }

      if (thermo) {
         let thermoInfo1 = onThermo(r1, c1);
         let thermoInfo2 = onThermo(r2, c2);
         for (let i = 0; i < thermoInfo1.length; i++) {
            let thermo1 = thermoInfo1[i][0];
            for (let j = 0; j < thermoInfo2.length; j++) {
               let thermo2 = thermoInfo2[j][0];
               if (thermo1 == thermo2) {
                  return true;
               }
            }
         }
      }

      if (kingsMove) {
         if (orthoDist(r1, c1, r2, c2) == 2) {
            return true;
         }
      }

      if (knightsMove) {
         if (orthoDist(r1, c1, r2, c2) == 3) {
            return true;
         }
      }

      if (queensMove && num1 !== 0) {
         if (queensDigits[num1 - 1] && (abs(r1 - r2) == abs(c1 - c2))) {
            return true;
         }
      }

      if (diagonals) {
         if ((onDiagonal(r1, c1, 1) && onDiagonal(r2, c2, 1)) || (onDiagonal(r1, c1, 2) && onDiagonal(r2, c2, 2))) {
            return true;
         }
      }

      if (magicSquare) {
         for (let i = 0; i < magicSquares.length; i++) {
            let cRow = magicSquares[i][0];
            let cCol = magicSquares[i][1];

            if ((orthoDist(r1, c1, cRow, cCol) < 2 || (orthoDist(r1, c1, cRow, cCol) == 2 && r1 !== cRow && c1 !== cCol)) && (orthoDist(r2, c2, cRow, cCol) < 2 || (orthoDist(r2, c2, cRow, cCol) == 2 && r2 !== cRow && c2 !== cCol))) {
               return true;
            }
         }
      }
   } else {
      if (r1 == r2 && c1 == c2) {
         return true;
      }

      if (nonConsecutive) {
         if (num1 !== 0 && num2 !== 0 && abs(num1 - num2) == 1 && orthoDist(r1, c1, r2, c2) == 1) {
            return true;
         }
      }
   }

   return false;
}

function orthoDist(r1, c1, r2, c2) {
	// Calculates the minimum orthogonal distance between two cells
   return (abs(r1 - r2) + abs(c1 - c2));
}

function checkValid(row, col, num) {
	// Checks if a number is valid in a cell
	if (digits[row][col] == num) {
		return true;
	} else if (digits[row][col] !== 0) {
		return false;
	}

   if (!notes[row][col][num - 1]) {
      return false;
   }

   for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         if (sees(i, j, row, col, num, digits[i][j]) && digits[i][j] !== 0) {
            return false;
         }
      }
   }

   let min = findMin(row, col);
   let max = findMax(row, col);

   if (num < min || num > max) {
      return false;
   }

   return true;
}

function compareColor(c1, c2) {
	// Compares two given colors to see if they are identical
   return (red(c1) == red(c2) && green(c1) == green(c2) && blue(c1) == blue(c2));
}

async function checkSolvable() {
	// Handles recursive function to determine if puzzle is uniquely solvable. Recursive check is only done once if it is uniquely solvable, after the first check of a unique solution, check goes off the stored solution grid
   if (recursDone) {
      for (let i = 0; i < 9; i++) {
         for (let j = 0; j < 9; j++) {
            if (!(digits[i][j] == solution[i][j] || (digits[i][j] == 0 && notes[i][j][solution[i][j] - 1]))) {
               return false;
            }
         }
      }

      return true;
   } else {
      let pdigits = [];
		let pnotes = [];
      let pdigitColor = [];
      let pnoteColor = [];
      let pnumPossible = [];

      for (let i = 0; i < 9; i++) {
         pdigits[i] = digits[i].slice();
         pdigitColor[i] = digitColor[i].slice();
         pnumPossible[i] = numPossible[i].slice();

         pnotes[i] = [];
         pnoteColor[i] =[];
         for (let j = 0; j < 9; j++) {
            pnotes[i][j] = notes[i][j].slice();
            pnoteColor[i][j] = noteColor[i][j].slice();
         }
      }

      solveCount = 0;
      solution = await solveRecurs();

      for (let i = 0; i < 9; i++) {
         digits[i] = pdigits[i].slice();
         digitColor[i] = pdigitColor[i].slice();
         numPossible[i] = pnumPossible[i].slice();

         for (let j = 0; j < 9; j++) {
            notes[i][j] = pnotes[i][j].slice();
            noteColor[i][j] = pnoteColor[i][j].slice();
         }
      }

		recursDone = (solveCount == 1);

		console.table(solution);

      return recursDone;
   }
}

async function solveRecurs(logProgress = true) {
	// Selects the most restricted cell to iterate through next
   recursCount++;
   await sleep(sleepTime);
   let tempSolution = [];
   if (solveCount > 1) {
      return [];
   }

   let minLoc = [];
   let minVal = Infinity;
   let minLocNum = 0;

	let thermosFilled = true;
	if (thermo) {
		for (let n = 0; n < thermometers.length; n++) {
			if (!thermoFilled(n)) {
				thermosFilled = false;
				break;
			}
		}
	}

   for (let i = 0; i < (thermosFilled ? 9 : thermometers.length); i++) {
      for (let j = 0; j < (thermosFilled ? 9 : thermoFilled(i) ? 0 : thermometers[i].length); j++) {
			let row, col;

			if (thermosFilled) {
				row = i;
				col = j;
			} else {
				let arr = thermoGridIndex(i, j);
				row = arr[0];
				col = arr[1];
			}

         if (digits[row][col] == 0) {
				if (numPossible[row][col] < minVal || (thermo && numPossible[row][col] == minVal && onThermo(row, col).length > onThermo(minLoc[0], minLoc[1]).length)) {
	            minLoc[0] = row;
	            minLoc[1] = col;
	            minVal = numPossible[row][col];
				}
			}
      }
   }

   for (let num = 1; num <= 9; num++) {
		for (let unit = 0; unit < 27 + (diagonals ? 2 : 0) + (magicSquare ? magicSquares.length : 0); unit++) {
			let locs = numberLocs(unit, num);

         if (locs == -1) {
            continue;
         }

			if (locs.length < minVal) {
            let min = Infinity;

            for (let i = 0; i < locs.length; i++) {
               let row = locs[i][0];
               let col = locs[i][1];

               if (numPossible[row][col] < min) {
                  minLoc[0] = row;
                  minLoc[1] = col;
                  minLocNum = num;
                  min = numPossible[row][col];
               }
            }

            minVal = locs.length;
			}
		}
	}

   if (minVal > 9) {
      if (checkSolved()) {
         solveCount++;

         if (logProgress) {
            console.table(tempSolution);
         }

			if (solveCount < 2) {
	         for (let i = 0; i < 9; i++) {
	            tempSolution[i] = digits[i].slice();
	         }
			}
      }
   } else if (minVal !== 0){
      tempSolution = await fillSpotRecurs(minLoc[0], minLoc[1], minLocNum, logProgress);
   }

   return tempSolution;
}

async function fillSpotRecurs(row, col, cellNum = 0, logProgress) {
	// Tries all candidates in a given cell. Combined with solveRecurs forms a recursive function
   let tempSolution = [];

   if (cellNum !== 0) {
      if (checkValid(row, col, cellNum)) {
         let temp = [];
         if (logProgress) {
            console.log("Placing " + cellNum + " at r" + (row + 1) + "c" + (col + 1));
         }
         placeDigit(row, col, cellNum);
         temp = await solveRecurs(logProgress);
         if (logProgress) {
            console.log("Removing " + cellNum + " at r" + (row + 1) + "c" + (col + 1));
         }
         removeDigit(row, col);
         await sleep(sleepTime);

         if (temp.length !== 0) {
            for (let i = 0; i < 9; i++) {
               tempSolution[i] = temp[i].slice();
            }
         }

         if (solveCount > 1) {
            return [];
         }
      }
   }

   for (let num = 1; num <= 9; num++) {
      if (num == cellNum) {
         continue;
      }
      // await sleep(sleepTime);
      if (checkValid(row, col, num)) {
         let temp = [];
         if (logProgress) {
            console.log("Placing " + num + " at r" + (row + 1) + "c" + (col + 1));
         }
         placeDigit(row, col, num);
         temp = await solveRecurs(logProgress);
         if (logProgress) {
            console.log("Removing " + num + " at r" + (row + 1) + "c" + (col + 1));
         }
         removeDigit(row, col);
         await sleep(sleepTime);

         if (temp.length !== 0) {
            for (let i = 0; i < 9; i++) {
               tempSolution[i] = temp[i].slice();
            }
         }

         if (solveCount > 1) {
            return [];
         }
      }
   }

   return tempSolution;
}

function checkSolved() {
	// Determines if the puzzle is solved
   for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
         if (digits[row][col] == 0) {
            return false;
         }
      }
   }

   for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
         for (let a = 0; a < 9; a++) {
            for (let b = 0; b < 9; b++) {
               if (sees(i, j, a, b, digits[i][j], digits[a][b])) {
                  return false;
               }
            }
         }
      }
   }

   if (thermo) {
      for (let i = 0; i < thermometers.length; i++) {
         if (!thermoInOrder(i)) {
            return false;
         }
      }
   }

	if (magicSquare) {
		for (let i = 0; i < magicSquares.length; i++) {
			let row = magicSquares[i][0];
			let col = magicSquares[i][1];

			for (let j = -1; j <= 1; j++) {
				let rowSum = 0;
				let colSum = 0;
				let diagSum = (j == 0) ? 15 : 0;

				for (let k = -1; k <= 1; k++) {
					rowSum += digits[row + j][col + k];
					colSum += digits[row + k][col + j];
					if (j !== 0) {
						diagSum += digits[row + (j * k)][col + k];
					}
				}

				if (rowSum !== 15 || colSum !== 15 || diagSum !== 15) {
					return false;
				}
			}
		}
	}

   if (sandwich) {
      for (let i = 0; i < sandwiches.length; i++) {
         for (let j = 0; j < sandwiches[i].length; j++) {
            let sum = 0;
            let summing = false;
            for (let index = 0; index < 9; index++) {
               let row, col;

               if (i == 0) {
                  row = i;
                  col = index;
               } else {
                  row = index;
                  col = i;
               }

               if (digits[row][col] == 1 || digits[row][col] == 9) {
                  summing = !summing;
               } else {
                  sum += digits[row][col];
               }
            }

            if (sum !== sandwiches[i][j]) {
               return false;
            }
         }
      }
   }

   return true;
}

function sleep(ms) {
	// Waits a specified amount of time. Used to let loading animation run while checking if puzzle is uniquely solvable
	return new Promise(resolve => setTimeout(resolve, ms));
}
