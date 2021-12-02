#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include <math.h>

#define dataLine 10
#define fileNameLen 100

void sudokuInp(int sudoku[9][9]);
void printSudoku(int sudoku[9][9]);
void printNotes(int notes[9][9]);
void scan(int sudoku[9][9], int notes[9][9], int x, int y);
void fillNotes(int sudoku[9][9], int notes[9][9]);
void updateNotes(int sudoku[9][9], int notes[9][9], int x, int y, int num);
bool checkRow(int sudoku[9][9], int row, int num);
bool checkCol(int sudoku[9][9], int col, int num);
bool checkBox(int sudoku[9][9], int box, int num);
int rowNotes(int notes[9][9], int index[2], int indecies[6], int num, int count);
int colNotes(int notes[9][9], int index[2], int indecies[6], int num, int count);
int boxNotes(int notes[9][9], int index[2], int indecies[6], int num, int count);
void removeRowNotes(int notes[9][9], int num, int indecies[6]);
void removeColNotes(int notes[9][9], int num, int indecies[6]);
void removeBoxNotes(int notes[9][9], int num, int indecies[6]);
bool checkSolvable(int sudoku[9][9]);
bool checkSolved(int sudoku[9][9]);
bool compare(int prevSudoku[9][9], int currSudoku[9][9]);
void copySudoku(int sudoku[9][9], int newSudoku[9][9]);
int findSpot(int numItems, int array[numItems], int val);
void fillSingles(int sudoku[9][9], int notes[9][9]);
void digitConstraints(int sudoku[9][9], int notes[9][9]);
void noteConstraints(int sudoku[9][9], int notes[9][9]);
void noteRestrictions(int sudoku[9][9], int notes[9][9]);
void findDoubles(int sudoku[9][9], int notes[9][9]);
void findSwordfish(int sudoku[9][9], int notes[9][9]);
void chainCells(int sudoku[9][9], int notes[9][9]);
void solve(int sudoku[9][9], int notes[9][9], bool print);
void solveRecurs(int sudoku[9][9]);


void sudokuInp(int sudoku[9][9]) {
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
            sudoku[i][j] = (tempChar == 32) ? 0: (int)(tempChar - 48);
        }
	}

	printf("---------\n");

	return;
}

void printSudoku(int sudoku[9][9]) {
    for (int i = 0; i < 9; i++){
        if ((i % 3) == 0) {
            printf("-------------------------\n");
        }
        for (int j = 0; j < 9; j++){
            if ((j % 3) == 0) {
                printf("| ");
            }

            printf("%d ", sudoku[i][j]);
        }
        printf("|\n");
    }
    printf("-------------------------\n\n");

    return;
}

void printNotes(int notes[9][9]) {
    for (int i = 0; i < 9; i++){
        if ((i % 3) == 0) {
            printf("-------------------------------------------------------------------------------------------------\n");
        }
        for (int j = 0; j < 9; j++){
            if ((j % 3) == 0) {
                printf("| ");
            }

            printf("%9d ", notes[i][j]);
        }
        printf("|\n");
    }
    printf("-------------------------------------------------------------------------------------------------\n\n");

    return;
}

void scan(int sudoku[9][9], int notes[9][9], int x, int y) {
    int cell = sudoku[y - 1][x - 1], box, posVals = 0;

    if (cell != 0) {
        return;
    }

    box = 3 * ((y - 1) / 3) + ((x - 1) / 3) + 1;

    for (int i = 1; i <= 9; i++) {
        if (checkRow(sudoku, y, i) && checkCol(sudoku, x, i) && checkBox(sudoku, box, i)) {
            posVals *= 10;
            posVals += i;
        }
    }

    if (posVals < 10 && posVals > 0) {
        sudoku[y - 1][x - 1] = posVals;
        updateNotes(sudoku, notes, x - 1, y - 1, posVals);
    }

    return;
}

void fillNotes(int sudoku[9][9], int notes[9][9]) {
    int box, posVals;

    for (int y = 1; y <= 9; y++) {
        for (int x = 1; x <= 9; x++) {
            posVals = 0;
            box = 3 * ((y - 1) / 3) + ((x - 1) / 3) + 1;

            notes[y - 1][x - 1] = 0;

            if (sudoku[y - 1][x - 1] != 0) {
                continue;
            }

            for (int i = 1; i <= 9; i++) {
                if (checkRow(sudoku, y, i) && checkCol(sudoku, x, i) && checkBox(sudoku, box, i)) {
                    posVals *= 10;
                    posVals += i;
                }
            }

            if (posVals < 10 && posVals > 0) {
                sudoku[y - 1][x - 1] = posVals;
                updateNotes(sudoku, notes, x - 1, y - 1, posVals);
            }
            else {
                notes[y - 1][x - 1] = posVals;
            }
        }
    }

    return;
}

