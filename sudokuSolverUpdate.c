#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

#define dataLine 10
#define fileNameLen 100

typedef struct cell {
    int digit;
    bool notes[9];
} Cell;

void sudokuInp(struct cell sudoku[9][9]);
void fillNotes(struct cell sudoku[9][9]);
void updateNotes(struct cell sudoku[9][9], int y, int x, int num);
void placeDigit(struct cell sudoku[9][9], int y, int x, int num);
bool checkValid(struct cell sudoku[9][9], int y, int x, int num);
bool checkRow(struct cell sudoku[9][9], int y, int x, int num);
bool checkCol(struct cell sudoku[9][9], int y, int x, int num);
bool checkBox(struct cell sudoku[9][9], int y, int x, int num);
bool inRow(struct cell sudoku[9][9], int row, int num);
bool inCol(struct cell sudoku[9][9], int col, int num);
bool inBox(struct cell sudoku[9][9], int box, int num);
void removeRowNotes(struct cell sudoku[9][9], int row, int num, int indexes[3]);
void removeColNotes(struct cell sudoku[9][9], int col, int num, int indexes[3]);
void removeBoxNotes(struct cell sudoku[9][9], int box, int num, int indexes[3]);
int getBox(int y, int x);
int gridFromBox(int boxIndex, int box, bool xAxis);
void copySudoku(struct cell sudoku[9][9], struct cell sudokuCopy[9][9]);
bool compareSudoku(struct cell sudoku[9][9], struct cell sudokuCopy[9][9]);
void printSudoku(struct cell sudoku[9][9]);
void printNotes(struct cell sudoku[9][9]);
bool checkSolved(struct cell sudoku[9][9]);
void solvedCells(struct cell sudoku[9][9]);
void hiddenSingles(struct cell sudoku[9][9]);
void pairs(struct cell sudoku[9][9]);
void solve(struct cell sudoku[9][9]);

int main(void) {
    struct cell sudoku[9][9];

    sudokuInp(sudoku);

    printf("Initial Puzzle:\n");
    printSudoku(sudoku);

    solve(sudoku);

    return 0;
}

void sudokuInp(struct cell sudoku[9][9]) {
    char inp[dataLine], tempChar;
    printf("Enter the given puzzle 1 row at a time. If a digit isn't given in the puzzle, enter a space instead of a digit.\n");
	for (int i = 0; i < 9; i++) {
        if ((i % 3) == 0) {
            printf("---------\n");
        }
        fgets(&inp, dataLine, stdin);
        fflush(stdin);

        for (int j = 0; j < 9; j++) {
            tempChar = inp[j];
            sudoku[i][j].digit = (tempChar == 32) ? 0: (int)(tempChar - 48);
        }
	}

	printf("---------\n");

	fillNotes(sudoku);

	return;
}

void fillNotes(struct cell sudoku[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            for (int num = 1; num <= 9; num++) {
                sudoku[i][j].notes[num - 1] = (sudoku[i][j].digit != 0) ? false : checkValid(sudoku, i, j, num);
            }
        }
    }

    return;
}

void updateNotes(struct cell sudoku[9][9], int y, int x, int num) {
    int box = getBox(y, x), row, col;
    for (int i = 0; i < 9; i++) {
        if (i != x) {
            sudoku[y][i].notes[num - 1] = false;
        }

        if (i != y) {
            sudoku[i][x].notes[num - 1] = false;
        }

        row = gridFromBox(i, box, false);
        col = gridFromBox(i, box, true);
        if (row != y && col != x) {
            sudoku[row][col].notes[num - 1] = false;
        }
    }

    return;
}

void placeDigit(struct cell sudoku[9][9], int y, int x, int num) {
    sudoku[y][x].digit = num;
    for (int i = 0; i < 9; i++) {
        sudoku[y][x].notes[i] = false;
    }
    updateNotes(sudoku, y, x, num);

    return;
}

bool checkValid(struct cell sudoku[9][9], int y, int x, int num) {
    return (checkRow(sudoku, y, x, num) && checkCol(sudoku, y, x, num) && checkBox(sudoku, y, x, num));
}

bool checkRow(struct cell sudoku[9][9], int y, int x, int num) {
    for (int i = 0; i < 9; i++) {
        if (i == x) {
            continue;
        } else {
            if (sudoku[y][i].digit == num) {
                return false;
            }
        }
    }

    return true;
}

bool checkCol(struct cell sudoku[9][9], int y, int x, int num) {
    for (int i = 0; i < 9; i++) {
        if (i == y) {
            continue;
        } else {
            if (sudoku[i][x].digit == num) {
                return false;
            }
        }
    }

    return true;
}

bool checkBox(struct cell sudoku[9][9], int y, int x, int num) {
    int box = getBox(y, x), i, j;

    for (int k = 0; k < 9; k++) {
        i = gridFromBox(k, box, false);
        j = gridFromBox(k, box, true);
        if (i == y && j == x) {
            continue;
        } else {
            if (sudoku[i][j].digit == num) {
                return false;
            }
        }
    }

    return true;
}

