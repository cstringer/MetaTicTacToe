import _ from 'underscore';

/**
 * Factory for board data objects
 */
function BoardData(options) {
    let board = [
            /* 3x3 matrix to hold either
             *  a meta or mini board */
            [null,null,null],
            [null,null,null],
            [null,null,null]
        ],

        // jQuery element for board
        element = _.result(options, 'element', null);

    return {
        // prop access
        getRow,
        getCell,
        setCell,
        getElement,
        setElement,

        // methods
        findWin,
        isCats
    };

    /**
     * Get a board row by index
     * @param {number} ri - row index
     * @return {array|null}
     */
    function getRow(ri) {
        let retval = null;
        if (ri >= 0 && ri < board.length) {
            retval = board[ri];
        }
        return retval;
    }

    /**
     * Get a board cell by row, column index
     * @param {number} ri - row index
     * @param {number} ci - column index
     * @return {string|null}
     */
    function getCell(ri, ci) {
        let retval = null;
        if ((ri >= 0 && ri < board.length) &&
            (ci >= 0 && ci < board[ri].length)) {
            retval = board[ri][ci];
        }
        return retval;
    }

    /**
     * Set a board cell by row, column index
     * @param {number} ri - row index
     * @param {number} ci - column index
     */
    function setCell(ri, ci, val) {
        if ((ri >= 0 && ri < board.length) &&
            (ci >= 0 && ci < board[ri].length)) {
            board[ri][ci] = val;
        }
    }

    /**
     * Get the jQuery element
     * @return {object}
     */
    function getElement() {
        return element;
    }

    /**
     * Set the jQuery element
     * @param {object}
     */
    function setElement(el) {
        element = el;
    }

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
            row = getRow(rowIdx);
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
            testVal = getCell(0, colIdx);
            winFound = (testVal !== null) &&
                (testVal === getCell(1, colIdx)) &&
                (testVal === getCell(2, colIdx));
            if (winFound) {
                return testVal;
            }
        }

        // if either diagonal has equal nonnull values, it's a win
        testVal = getCell(0, 0);
        winFound = (testVal !== null) &&
            (testVal === getCell(1, 1)) &&
            (testVal === getCell(2, 2));
        if (winFound) {
            return testVal;
        }

        testVal = getCell(0, 2);
        winFound = (testVal !== null)  &&
            (testVal === getCell(1, 1)) &&
            (testVal === getCell(2, 0));             

        return winFound ? testVal : false;
    }

    /**
     * Return true if board is filled, but not won
     * @return {boolean}
     */
    function isCats() {
        let isFilled = true,
            isWon = findWin(),
            ri, ci;

        for (ri = 0; ri < 3; ri++) {
            for (ci = 0; ci < 3; ci++) {
                if (getCell(ri, ci) === null) {
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

}

export default BoardData;