void updateNotes(int sudoku[9][9], int notes[9][9], int x, int y, int num) {
    int indecies[2] = {y, x}, tempNum;
    notes[y][x] = 0;

    removeRowNotes(notes, num, indecies);
    removeColNotes(notes, num, indecies);
    removeBoxNotes(notes, num, indecies);

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (sudoku[i][j] != 0) {
                tempNum = sudoku[i][j];
                notes[i][j] = 0;
                indecies[0] = i;
                indecies[1] = j;

                removeRowNotes(notes, tempNum, indecies);
                removeColNotes(notes, tempNum, indecies);
                removeBoxNotes(notes, tempNum, indecies);
            }
        }
    }

    return;
}

bool checkRow(int sudoku[9][9], int row, int num) {
    for (int i = 0; i < 9; i++) {
        if (sudoku[row - 1][i] == num) {
            return false;
        }
    }

    return true;
}

bool checkCol(int sudoku[9][9], int col, int num) {
    for (int i = 0; i < 9; i++) {
        if (sudoku[i][col - 1] == num) {
            return false;
        }
    }

    return true;
}

bool checkBox(int sudoku[9][9], int box, int num) {
    int row, col;
    for (int i = 0; i < 3; i++) {
        for (int j = 0; j < 3; j++) {
            row = ((box - 1) / 3) * 3 + i;
            col = ((box - 1) % 3) * 3 + j;
            if (sudoku[row][col] == num) {
                return false;
            }
        }
    }

    return true;
}

int rowNotes(int notes[9][9], int index[2], int indecies[6], int num, int count) {
    int row = index[0];

    for (int i = 0; i < 9; i++) {
        if (notes[row][i] == num) {
            indecies[count * 2] = row;
            indecies[count * 2 + 1] = i;
            count++;
        }
    }

    return count;
}

int colNotes(int notes[9][9], int index[2], int indecies[6], int num, int count) {
    int col = index[1];

    for (int i = 0; i < 9; i++) {
        if (notes[i][col] == num) {
            indecies[count * 2] = i;
            indecies[count * 2 + 1] = col;
            count++;
        }
    }

    return count;
}

int boxNotes(int notes[9][9], int index[2], int indecies[6], int num, int count) {
    for (int i = ((index[0] / 3) * 3); i < ((index[0] / 3) * 3) + 3; i++) {
        for (int j = ((index[1] / 3) * 3); j < ((index[1] / 3) * 3) + 3; j++) {
            if (notes[i][j] == num) {
                indecies[count * 2] = i;
                indecies[count * 2 + 1] = j;
                count++;
            }
        }
    }

    return count;
}

void removeRowNotes(int notes[9][9], int num, int indecies[6]) {
    int count, row = indecies[0], vals[3], tempVal;

    for (int i = 2; i >= 0; i--) {
        vals[i] = num % 10;
        num /= 10;
    }

    for (int i = 0; i < 9; i++) {
        if (i == indecies[1] || i == indecies[3] || i == indecies[5]) {
            continue;
        }

        int newNote[9] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
        count = 0;

        while (notes[row][i] != 0) {
            if (notes[row][i] % 10 != vals[0] && notes[row][i] % 10 != vals[1] && notes[row][i] % 10 != vals[2]){
                newNote[8 - count] = notes[row][i] % 10;
                count++;
            }

            notes[row][i] /= 10;
        }

        for (int j = 0; j < 9; j++) {
            if (j == 0) {
                tempVal = 0;
            }
            tempVal *= 10;
            tempVal += newNote[j];
        }

        notes[row][i] = tempVal;
    }

    return;
}

void removeColNotes(int notes[9][9], int num, int indecies[6]) {
    int count, col = indecies[1], vals[3], tempVal;

    for (int i = 2; i >= 0; i--) {
        vals[i] = num % 10;
        num /= 10;
    }

    for (int i = 0; i < 9; i++) {
        if (i == indecies[0] || i == indecies[2] || i == indecies[4]) {
            continue;
        }

        int newNote[9] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
        count = 0;

        while (notes[i][col] != 0) {
            if (notes[i][col] % 10 != vals[0] && notes[i][col] % 10 != vals[1] && notes[i][col] % 10 != vals[2]){
                newNote[8 - count] = notes[i][col] % 10;
                count++;
            }

            notes[i][col] /= 10;
        }

        for (int j = 0; j < 9; j++) {
            if (j == 0) {
                tempVal = 0;
            }
            tempVal *= 10;
            tempVal += newNote[j];
        }

        notes[i][col] = tempVal;
    }

    return;
}