bool inRow(struct cell sudoku[9][9], int row, int num) {
    for (int i = 0; i < 9; i++) {
        if (sudoku[row][i].digit == num) {
            return true;
        }
    }

    return false;
}

bool inCol(struct cell sudoku[9][9], int col, int num) {
    for (int i = 0; i < 9; i++) {
        if (sudoku[i][col].digit == num) {
            return true;
        }
    }

    return false;
}

bool inBox(struct cell sudoku[9][9], int box, int num) {
    int row, col;
    for (int i = 0; i < 9; i++) {
        row = gridFromBox(i, box, false);
        col = gridFromBox(i, box, false);
        if (sudoku[row][col].digit == num) {
            return true;
        }
    }

    return false;
}

void removeRowNotes(struct cell sudoku[9][9], int row, int num, int indexes[3]) {
    for (int i = 0; i < 9; i++) {
        if (!(i == indexes[0] || i == indexes[1] || i == indexes[2])) {
            sudoku[row][i].notes[num - 1] = false;
        }
    }

    return;
}

void removeColNotes(struct cell sudoku[9][9], int col, int num) {
    for (int i = 0; i < 9; i++) {
        if (!(i == indexes[0] || i == indexes[1] || i == indexes[2])) {
            sudoku[i][col].notes[num - 1] = false;
        }
    }

    return;
}

void removeBoxNotes(struct cell sudoku[9][9], int box, int num) {
    int row, col;
    for (int i = 0; i < 9; i++) {
        if (!(i == indexes[0] || i == indexes[1] || i == indexes[2])) {
            row = gridFromBox(i, box, false);
            col = gridFromBox(i, box, true);
            sudoku[row][col].notes[num - 1] = false;
        }
    }

    return;
}

int getBox(int y, int x) {
    return 3 * (y / 3) + (x / 3) + 1;
}

int gridFromBox(int boxIndex, int box, bool xAxis) {
    return (xAxis) ? (3 * ((box - 1) % 3) + (boxIndex % 3)) : (3 * ((box - 1) / 3) + (boxIndex / 3));
}

void copySudoku(struct cell sudoku[9][9], struct cell sudokuCopy[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            sudokuCopy[i][j] = sudoku[i][j];
        }
    }

    return;
}

bool compareSudoku(struct cell sudoku[9][9], struct cell sudokuCopy[9][9]) {
    // Returns true if sudoku and sudokuCopy are identical, returns false otherwise
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (sudoku[i][j].digit == sudokuCopy[i][j].digit) {
                for (int k = 0; k < 9; k++) {
                    if (sudoku[i][j].notes[k] != sudokuCopy[i][j].notes[k]) {
                        return false;
                    }
                }
            } else {
                return false;
            }
        }
    }

    return true;
}

void printSudoku(struct cell sudoku[9][9]) {
    for (int i = 0; i < 9; i++){
        if ((i % 3) == 0) {
            printf("-------------------------\n");
        }
        for (int j = 0; j < 9; j++){
            if ((j % 3) == 0) {
                printf("| ");
            }

            printf("%d ", sudoku[i][j].digit);
        }
        printf("|\n");
    }
    printf("-------------------------\n\n");

    return;
}

void printNotes(struct cell sudoku[9][9]) {
    for (int i = 0; i < 9; i++){
        if ((i % 3) == 0) {
            printf("-------------------------------------------------------------------------------------------------\n");
        }
        for (int j = 0; j < 9; j++){
            if ((j % 3) == 0) {
                printf("| ");
            }

            int noteVal = 0;

            for (int k = 0; k < 9; k++) {
                if (sudoku[i][j].notes[k]) {
                    noteVal *= 10;
                    noteVal += k + 1;
                }
            }

            printf("%9d ", noteVal);
        }
        printf("|\n");
    }
    printf("-------------------------------------------------------------------------------------------------\n\n");

    return;
}

