let sudoku;
let sudokuCopy;
let x = 0;
let y = 0;
let thermo = false;
let thermoCheckbox;
let thermometers = [];
let drawing = false;

function setup() {
   sudoku = new Grid();

   createCanvas(900, 900);
   background(255);

   textAlign(CENTER, CENTER);
   textSize(56);

   sudoku.show();

   thermoCheckbox = createCheckbox('Thermo', false);
   thermoCheckbox.changed(thermoChanged);
}

function thermoChanged() {
   if (this.checked()) {
      thermo = true;
		drawThermo = createCheckbox('Draw Thermometer', false);
		drawThermo.changed(drawThermoChanged);
		drawing = false;
		sudoku.show();
   } else  {
      thermo = false;
		drawing = false;
      for (let i = thermometers.length; i >= 0; i--) {
         thermometers.splice(i);
      }
		drawThermo.remove();
		sudoku.show();
   }
}

function drawThermoChanged() {
	if (this.checked()) {
		thermometers.push(new Thermometer);
		drawing = true;
	} else {
		if (thermometers[thermometers.length - 1].cells <= 1) {
			thermometers.splice(thermometers.length - 1);
		}

		drawing = false;
	}
	sudoku.show();
}

function mousePressed() {
	if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
	   if (!sudoku.solved) {
         x = (mouseX - mouseX % 100) / 100;
         y = (mouseY - mouseY % 100) / 100;

			if (drawing) {
	         thermometers[thermometers.length - 1].newCell(y, x);
	      }

	      sudoku.show();
	   }
	}
}

function keyPressed() {
   if (!sudoku.solved) {
      if (key >= 1 && key <= 9 && sudoku.cells[y][x].digit == 0) {
         sudoku.cells[y][x].digitColor = color('black');
         sudoku.placeDigit(y, x, key);
         x++;

         if (x % 9 == 0) {
            x = 0;
            y++;
         }

         if (y % 9 == 0) {
            y = 0;
         }
         sudoku.show();
      } else if (key >= 1 && key <= 9 && sudoku.cells[y][x].digit !== 0) {
         sudoku.removeDigit(y, x);
         sudoku.placeDigit(y, x, key);
         x++;

         if (x % 9 == 0) {
            x = 0;
            y++;
         }

         if (y % 9 == 0) {
            y = 0;
         }
         sudoku.show();
      } else if (keyCode == DELETE || keyCode == BACKSPACE) {
         sudoku.removeDigit(y, x);
         sudoku.show();
      } else if (keyCode == UP_ARROW || keyCode == DOWN_ARROW || keyCode == 38 || keyCode == 40) {
         y += (keyCode == DOWN_ARROW || keyCode == 40) ? 1 : -1;
         if (x % 9 == 0 && x !== 0) {
            x = 0;
            y++;
         }

         if (x < 0) {
            x = 8;
            y--;
         }

         if (y % 9 == 0 && y !== 0) {
            y = 0;
         }

         if (y < 0) {
            y = 8;
         }
         sudoku.show();
      } else if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW || keyCode == 37 || keyCode == 39) {
         x += (keyCode == RIGHT_ARROW || keyCode == 39) ? 1 : -1;
         if (x % 9 == 0 && x !== 0) {
            x = 0;
            y++;
         }

         if (x < 0) {
            x = 8;
            y--;
         }

         if (y % 9 == 0 && y !== 0) {
            y = 0;
         }

         if (y < 0) {
            y = 8;
         }
         sudoku.show();
      } else if (key == ' ') {

			if (drawing) {
				if (thermometers[thermometers.length - 1].cells < 2) {
					thermometers.splice(thermometers.length - 1);
				}
				thermometers.push(new Thermometer);
			} else {
            sudokuCopy = new Grid(true);

            if (thermo || sudokuCopy.checkSolvable()) {
   	         sudoku.solve();

   				x = -1;
   				y = -1;
            } else {
               console.log("Puzzle is not uniquely solvable");
            }
			}
			sudoku.show();
      }
   } else {
      if (keyCode == DELETE || keyCode == BACKSPACE) {
         sudoku = new Grid();
         x = 0;
         y = 0;

			if (thermo) {
				drawThermo.remove();
				for (let i = thermometers.length; i >= 0; i--) {
		         thermometers.splice(i);
		      }
				thermoCheckbox.remove();
				thermoCheckbox = createCheckbox('Thermo', false);
			   thermoCheckbox.changed(thermoChanged);
				drawing = false;
				thermo = false;
			}

         sudoku.show();
      }
   }
}