void removeBoxNotes(int notes[9][9], int num, int indecies[6]) {
    int count, vals[3], tempVal;

    for (int i = 2; i >= 0; i--) {
        vals[i] = num % 10;
        num /= 10;
    }

    for (int i = ((indecies[0] / 3) * 3); i < ((indecies[0] / 3) * 3) + 3; i++) {
        for (int j = ((indecies[1] / 3) * 3); j < ((indecies[1] / 3) * 3) + 3; j++) {
            if ((i == indecies[0] && j == indecies[1]) || (i == indecies[2] && j == indecies[3]) || (i == indecies[4] && j == indecies[5])) {
                continue;
            }

            int newNote[9] = {0, 0, 0, 0, 0, 0, 0, 0, 0};
            count = 0;

            while (notes[i][j] != 0) {
                if (notes[i][j] % 10 != vals[0] && notes[i][j] % 10 != vals[1] && notes[i][j] % 10 != vals[2]){
                    newNote[8 - count] = notes[i][j] % 10;
                    count++;
                }

                notes[i][j] /= 10;
            }

            for (int k = 0; k < 9; k++) {
                if (k == 0) {
                    tempVal = 0;
                }
                tempVal *= 10;
                tempVal += newNote[k];
            }

            notes[i][j] = tempVal;
        }
    }

    return;
}

bool checkSolvable(int sudoku[9][9]) {
    int count = 0;
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (sudoku[i][j] != 0) {
                count++;
            }
        }
    }

    return (count >= 17);
}

bool checkSolved(int sudoku[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if ((sudoku[i][j] == 0) || (sudoku[j][i] == 0) || (sudoku[(i / 3) * 3 + (j / 3)][(i % 3) * 3 + (j % 3)] == 0)) {
                return false;
            }

            for (int k = j + 1; k < 9; k++){
                if ((sudoku[i][j] == sudoku[i][k]) || (sudoku[j][i] == sudoku[k][i]) || (sudoku[(i / 3) * 3 + (j / 3)][(i % 3) * 3 + (j % 3)] == sudoku[(i / 3) * 3 + (k / 3)][(i % 3) * 3 + (k % 3)])) {
                    return false;
                }
            }
        }
    }

    return true;
}

bool compare(int prevSudoku[9][9], int currSudoku[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (prevSudoku[i][j] != currSudoku[i][j]) {
                return true;
            }
        }
    }

    return false;
}

void copySudoku(int sudoku[9][9], int newSudoku[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            newSudoku[i][j] = sudoku[i][j];
        }
    }

    return;
}

int findSpot(int numItems, int array[numItems], int val) {
    for (int i = 0; i < numItems; i++) {
        if (array[i] == val) {
            return i;
        }
    }

    return -1;
}

void fillSingles(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    bool digitChanged;

    do {
        digitChanged = false;
        for (int i = 0; i < 9; i++) {
            for (int j = 0; j < 9; j++) {
                if (sudoku[i][j] == 0) {
                    scan(sudoku, notes, j + 1, i + 1);
                    if (sudoku[i][j] != 0 && !digitChanged) {
                        digitChanged = true;
                    }
                }
            }
        }
    } while (digitChanged);
}

void digitConstraints(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int numDigit, satisfiedRows[9], satisfiedCols[9], x, y;
    for (int i = 1; i <= 9; i++) {
        numDigit = 0;
        for (int j = 1; j <= 9; j++) {
            if (sudoku[i][j] != 0) {
                continue;
            }
            numDigit += (checkBox(sudoku, j, i)) ? 0 : 1;
            satisfiedRows[j - 1] = (checkRow(sudoku, j, i)) ? 0 : 1;
            satisfiedCols[j - 1] = (checkCol(sudoku, j, i)) ? 0 : 1;
        }

        if (numDigit == 8) {
            x = findSpot(9, satisfiedCols, i);
            y = findSpot(9, satisfiedRows, i);

            sudoku[y][x] = i;
            updateNotes(sudoku, notes, x, y, i);
        }
    }

    return;
}

