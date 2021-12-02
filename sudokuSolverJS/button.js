// Brandon Hippe
// Button object for Sudoku Solver Interface

class Button {
	constructor(x, y, w, h, buttonText, toggleable) {
		this.left = floor(x);
		this.right = this.left + floor(w);
		this.top = floor(y);
		this.bottom = this.top + floor(h);

		this.text = buttonText;
		this.textSize = floor((h * 0.75) * 0.75);
		this.textLoc = [(this.left + this.right) / 2, (this.top + this.bottom) / 2]

		this.toggle = toggleable;
		this.selected = false;
		this.active = false;
	}

	show = function() {
		rectMode(CORNERS);
		stroke(0);
		strokeWeight(3);
		fill((this.selected) ? color("darkorange") : ((this.active) ? color("deepskyblue") : color("white")));
		rect(this.left, this.top, this.right, this.bottom, 5);
		noStroke();
		fill(0);
		textSize(this.textSize);
		text(this.text, this.textLoc[0], this.textLoc[1]);

	}

	clicked = function(mX, mY, others = []) {
		if (mX >= this.left && mX <= this.right && mY >= this.top && mY <= this.bottom) {
			this.selected = true;
			if (this.toggle) {
				this.active = !this.active;
			}
		}

		if (this.selected) {
			for (let i = 0; i < others.length; i++) {
				let other = others[i];
				if (other !== this) {
					other.selected = false;
				}
			}
		}

		return this.selected;
	}
}
