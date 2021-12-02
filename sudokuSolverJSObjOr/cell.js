class Cell {
   constructor(row, col) {

      this.row = row;
      this.col = col;

      this.x = this.col - 1;
      this.y = this.row - 1;

      this.box = (this.y - this.y % 3) + ((this.x - this.x % 3) / 3) + 1;

      this.digit = 0;
      this.digitColor = color('blue');
      this.notes = [];
      this.noteHighlight = [];

      for (let i = 0; i < 9; i++) {
         this.notes[i] = true;
         this.noteHighlight[i] = color('white');
      }

      this.numPossible = 9;
      this.selected = false;
   }

   show = function() {
      noStroke();

      push();
      translate(width / 9 * this.x + width / 18, width / 9 * this.y + width / 18);

      if (this.digit == 0) {
         this.printNotes();
      } else {
         fill(this.digitColor);
         text(this.digit, 0, 0);
      }

      pop();

      this.highlightCell();
   }

   highlightCell = function() {
      noFill();
      if (this.selected) {
         strokeWeight(8);
         stroke(0, 0, 255);
         push();
         translate(width / 9 * this.x, width / 9 * this.y)
         rect(0, 0, width / 9, height / 9);
         pop();
      }
   }

   printNotes = function() {
   	strokeWeight(0);
		let noteHighlighted = false;
		for (let i = 0; i < 9; i++) {
			if (!sudoku.compareColor(this.noteHighlight[i], color("white"))) {
				noteHighlighted = true;
				break;
			}
		}
      if (this.numPossible !== 9 || noteHighlighted) {
         textSize(16);

         for (let i = 0; i < 9; i++) {
            push();
            translate(((i % 3) - 1) * (width / 27), ((i - i % 3) / 3 - 1) * (height / 27));
            if (this.notes[i]) {
               noStroke();
               rectMode(CENTER);
               fill(this.noteHighlight[i]);
               rect(0, 0, width / 40, height / 40);
               strokeWeight(0);
               rectMode(CORNER);
               fill(0);
               text(i + 1, 0, 0);
            }
            pop();
         }

         textSize(56);
      }
   }

   placeDigit = function(val) {
      this.digit = val;
      for (let i = 0; i < 9; i++) {
         this.notes[i] = false;
      }
      this.numPossible = 0;
   }

   changeColor = function(c, noteVal) {
      if (this.digit == 0 && this.notes[noteVal - 1]) {
         if (sudoku.compareColor(c, color("yellow"))) {
            if (sudoku.compareColor(this.noteHighlight[noteVal - 1], color("white"))) {
               this.noteHighlight[noteVal - 1] = c;
            }
         } else {
            this.noteHighlight[noteVal - 1] = c;
         }
      }
   }

   sees = function(other) {
      if (this.row == other.row && this.col == other.col) {
         return false;
      } else {
			let seesThermo = false;
			if (thermo) {
				for (let i = 0; i < thermometers.length; i++) {
					if (thermometers[i].onThermo(this.y, this.x) && thermometers[i].onThermo(other.y, other.x)) {
						seesThermo = true;
					}
				}
			}
         return (this.row == other.row || this.col == other.col || this.box == other.box || seesThermo);
      }
   }
}