void noteConstraints(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int noteVal, comboLocs[6], num, count, indecies[2];
    for (int i = 0; i <= 7; i++) {
        for (int j = i + 1; j <= 8; j++) {
            for (int k = j + 1; k <= 9; k++) {
                for (int y = 0; y < 9; y++) {
                    for (int x = 0; x < 9; x++) {
                        noteVal = notes[y][x];

                        if (noteVal == 0) {
                            continue;
                        }

                        while (noteVal != 0) {
                            if (!(((noteVal % 10) == i) || ((noteVal % 10) == j) || ((noteVal % 10) == k))) {
                                break;
                            }

                            noteVal /= 10;
                        }

                        if (noteVal != 0) {
                            continue;
                        }

                        for (int n = 0; n < 6; n++){
                            comboLocs[n] = -1;
                        }

                        indecies[0] = y;
                        indecies[1] = x;

                        if (i == 0) {
                            num = j * 10 + k;

                            if (rowNotes(notes, indecies, comboLocs, num, 0) == 2) {
                                removeRowNotes(notes, num, comboLocs);
                            }

                            if (colNotes(notes, indecies, comboLocs, num, 0) == 2) {
                                removeColNotes(notes, num, comboLocs);
                            }

                            if (boxNotes(notes, indecies, comboLocs, num, 0) == 2) {
                                removeBoxNotes(notes, num, comboLocs);
                            }
                        }
                        else {
                            count = 0;

                            num = i * 10 + j;
                            count = rowNotes(notes, indecies, comboLocs, num, count);

                            num = i * 10 + k;
                            count = rowNotes(notes, indecies, comboLocs, num, count);

                            num = j * 10 + k;
                            count = rowNotes(notes, indecies, comboLocs, num, count);

                            num = i * 100 + j * 10 + k;
                            count = rowNotes(notes, indecies, comboLocs, num, count);

                            if (count == 3) {
                                removeRowNotes(notes, num, comboLocs);
                            }

                            for (int n = 0; n < 6; n++){
                                comboLocs[n] = -1;
                            }

                            count = 0;

                            num = i * 10 + j;
                            count = colNotes(notes, indecies, comboLocs, num, count);

                            num = i * 10 + k;
                            count = colNotes(notes, indecies, comboLocs, num, count);

                            num = j * 10 + k;
                            count = colNotes(notes, indecies, comboLocs, num, count);

                            num = i * 100 + j * 10 + k;
                            count = colNotes(notes, indecies, comboLocs, num, count);

                            if (count == 3) {
                                removeColNotes(notes, num, comboLocs);
                            }

                            for (int n = 0; n < 6; n++){
                                comboLocs[n] = -1;
                            }

                            count = 0;

                            num = i * 10 + j;
                            count = boxNotes(notes, indecies, comboLocs, num, count);

                            num = i * 10 + k;
                            count = boxNotes(notes, indecies, comboLocs, num, count);

                            num = j * 10 + k;
                            count = boxNotes(notes, indecies, comboLocs, num, count);

                            num = i * 100 + j * 10 + k;
                            count = boxNotes(notes, indecies, comboLocs, num, count);

                            if (count == 3) {
                                removeBoxNotes(notes, num, comboLocs);
                            }
                        }
                    }
                }
            }
        }
    }

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (notes[i][j] < 10 && notes[i][j] > 0) {
                sudoku[i][j] = notes[i][j];
                updateNotes(sudoku, notes, j, i, notes[i][j]);
            }
        }
    }
    return;
}

