(function($) {

	/* Global config */
    var gConfig = {
            sels: {
                metaBoard:  '#meta-board',
				startOver:  '#start-over',
				undoMove:   '#undo-move',
				turnPlayer: '#turn-player',
				zoomIn: 	'#zoom-in',
				zoomOut: 	'#zoom-out'
            },
			fadeInTime:	500
        },

        metaBoard;

    function TTTBoard() {
        this.board = [
            /* 3x3 matrix to hold either
             *  a meta or mini board */
            [null,null,null],
            [null,null,null],
            [null,null,null]
        ];
        this.element = null;   // jQuery element of associated DIV
    }
    TTTBoard.prototype = {
        buildBoard: buildBoard,
        updateBoard: updateBoard,
		getCell: getCell,
		setCell: setCell,
        findThreeInARow: findThreeInARow
    };

    $(document).ready(function() {

        init();

        function init() {
            var ri, ci, tttBoard, $mbRow;

            /* Create an object to hold the "board of boards",
			 *  set initial values and get its DOM element */
            metaBoard = new TTTBoard();
            metaBoard.wins = new TTTBoard();
            metaBoard.ended = false;
            metaBoard.turn = 1;
            metaBoard.element = $(gConfig.sels.metaBoard);
            metaBoard.element.empty();

            /* For the meta board, create new DIVs
             *  and board objects for each mini board */
            for (ri = 0; ri < 3; ri++) {
                $mbRow = $('<div>').addClass('mb-row');
                for (ci = 0; ci < 3; ci++) {
                    tttBoard = new TTTBoard();
                    tttBoard.buildBoard(ri + '-' + ci);
                    $mbRow.append(tttBoard.element);
                    metaBoard.setCell(ri, ci, tttBoard);
                }
                metaBoard.element.append($mbRow);
            }

			/* Show the board ang get the party started */
            metaBoard.element.hide().fadeIn(gConfig.fadeInTime);
            updateControls();
        }

        $(gConfig.sels.metaBoard).on('click', '.col', function() {
            var colIdx, rowIdx,
				boardNum, bnMatch, mbRow, mbCol,
				tttBoard, miniWinner, mbWon;

            // don't handle clicks when the game ends
            if (metaBoard.ended) { return; }

            // get the cell row and column indexes
            colIdx = $(this).data('col');
            rowIdx = $(this).parent().data('row');

            // get the clicked mini board number
            boardNum = $(this).closest('.board').data('boardNum');
            bnMatch = boardNum.match(/^(\d)\-(\d)$/);
            if (!bnMatch.length) { return; }
			mbRow = +bnMatch[1];
			mbCol = +bnMatch[2];

            // get the TTTBoard object for the mini board
            tttBoard = metaBoard.board[mbRow][mbCol];
            if (!tttBoard || tttBoard.board[rowIdx][colIdx] !== null) { return; }

            // put an X or O in the mini board cell, depending on whose turn it is
            tttBoard.setCell(rowIdx, colIdx, getPlayerForTurn());
            tttBoard.updateBoard();

            // determine if mini board is won
            miniWinner = tttBoard.findThreeInARow();
            if (miniWinner) {
                metaBoard.wins.setCell(mbRow, mbCol, miniWinner);
                tttBoard.element.addClass('won' + ' ' + miniWinner)
                                .text(miniWinner);
            }

            // determine if meta board is won
			mbWon = metaBoard.wins.findThreeInARow();
			if (mbWon) {
				metaBoard.ended = true;
				// set classes on won boards
				$(metaBoard.element).find('.board')
										.removeClass('inactive')
									.not('.won.' + mbWon)
										.addClass('inactive');
				// show a win message
				alert('And the winner is... ' + mbWon + '!!!');
				$(gConfig.sels.undoMove).prop('disabled', true);
				return;
			}			

            // enable the next clickable mini board
            metaBoard.nextBoardNum = rowIdx + '-' + colIdx;
            if (!$('.board-' + metaBoard.nextBoardNum).hasClass('won')) {
                $(gConfig.sels.metaBoard).find('.board')
                                             .removeClass('inactive')
                                         .not('.board-'  + metaBoard.nextBoardNum)
                                             .addClass('inactive');
            } else {
                $(gConfig.sels.metaBoard).find('.board').removeClass('inactive');
            }

			metaBoard.lastBoard = tttBoard;
			metaBoard.lastRowIdx = rowIdx;
			metaBoard.lastColIdx = colIdx;

            metaBoard.turn++;
            updateControls();
        });

        $(gConfig.sels.startOver).on('click', function() {
			if (window.confirm('Start new game?')) {
				init();
			}
        });

		//TODO: undo last move!?!
		$(gConfig.sels.undoMove).on('click', function() {
			var ri = metaBoard.lastRowIdx,
				ci = metaBoard.lastColIdx;
			metaBoard.turn--;
			metaBoard.lastBoard.setCell(ri, ci, null);
			metaBoard.lastBoard.updateBoard();
			//TODO: must reset board state!
			updateControls();
		});

		$(gConfig.sels.zoomIn).on('click', function() {
			setZoom('zoom-in');
		});
		$(gConfig.sels.zoomOut).on('click', function() {
			setZoom('zoom-out');
		});
		function setZoom(mode) {
			if (!/^zoom\-(in|out)$/.test(mode)) { return; }
			var removeMode = (mode === 'zoom-in') ? 'zoom-out' : 'zoom-in';
			if (metaBoard.element.hasClass(removeMode)) {
				metaBoard.element.removeClass(removeMode);
			} else {
				metaBoard.element.addClass(mode);
			}
		}

		$(window).on('beforeunload', function() {
			return 'Are you sure you want to leave?';
		});
    });

    function getPlayerForTurn() {
        return (metaBoard.turn % 2) ? 'X' : 'O';
    }

    function updateControls() {
        $(gConfig.sels.turnPlayer).text(getPlayerForTurn());
        $(gConfig.sels.undoMove).attr('disabled', (metaBoard.turn === 1));
        $(gConfig.sels.startOver).attr('disabled', (metaBoard.turn === 1));
    }


	/*==== TTTBoard ====*/

    function buildBoard(boardNum) {
        var ri, $rowDiv, ci;

        /* Create a .board div, add unique classes and boardNum data
         *  and store it in the current instance element property */
        this.element  = $('<div>').addClass('board board-' + boardNum)
                           .data('boardNum', boardNum);

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
            this.element.append($rowDiv);
        }

        return this.element;
    }

    function updateBoard() {
        var ri, ci, mark;
        
        /* Step through the board matrix, and
         *  check the stored value in each cell -
         *  if it's an X or O, mark it: set the text
         *  of the cell, and set it as a class */
        for (ri = 0; ri < 3; ri++) {
            for (ci = 0; ci < 3; ci++) {
                mark = /(X|O)/.test(this.board[ri][ci]) ? this.board[ri][ci] : '';
                $(this.element).find('.row-' + ri + ' .col-' + ci)
							   .removeClass('X O')
                               .text(mark)
                               .addClass(mark);
            }
        }
		return this;
    }

	function getCell(ri, ci) {
		var retval = null;
		if ((ri >= 0 && ri < this.board.length) &&
			(ci >= 0 && ci < this.board[ri].length)) {
			retval = this.board[ri][ci];
		}
		return retaval;
	}

	function setCell(ri, ci, mark) {
		if ((ri >= 0 && ri < this.board.length) &&
			(ci >= 0 && ci < this.board[ri].length)) {
			this.board[ri][ci] = mark;
		}
		return this;
	}

    function findThreeInARow() {
        var winFound,
            rowIdx, row,
            colIdx, col;

        winFound = false;

        // 1. if all items in row have equal nonnull values, it's a win
        for (rowIdx = 0; rowIdx < 3; rowIdx++) {
            row = this.board[rowIdx];
            winFound = (row[0] !== null) &&
					   (row[0] === row[1]) &&
					   (row[0] === row[2]);
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