bool checkSolved(struct cell sudoku[9][9]) {
    int box, row, col, tempRow, tempCol;
    for (int i = 0; i < 9; i++) {
        box = i + 1;
        for (int j = 0; j < 9; j++) {
            row = gridFromBox(j, box, false);
            col = gridFromBox(j, box, true);

            if (sudoku[i][j].digit == 0 || sudoku[j][i].digit == 0 || sudoku[row][col].digit == 0) {
                return false;
            } else {
                for (int k = 0; k < 9; k++) {
                    if (k == j) {
                        continue;
                    } else {
                        tempRow = gridFromBox(k, box, false);
                        tempCol = gridFromBox(k, box, true);

                        if (sudoku[i][j].digit == sudoku[i][k].digit || sudoku[j][i].digit == sudoku[k][i].digit || sudoku[row][col].digit == sudoku[tempRow][tempCol].digit) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
}

void solvedCells(struct cell sudoku[9][9]) {
    // Checks for solved cells (naked singles)
    int notesSum;

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            notesSum = 0;
            for (int k = 0; k < 9; k++) {
                notesSum += sudoku[i][j].notes[k] ? 1 : 0;
            }

            if (notesSum == 1) {
                for (int num = 1; num <= 9; num++) {
                    if (sudoku[i][j].notes[num - 1]) {
                        placeDigit(sudoku, i, j, num);
                        printf("Solved Cell: %d placed at r%dc%d.\n", num, i + 1, j + 1);
                        break;
                    }
                }
            }
        }
    }

    return;
}

void hiddenSingles(struct cell sudoku[9][9]) {
    int sum;
    for (int num = 1; num <= 9; num++) {
        for (int i = 0; i < 9; i++) {
            sum = 0;
            if (inRow(sudoku, i, num)) {
                continue;
            } else {
                for (int j = 0; j < 9; j++) {
                    if (sudoku[i][j].notes[num - 1]) {
                        sum++;
                    }

                    if (sum > 1) {
                        break;
                    }
                }

                if (sum == 1) {
                    for (int j = 0; j < 9; j++) {
                        if (sudoku[i][j].notes[num - 1]) {
                            placeDigit(sudoku, i, j, num);
                            printf("r%dc%d only available position for %d in r%d. %d placed at r%dc%d.\n", i + 1, j + 1, num, i + 1, num, i + 1, j + 1);
                        }
                    }
                }
            }

            sum = 0;
            if (inCol(sudoku, i, num)) {
                continue;
            } else {
                for (int j = 0; j < 9; j++) {
                    if (sudoku[j][i].notes[num - 1]) {
                        sum++;
                    }

                    if (sum > 1) {
                        break;
                    }
                }

                if (sum == 1) {
                    for (int j = 0; j < 9; j++) {
                        if (sudoku[j][i].notes[num - 1]) {
                            placeDigit(sudoku, j, i, num);
                            printf("r%dc%d only available position for %d in c%d. %d placed at r%dc%d.\n", j + 1, i + 1, num, i + 1, num, j + 1, i + 1);
                        }
                    }
                }
            }

            sum = 0;
            if (inBox(sudoku, i, num)) {
                continue;
            } else {
                for (int j = 0; j < 9; j++) {
                    int row = gridFromBox(j, i + 1, false);
                    int col = gridFromBox(j, i + 1, true);
                    if (sudoku[row][col].notes[num - 1]) {
                        sum++;
                    }

                    if (sum > 1) {
                        break;
                    }
                }

                if (sum == 1) {
                    for (int j = 0; j < 9; j++) {
                        int row = gridFromBox(j, i + 1, false);
                        int col = gridFromBox(j, i + 1, true);
                        if (sudoku[row][col].notes[num - 1]) {
                            placeDigit(sudoku, row, col, num);
                            printf("r%dc%d only available position for %d in box %d. %d placed at r%dc%d.\n", row + 1, col + 1, num, i + 1, num, row + 1, col + 1);
                        }
                    }
                }
            }
        }
    }

    return;
}

void pairs(struct cell sudoku[9][9]) {
    int sum, index[3], count, num;
    index[2] = -1;
    bool notesMatch;
    for (int i = 0; i < 9; i++) {
        count = 0;
        for (int j = 0; j < 9; j++) {
            sum = 0;
            for (int k = 0; k < 0; k++) {
                sum += (sudoku[i][j].notes[k]) ? 1 : 0;
            }

            if (sum == 2 && count = 0) {
                index[count] = j;
                count++;
            } else if (sum == 2 && count = 1) {
                notesMatch = true;
                for (int k = 0; k < 9; k++) {
                    if (sudoku[i][index[0]].notes[k] ^ sudoku[i][j].notes[k]) {
                        notesMatch = false;
                        break;
                    }
                }

                if (notesMatch) {
                    for (int k = 0; k < 9; k++) {
                        if (sudoku[i][index[0]].notes[k]) {
                            removeRowNotes(sudoku, i, k + 1, index);
                        }
                    }
                }
            }
        }
    }
}

void solve(struct cell sudoku[9][9]) {
    // Below code recursively solves sudoku, as a computer would

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (sudoku[i][j].digit == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (checkValid(sudoku, i, j, num)) {
                        sudoku[i][j].digit = num;
                        solve(sudoku);
                        sudoku[i][j].digit = 0;
                    }
                }

                return;
            }
        }
    }

    printf("Solved Puzzle:\n");
    printSudoku(sudoku);

    return;


    // Below code logically solves sudoku, as a human would
/*
    struct cell sudokuCopy[9][9];

    while (!checkSolved(sudoku)) {
        copySudoku(sudoku, sudokuCopy);

        if (compareSudoku(sudoku, sudokuCopy)) {
            solvedCells(sudoku);
        }

        if (compareSudoku(sudoku, sudokuCopy)) {
            hiddenSingles(sudoku);
        }

        if (compareSudoku(sudoku, sudokuCopy)) {
            pairs(sudoku);
        }

        printNotes(sudoku);
        printSudoku(sudoku);
    }

    printf("Solved Puzzle:\n");
    printSudoku(sudoku);

    return;
*/
}