void noteRestrictions(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int numLocs, tempNote, indecies[6];
    for (int num = 1; num <= 9; num++) {
        for (int i = 0; i < 9; i++) {
            numLocs = 0;

            for (int j = 0; j < 9; j++) {
                tempNote = notes[i][j];

                while (tempNote != 0) {
                    if (tempNote % 10 == num) {
                        break;
                    }
                    tempNote /= 10;
                }

                if (tempNote == 0) {
                    continue;
                }

                numLocs *= 10;
                numLocs += j + 1;
            }

            if (numLocs > 0 && numLocs < 10) {
                sudoku[i][numLocs - 1] = num;
                updateNotes(sudoku, notes, numLocs - 1, i, num);
                continue;
            }

            if (numLocs == 123 || numLocs == 12 || numLocs == 23 || numLocs == 13) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = i;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                }

                removeBoxNotes(notes, num, indecies);
            }

            if (numLocs == 456 || numLocs == 45 || numLocs == 56 || numLocs == 46) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = i;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                }

                removeBoxNotes(notes, num, indecies);
            }

            if (numLocs == 789 || numLocs == 78 || numLocs == 89 || numLocs == 79) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = i;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                }

                removeBoxNotes(notes, num, indecies);
            }
        }

        for (int i = 0; i < 9; i++) {
            numLocs = 0;

            for (int j = 0; j < 9; j++) {
                tempNote = notes[j][i];

                while (tempNote != 0) {
                    if (tempNote % 10 == num) {
                        break;
                    }
                    tempNote /= 10;
                }

                if (tempNote == 0) {
                    continue;
                }

                numLocs *= 10;
                numLocs += j + 1;
            }

            if (numLocs > 0 && numLocs < 10) {
                sudoku[numLocs - 1][i] = num;
                updateNotes(sudoku, notes, i, numLocs - 1, num);
                continue;
            }

            if (numLocs == 123 || numLocs == 12 || numLocs == 23 || numLocs == 13) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                    indecies[2 * k + 1] = i;
                }

                removeBoxNotes(notes, num, indecies);
            }

            if (numLocs == 456 || numLocs == 45 || numLocs == 56 || numLocs == 46) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                    indecies[2 * k + 1] = i;
                }

                removeBoxNotes(notes, num, indecies);
            }

            if (numLocs == 789 || numLocs == 78 || numLocs == 89 || numLocs == 79) {
                for (int k = 0; k < 3; k++) {
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : (numLocs % (int)(pow(10, k + 1))) / pow(10, k) - 1;
                    indecies[2 * k + 1] = i;
                }

                removeBoxNotes(notes, num, indecies);
            }
        }

        for (int box = 1; box <= 9; box++) {
            numLocs = 0;
            int row, col;

            for (int i = 1; i <= 9; i++) {
                row = ((box - 1) / 3) * 3 + ((i - 1) / 3);
                col = ((box - 1) % 3) * 3 + ((i - 1) % 3);
                tempNote = notes[row][col];

                while (tempNote != 0) {
                    if (tempNote % 10 == num) {
                        break;
                    }

                    tempNote /= 10;
                }

                if (tempNote == 0) {
                    continue;
                }

                numLocs *= 10;
                numLocs += i;
            }
            if (numLocs > 0 && numLocs < 10) {
                row = ((box - 1) / 3) * 3 + ((numLocs - 1) / 3);
                col = ((box - 1) % 3) * 3 + ((numLocs - 1) % 3);
                sudoku[row][col] = num;
                updateNotes(sudoku, notes, col, row, num);
                continue;
            }

            if (numLocs == 123 || numLocs == 12 || numLocs == 23 || numLocs == 13) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : row;
                    indecies[2 * k + 1] = col;
                }

                removeRowNotes(notes, num, indecies);
            }

            if (numLocs == 456 || numLocs == 45 || numLocs == 56 || numLocs == 46) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : row;
                    indecies[2 * k + 1] = col;
                }

                removeRowNotes(notes, num, indecies);
            }

            if (numLocs == 789 || numLocs == 78 || numLocs == 89 || numLocs == 79) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = (numLocs < 100 && k == 2) ? -1 : row;
                    indecies[2 * k + 1] = col;
                }

                removeRowNotes(notes, num, indecies);
            }

            if (numLocs == 147 || numLocs == 14 || numLocs == 47 || numLocs == 17) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = row;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : col;
                }

                removeColNotes(notes, num, indecies);
            }

            if (numLocs == 258 || numLocs == 25 || numLocs == 58 || numLocs == 28) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = row;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : col;
                }

                removeColNotes(notes, num, indecies);
            }

            if (numLocs == 369 || numLocs == 36 || numLocs == 69 || numLocs == 39) {
                for (int k = 0; k < 3; k++) {
                    row = ((box - 1) / 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / pow(10, k)) - 1) / 3);
                    col = ((box - 1) % 3) * 3 + ((((numLocs % (int)(pow(10, k + 1))) / (int)pow(10, k)) - 1) % 3);
                    indecies[2 * k] = row;
                    indecies[2 * k + 1] = (numLocs < 100 && k == 2) ? -1 : col;
                }

                removeColNotes(notes, num, indecies);
            }
        }
    }

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (notes[i][j] > 0 && notes[i][j] < 10) {
                sudoku[i][j] = notes[i][j];
                updateNotes(sudoku, notes, j, i, sudoku[i][j]);
            }
        }
    }

    return;
}

