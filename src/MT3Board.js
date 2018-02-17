import $ from 'jquery';

/**
 * Constructor for board object
 */
function TTTBoard() {
  var board = [
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
    var retval = null;
    if (ri >= 0 && ri < board.length) {
      retval = board[ri];
    }
    return retval;
  };

  // get a board cell by row, column index
  this.getCell = function(ri, ci) {
    var retval = null;
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

TTTBoard.prototype = {
  buildBoard: buildBoard,      // create the DOM for a mini board
  updateBoard: updateBoard,    // update a board DOM with current state
  findWin: findWin,            // check for 3-in-a-row
  setWon: setWon               // set the board DOM as won by a player
};

function buildBoard(mbRow, mbCol) {
  var element, ri, $rowDiv, ci;

  /* Create a .board div, add unique classes and metaboard data
   *  and store it in the current instance element property */
  element = $('<div>').addClass('board board-' + mbRow + '-' + mbCol)
    .data('mbRow', mbRow)
    .data('mbCol', mbCol);

  /* For the board matrix, first build a 'row' DIV,
   *  setting a data-row property and row classes;
   *  then, for each 'cell', append a SPAN and set
   *  data-col property and classes.  */
  for (ri = 0; ri < 3; ri++) {
    $rowDiv = $('<div>').data('row', ri)
      .addClass('row row-' + ri);
    for (ci = 0; ci < 3; ci++) {
      $('<span>').data('col', ci)
        .addClass('col col-' + ci)
        .appendTo($rowDiv);
    }
    element.append($rowDiv);
  }

  this.element(element);

  return this;
}


function updateBoard() {
  var ri, ci, mark;

  /* Step through the board matrix, and
   *  check the stored value in each cell -
   *  if it's an X or O, mark it: set the text
   *  of the cell, and set it as a class */
  for (ri = 0; ri < 3; ri++) {
    for (ci = 0; ci < 3; ci++) {
      mark = /(X|O)/.test(this.getCell(ri, ci)) ? this.getCell(ri, ci) : '';
      $(this.element()).find('.row-' + ri + ' .col-' + ci)
        .removeClass('X O')
        .text(mark)
        .addClass(mark);
    }
  }
  return this;
}


function findWin() {
  var winFound, testVal,
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

function setWon(winner) {
  this.element().addClass('won' + ' ' + winner)
    .text(winner);
  return this;
}


export default TTTBoard;
