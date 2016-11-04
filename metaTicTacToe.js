(function($) {

function TTTBoard() {
	this.board = [
        [null,null,null],
        [null,null,null],
        [null,null,null]
	];
    this.turn = 1;
    this.ended = false;
}

TTTBoard.prototype = {
	updateBoard: updateBoard,
	findThreeInARow: findThreeInARow
};

$(document).ready(function() {
    var tttBoard;

    init();

    function init() {
        tttBoard = new TTTBoard();
        tttBoard.updateBoard();
        $('#start-over').hide();
    }

    $('#board').on('click', '.col', function() {
        if (tttBoard.ended) {
            return;
        }
        var colIdx, rowIdx;
        colIdx = $(this).data('col');
        rowIdx = $(this).parent().data('row');
        tttBoard.board[rowIdx][colIdx] = (tttBoard.turn % 2) ? 'X' : 'O';
        tttBoard.turn++;
        tttBoard.updateBoard();
        if (tttBoard.findThreeInARow()) {
            alert('WIN!');
            tttBoard.ended = true;
            $('#start-over').fadeIn();
        }
    });

    $('#start-over').on('click', function() {
        init();
    });
});

function updateBoard() {
	var $board, ri, $rowDiv, ci, $colSpan, mark;
    $board = $('#board').empty();
    for (ri = 0; ri < 3; ri++) {
		$rowDiv = $('<div>').data('row', ri)
                            .addClass('row row-' + ri);
    	for (ci = 0; ci < 3; ci++) {
        	mark = /(X|O)/.test(this.board[ri][ci]) ? this.board[ri][ci] : '';
        	$colSpan = $('<span>').data('col', ci)
                                  .addClass('col col-' + ci + ' ' + mark)
                                  .text(mark);
            $rowDiv.append($colSpan);
        }
    	$board.append($rowDiv);
    }
}

function findThreeInARow() {
    var winFound,
        rowIdx, row,
        colIdx, col;

    winFound = false;

    // 1. if all items in row have equal nonnull values, it's a win
    for (rowIdx = 0; rowIdx < 3; rowIdx++) {
        row = this.board[rowIdx];
        winFound = (row[0] !== null) && (row[0] === row[1]) && (row[0] === row[2]);
        if (winFound) { return true; }
    }

    // 2. if all items in a column have equal nonnull values, it's a win
    for (colIdx = 0; colIdx < 3; colIdx++) {
        winFound = (this.board[0][colIdx] !== null) &&
                   (this.board[0][colIdx] === this.board[1][colIdx]) &&
                   (this.board[0][colIdx] === this.board[2][colIdx]);
        if (winFound) { return true; }
    }

    // 3. if either diagonal has equal nonnull values, it's a win
    winFound = (this.board[0][0] !== null) &&
               (this.board[0][0] === this.board[1][1]) &&
               (this.board[0][0] === this.board[2][2]);
    if (winFound) { return true; }

    return (this.board[0][2] !== null)  &&
           (this.board[0][2] === this.board[1][1]) &&
           (this.board[0][2] === this.board[2][0]);             
}

})(window.jQuery);