void findDoubles(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int indecies, tempNote, count;
    bool finished;
    for (int i = 1; i < 9; i++) {
        for (int j = i + 1; j <= 9; j++) {
            for (int y = 0; y < 9; y++) {
                indecies = 0;
                finished = true;
                for (int x = 1; x <= 9; x++) {
                    tempNote = notes[y][x - 1];
                    count = 0;

                    while (tempNote != 0) {
                        if (tempNote % 10 == i || tempNote % 10 == j) {
                            count++;
                        }

                        tempNote /= 10;
                    }

                    if (count == 2) {
                        indecies *= 10;
                        indecies += x;
                    }
                    else if (count == 1) {
                        finished = false;
                        break;
                    }
                }

                if (indecies > 10 && indecies < 100 && finished) {
                    int indexes[4] = {y, indecies % 10 - 1, y, indecies / 10 - 1};
                    notes[indexes[0]][indexes[1]] = i * 10 + j;
                    notes[indexes[2]][indexes[3]] = i * 10 + j;
                    removeRowNotes(notes, i * 10 + j, indexes);
                }
            }

            for (int y = 0; y < 9; y++) {
                indecies = 0;
                finished = true;
                for (int x = 1; x <= 9; x++) {
                    tempNote = notes[x - 1][y];
                    count = 0;


                    while (tempNote != 0) {
                        if (tempNote % 10 == i || tempNote % 10 == j) {
                            count++;
                        }

                        tempNote /= 10;
                    }

                    if (count == 2) {
                        indecies *= 10;
                        indecies += x;
                    }
                    else if (count == 1) {
                        finished = false;
                        break;
                    }
                }

                if (indecies > 10 && indecies < 100 && finished) {
                    int indexes[4] = {indecies % 10 - 1, y, indecies / 10 - 1, y};
                    notes[indexes[0]][indexes[1]] = i * 10 + j;
                    notes[indexes[2]][indexes[3]] = i * 10 + j;
                    removeColNotes(notes, i * 10 + j, indexes);
                }
            }

            for (int y = 0; y < 9; y++) {
                indecies = 0;
                finished = true;
                for (int x = 1; x <= 9; x++) {
                    int row = (y / 3) * 3 + ((x - 1) / 3);
                    int col = (y % 3) * 3 + ((x - 1) % 3);
                    tempNote = notes[row][col];
                    count = 0;

                    while (tempNote != 0) {
                        if (tempNote % 10 == i || tempNote % 10 == j) {
                            count++;
                        }

                        tempNote /= 10;
                    }

                    if (count == 2) {
                        indecies *= 10;
                        indecies += x;
                    }
                    else if (count == 1) {
                        finished = false;
                        break;
                    }
                }

                if (indecies > 10 && indecies < 100 && finished) {
                    int indexes[4] = {(y / 3) * 3 + (((indecies % 10) - 1) / 3), (y % 3) * 3 + (((indecies % 10) - 1) % 3), (y / 3) * 3 + (((indecies / 10) - 1) / 3), (y % 3) * 3 + (((indecies / 10) - 1) % 3)};
                    notes[indexes[0]][indexes[1]] = i * 10 + j;
                    notes[indexes[2]][indexes[3]] = i * 10 + j;
                    removeBoxNotes(notes, i * 10 + j, indexes);
                }
            }
        }
    }

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (notes[i][j] > 0 && notes[i][j] < 10) {
                sudoku[i][j] = notes[i][j];
                updateNotes(sudoku, notes, j, i, sudoku[i][j]);
            }
        }
    }

    return;
}

