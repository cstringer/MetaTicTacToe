/**
 * Constructor for board object
 */
function BoardData() {
    let board = [
            /* 3x3 matrix to hold either
             *  a meta or mini board */
            [null,null,null],
            [null,null,null],
            [null,null,null]
        ],

        // jQuery element for board
        element = null;

    // get a board row by index
    this.getRow = function(ri) {
        let retval = null;
        if (ri >= 0 && ri < board.length) {
            retval = board[ri];
        }
        return retval;
    };

    // get a board cell by row, column index
    this.getCell = function(ri, ci) {
        let retval = null;
        if ((ri >= 0 && ri < board.length) &&
            (ci >= 0 && ci < board[ri].length)) {
            retval = board[ri][ci];
        }
        return retval;
    };

    // set a board cell value by row, column index
    this.setCell = function(ri, ci, val) {
        if ((ri >= 0 && ri < board.length) &&
            (ci >= 0 && ci < board[ri].length)) {
            board[ri][ci] = val;
        }
        return this;
    };

    // get/set the jQuery element
    this.element = function(el) {
        if (arguments.length) { element = el; }
        return element;
    };
}

BoardData.prototype = {
    findWin, // check for 3-in-a-row
    isCats    // return true if "cat game": filled board w/ no winner
};

export default BoardData;


/**
 * Return the winner of the board, or false if it's not won
 * @return {string|boolean}
 */
function findWin() {
    let winFound, testVal,
        rowIdx, row,
        colIdx, col;

    winFound = false;

    // if all items in a row have equal nonnull values, it's a win
    for (rowIdx = 0; rowIdx < 3; rowIdx++) {
        row = this.getRow(rowIdx);
        testVal = row[0];
        winFound = (testVal !== null) &&
            (testVal === row[1]) &&
            (testVal === row[2]);
        if (winFound) {
            return testVal;
        }
    }

    // if all items in a column have equal nonnull values, it's a win
    for (colIdx = 0; colIdx < 3; colIdx++) {
        testVal = this.getCell(0, colIdx);
        winFound = (testVal !== null) &&
            (testVal === this.getCell(1, colIdx)) &&
            (testVal === this.getCell(2, colIdx));
        if (winFound) {
            return testVal;
        }
    }

    // if either diagonal has equal nonnull values, it's a win
    testVal = this.getCell(0, 0);
    winFound = (testVal !== null) &&
        (testVal === this.getCell(1, 1)) &&
        (testVal === this.getCell(2, 2));
    if (winFound) {
        return testVal;
    }

    testVal = this.getCell(0, 2);
    winFound = (testVal !== null)  &&
        (testVal === this.getCell(1, 1)) &&
        (testVal === this.getCell(2, 0));             

    return winFound ? testVal : false;
}

function isCats() {
    let isFilled = true,
        isWon = this.findWin(),
        ri, ci;

    for (ri = 0; ri < 3; ri++) {
        for (ci = 0; ci < 3; ci++) {
            if (this.getCell(ri, ci) === null) {
                isFilled = false;
                break;
            }
        }
        if (isFilled) {
            break;
        }
    }

    return (isFilled && !isWon);
}

