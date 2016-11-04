(function($) {

function TTTBoard() {
	this.board = [
        [null,null,null],
        [null,null,null],
        [null,null,null]
	];
    this.element = null;
    this.metaWin = null;
}
TTTBoard.prototype = {
	buildBoard: buildBoard,
	updateBoard: updateBoard,
	findThreeInARow: findThreeInARow
};

$(document).ready(function() {
    var metaBoard;

    init();

    function init() {
        var ri, ci, tttBoard, $mbRow;

        metaBoard = new TTTBoard();
        metaBoard.ended = false;
        metaBoard.turn = 1;

        $('#meta-board').empty();
        for (ri = 0; ri < 3; ri++) {
            $mbRow = $('<div>').addClass('mb-row');
            for (ci = 0; ci < 3; ci++) {
                tttBoard = new TTTBoard();
                tttBoard.buildBoard(ri + '-' + ci);
                $mbRow.append(tttBoard.element);
                metaBoard.board[ri][ci] = tttBoard;
            }
            $('#meta-board').append($mbRow);
        }

        $('#meta-board').hide().fadeIn('slow');
    }

    $('#meta-board').on('click', '.col', function() {
        var colIdx, rowIdx, boardNum, bnMatch, tttBoard, winner;

        if (metaBoard.ended) { return; }

        colIdx = $(this).data('col');
        rowIdx = $(this).parent().data('row');

        boardNum = $(this).closest('.board').data('boardNum');
        bnMatch = boardNum.match(/^(\d)\-(\d)$/);
        if (!bnMatch.length) { return; }

        tttBoard = metaBoard.board[bnMatch[1]][bnMatch[2]];
        if (!tttBoard || tttBoard.metaWin !== null) { return; }


        tttBoard.board[rowIdx][colIdx] = (metaBoard.turn % 2) ? 'X' : 'O';
        tttBoard.updateBoard();

        metaBoard.turn++;
        metaBoard.nextBoardNum = rowIdx + '-' + colIdx;
        $('#meta-board').find('.board')
                            .removeClass('inactive')
                        .not('.board-' + metaBoard.nextBoardNum)
                            .addClass('inactive');

        winner = tttBoard.findThreeInARow();
        if (winner) {
            tttBoard.metaWin = winner;
            tttBoard.element.addClass('won' + ' ' + winner)
                            .text(winner);
        }
    });

    $('#start-over').on('click', function() {
        init();
    });
});

function buildBoard(boardNum) {
	var ri, $rowDiv, ci;

    this.element  = $('<div>').addClass('board board-' + boardNum)
                       .data('boardNum', boardNum);

    for (ri = 0; ri < 3; ri++) {
		$rowDiv = $('<div>').data('row', ri)
                            .addClass('row row-' + ri);
    	for (ci = 0; ci < 3; ci++) {
        	$('<span>').data('col', ci)
                       .addClass('col col-' + ci)
                       .appendTo($rowDiv);
        }
    	this.element.append($rowDiv);
    }

    return this.element;
}

function updateBoard() {
	var ri, ci, mark;
    for (ri = 0; ri < 3; ri++) {
    	for (ci = 0; ci < 3; ci++) {
        	mark = /(X|O)/.test(this.board[ri][ci]) ? this.board[ri][ci] : '';
            $(this.element).find('.row-' + ri + ' .col-' + ci)
                           .text(mark)
                           .addClass(mark);
        }
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
        if (winFound) {
            return row[0];
        }
    }

    // 2. if all items in a column have equal nonnull values, it's a win
    for (colIdx = 0; colIdx < 3; colIdx++) {
        winFound = (this.board[0][colIdx] !== null) &&
                   (this.board[0][colIdx] === this.board[1][colIdx]) &&
                   (this.board[0][colIdx] === this.board[2][colIdx]);
        if (winFound) {
            return this.board[0][colIdx];
        }
    }

    // 3. if either diagonal has equal nonnull values, it's a win
    winFound = (this.board[0][0] !== null) &&
               (this.board[0][0] === this.board[1][1]) &&
               (this.board[0][0] === this.board[2][2]);
    if (winFound) {
        return this.board[0][0];
    }

    winFound = (this.board[0][2] !== null)  &&
           (this.board[0][2] === this.board[1][1]) &&
           (this.board[0][2] === this.board[2][0]);             
    if (winFound) {
        return this.board[0][2];
    } else {
        return false;
    }

}

})(window.jQuery);