void findSwordfish(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int tempNote, countI, countJ, countK, iLocs, jLocs, kLocs, tempILocs, tempJLocs, tempKLocs, locs[9], tempLoc, indecies[6];
    for (int num = 1; num <= 9; num++) {
        for (int i = 0; i < 7; i ++) {
            countI = 0;
            iLocs = 0;
            for (int x = 0; x < 9; x++) {
                tempNote = notes[i][x];

                while (tempNote != 0) {
                    if (tempNote % 10 == num) {
                        countI++;
                        iLocs *= 10;
                        iLocs += x + 1;
                        break;
                    }

                    tempNote /= 10;
                }
            }

            if (countI > 3 || countI < 1) {
                continue;
            }

            for (int j = i + 1; j < 8; j++) {
                countJ = 0;
                jLocs = 0;
                for (int y = 0; y < 9; y++) {
                    tempNote = notes[j][y];

                    while (tempNote != 0) {
                        if (tempNote % 10 == num) {
                            jLocs *= 10;
                            jLocs += y + 1;
                            countJ++;
                            break;
                        }

                        tempNote /= 10;
                    }
                }

                if (countJ > 3 || countJ < 1) {
                    continue;
                }

                for (int k = j + 1; k < 9; k++) {
                    countK = 0;
                    kLocs = 0;
                    for (int z = 0; z < 9; z++) {
                        tempNote = notes[k][z];

                        while (tempNote != 0) {
                            if (tempNote % 10 == num) {
                                kLocs *= 10;
                                kLocs += z + 1;
                                countK++;
                                break;
                            }

                            tempNote /= 10;
                        }
                    }

                    if (countK > 3 || countK < 1) {
                        continue;
                    }

                    for (int w = 0; w < 9; w++) {
                        locs[w] = 0;
                    }
                    tempLoc = 0;
                    tempILocs = iLocs;
                    tempJLocs = jLocs;
                    tempKLocs = kLocs;

                    for (int a = 8; a >= 0; a--) {
                        if (tempKLocs != 0) {
                            if (tempKLocs % 10 != locs[0] && tempKLocs % 10 != locs[1] && tempKLocs % 10 != locs[2] && tempKLocs % 10 != locs[3] && tempKLocs % 10 != locs[4] && tempKLocs % 10 != locs[5] && tempKLocs % 10 != locs[6] && tempKLocs % 10 != locs[7] && tempKLocs % 10 != locs[8]) {
                                locs[a] = tempKLocs % 10;
                            }

                            tempKLocs /= 10;
                        }
                        else if (tempJLocs != 0) {
                            if (tempJLocs % 10 != locs[0] && tempJLocs % 10 != locs[1] && tempJLocs % 10 != locs[2] && tempJLocs % 10 != locs[3] && tempJLocs % 10 != locs[4] && tempJLocs % 10 != locs[5] && tempJLocs % 10 != locs[6] && tempJLocs % 10 != locs[7] && tempJLocs % 10 != locs[8]) {
                                locs[a] = tempJLocs % 10;
                            }

                            tempJLocs /= 10;
                        }
                        else if (tempILocs != 0) {
                            if (tempILocs % 10 != locs[0] && tempILocs % 10 != locs[1] && tempILocs % 10 != locs[2] && tempILocs % 10 != locs[3] && tempILocs % 10 != locs[4] && tempILocs % 10 != locs[5] && tempILocs % 10 != locs[6] && tempILocs % 10 != locs[7] && tempILocs % 10 != locs[8]) {
                                locs[a] = tempILocs % 10;
                            }

                            tempILocs /= 10;
                        }
                    }

                    for (int a = 0; a < 9; a++) {
                        tempLoc *= 10;
                        tempLoc += locs[a];
                    }

                    if (tempLoc < 1000) {
                        for (int a = 1; a <= 3; a++) {
                            indecies[0] = i;
                            indecies[1] = (tempLoc % (int)(pow(10, a)) / (int)(pow(10, a - 1))) - 1;
                            indecies[2] = j;
                            indecies[3] = ((tempLoc % (int)pow(10, a)) / (int)(pow(10, a - 1))) - 1;
                            indecies[4] = k;
                            indecies[5] = (tempLoc % (int)(pow(10, a)) / (int)(pow(10, a - 1))) - 1;

                            removeColNotes(notes, num,  indecies);
                        }
                    }
                }
            }
        }
    }

    for (int num = 1; num <= 9; num++) {
        for (int i = 0; i < 7; i ++) {
            countI = 0;
            iLocs = 0;
            for (int x = 0; x < 9; x++) {
                tempNote = notes[x][i];

                while (tempNote != 0) {
                    if (tempNote % 10 == num) {
                        countI++;
                        iLocs *= 10;
                        iLocs += x + 1;
                        break;
                    }

                    tempNote /= 10;
                }
            }

            if (countI > 3 || countI < 1) {
                continue;
            }

            for (int j = i + 1; j < 8; j++) {
                countJ = 0;
                jLocs = 0;
                for (int y = 0; y < 9; y++) {
                    tempNote = notes[y][j];

                    while (tempNote != 0) {
                        if (tempNote % 10 == num) {
                            jLocs *= 10;
                            jLocs += y + 1;
                            countJ++;
                            break;
                        }

                        tempNote /= 10;
                    }
                }

                if (countJ > 3 || countJ < 1) {
                    continue;
                }

                for (int k = j + 1; k < 9; k++) {
                    countK = 0;
                    kLocs = 0;
                    for (int z = 0; z < 9; z++) {
                        tempNote = notes[z][k];

                        while (tempNote != 0) {
                            if (tempNote % 10 == num) {
                                kLocs *= 10;
                                kLocs += z + 1;
                                countK++;
                                break;
                            }

                            tempNote /= 10;
                        }
                    }

                    if (countK > 3 || countK < 1) {
                        continue;
                    }

                    for (int w = 0; w < 9; w++) {
                        locs[w] = 0;
                    }
                    tempLoc = 0;
                    tempILocs = iLocs;
                    tempJLocs = jLocs;
                    tempKLocs = kLocs;

                    for (int a = 8; a >= 0; a--) {
                        if (tempKLocs != 0) {
                            if (tempKLocs % 10 != locs[0] && tempKLocs % 10 != locs[1] && tempKLocs % 10 != locs[2] && tempKLocs % 10 != locs[3] && tempKLocs % 10 != locs[4] && tempKLocs % 10 != locs[5] && tempKLocs % 10 != locs[6] && tempKLocs % 10 != locs[7] && tempKLocs % 10 != locs[8]) {
                                locs[a] = tempKLocs % 10;
                            }

                            tempKLocs /= 10;
                        }
                        else if (tempJLocs != 0) {
                            if (tempJLocs % 10 != locs[0] && tempJLocs % 10 != locs[1] && tempJLocs % 10 != locs[2] && tempJLocs % 10 != locs[3] && tempJLocs % 10 != locs[4] && tempJLocs % 10 != locs[5] && tempJLocs % 10 != locs[6] && tempJLocs % 10 != locs[7] && tempJLocs % 10 != locs[8]) {
                                locs[a] = tempJLocs % 10;
                            }

                            tempJLocs /= 10;
                        }
                        else if (tempILocs != 0) {
                            if (tempILocs % 10 != locs[0] && tempILocs % 10 != locs[1] && tempILocs % 10 != locs[2] && tempILocs % 10 != locs[3] && tempILocs % 10 != locs[4] && tempILocs % 10 != locs[5] && tempILocs % 10 != locs[6] && tempILocs % 10 != locs[7] && tempILocs % 10 != locs[8]) {
                                locs[a] = tempILocs % 10;
                            }

                            tempILocs /= 10;
                        }
                    }

                    for (int a = 0; a < 9; a++) {
                        tempLoc *= 10;
                        tempLoc += locs[a];
                    }

                    if (tempLoc < 1000) {
                        for (int a = 1; a <= 3; a++) {
                            indecies[0] = (tempLoc % (int)(pow(10, a)) / (int)(pow(10, a - 1))) - 1;
                            indecies[1] = i;
                            indecies[2] = (tempLoc % (int)(pow(10, a)) / (int)(pow(10, a - 1))) - 1;
                            indecies[3] = j;
                            indecies[4] = ((tempLoc % (int)pow(10, a)) / (int)(pow(10, a - 1))) - 1;
                            indecies[5] = k;

                            removeRowNotes(notes, num,  indecies);
                        }
                    }
                }
            }
        }
    }

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (notes[i][j] > 0 && notes[i][j] < 10) {
                sudoku[i][j] = notes[i][j];
                updateNotes(sudoku, notes, j, i, sudoku[i][j]);
            }
        }
    }

    return;
}

void chainCells(int sudoku[9][9], int notes[9][9]) {
    if (checkSolved(sudoku)) {
        return;
    }

    int sudokuCopy[9][9], notesCopy[9][9], tempVal;

    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            tempVal = notes[i][j];
            if (tempVal < 100 && tempVal > 10) {
                copySudoku(sudoku, sudokuCopy);
                copySudoku(notes, notesCopy);
                sudokuCopy[i][j] = tempVal % 10;
                updateNotes(sudokuCopy, notesCopy, j, i, tempVal % 10);
                solve(sudokuCopy, notesCopy, false);

                if (checkSolved(sudokuCopy)) {
                    copySudoku(sudokuCopy, sudoku);
                    copySudoku(notesCopy, notes);
                    return;
                }
                else {
                    sudoku[i][j] = tempVal / 10;
                    updateNotes(sudoku, notes, j, i, tempVal / 10);
                    return;
                }
            }
        }
    }

    return;
}

void solve(int sudoku[9][9], int notes[9][9], bool print) {
    int origSudoku[9][9], origNotes[9][9];
    char inp;

    fillNotes(sudoku, notes);

    do {
        copySudoku(sudoku, origSudoku);
        copySudoku(notes, origNotes);

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            fillSingles(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            digitConstraints(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            noteConstraints(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            noteRestrictions(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            findDoubles(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            findSwordfish(sudoku, notes);
        }

        if (!(compare(origSudoku, sudoku) || compare(origNotes, notes))) {
            printf("Chain used.\n");
            chainCells(sudoku, notes);
        }

    } while (compare(origSudoku, sudoku) || compare(origNotes, notes));

    if (print) {
        if (checkSolved(sudoku)) {
            printf("Solved Puzzle:\n\n");
            printSudoku(sudoku);
        }
        else {
            printNotes(notes);
            printSudoku(sudoku);
            printf("Sudoku could not be solved. Show all possible solutions? ");
            inp = getchar();
            fflush(stdin);

            if (inp == 89 || inp == 121) {
                solveRecurs(sudoku);
            }
        }
    }

    return;
}

void solveRecurs(int sudoku[9][9]) {
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            if (sudoku[i][j] == 0) {
                for (int num = 1; num <= 9; num++) {
                    if (checkRow(sudoku, i + 1, num) && checkCol(sudoku, j + 1, num) && checkBox(sudoku, 3 * (i / 3) + (j / 3) + 1, num)) {
                        sudoku[i][j] = num;
                        solveRecurs(sudoku);
                        sudoku[i][j] = 0;
                    }
                }

                return;
            }
        }
    }

    printf("Solution:\n");
    printSudoku(sudoku);

    return;
}

int main(void){
    int sudoku[9][9], notes[9][9];
    char inp;

    sudokuInp(sudoku);
/*
    int sudoku[9][9] =  {
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0},
        {0, 0, 0, 0, 0, 0, 0, 0, 0}
    };
*/
    for (int i = 0; i < 9; i++) {
        for (int j = 0; j < 9; j++) {
            notes[i][j] = 0;
        }
    }


    if (checkSolvable(sudoku)) {
        printf("Initial Puzzle:\n\n");
        printSudoku(sudoku);

        solve(sudoku, notes, true);
    }
    else {
        printf("Sudoku is not solvable. Show all possible solutions? ");
        inp = getchar();
        fflush(stdin);

        if (inp == 89 || inp == 121) {
            solveRecurs(sudoku);
        }
    }

    //solveRecurs(sudoku);
    return 0;
}
