(function($) {

    /* Global config */
    var gConfig = {
            // game start fade in time (milliseconds)
            fadeInTime:     500,

            // CSS selectors
            sels: {
                board:      '.board',
                metaBoard:  '#meta-board',
                startOver:  '#start-over',
                turn:       '#turn',
                turnPlayer: '#turn-player',
                undoMove:   '#undo-move',
                zoomIn:     '#zoom-in',
                zoomOut:    '#zoom-out'
            },

            // zoom factors and translate offsets
            zoom: [
                { scale: '1.5',  offset: '17%' },
                { scale: '1.25', offset: '10%' },
                { scale: '1.0',  offset: '0px' },
                { scale: '0.75', offset: '-17%' },
                { scale: '0.5',  offset: '-50%' }
            ],
            // default zoom index
            zoomDef: 2
        },

        // decorated TTTBoard object for meta board
        metaBoard;    

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
            if (el) { element = el; }
            return element;
        };
    }

    TTTBoard.prototype = {
        buildBoard: buildBoard,      // create the DOM for a mini board
        updateBoard: updateBoard,    // update a board DOM with current state
        findWin: findWin,            // check for 3-in-a-row
        setWon: setWon               // set the board DOM as won by a player
    };

    $(document).ready(function() {

        init();

        // bind event handlers
        $(gConfig.sels.metaBoard).on('click', '.col', handlePlayerTurn);
        $(gConfig.sels.startOver).on('click', handleStartOver);
        $(gConfig.sels.undoMove).on('click', handleUndoMove);
        $(gConfig.sels.zoomIn).on('click', handleZoom);
        $(gConfig.sels.zoomOut).on('click', handleZoom);

        $(window).on('beforeunload', function() {
            return 'Are you sure you want to leave?';
        });
    });

    function init() {
        var ri, ci, tttBoard, $mbRow;

        /* Create an object to hold the meta board,
         *  one for the win state of the mini boards,
         *  set initial values, and prepare its DOM element */
        metaBoard = new TTTBoard();
        metaBoard.wins = new TTTBoard();
        metaBoard.ended = false;
        metaBoard.lastBoard = null;
        metaBoard.lastRowIdx = null;
        metaBoard.lastColIdx = null;
        metaBoard.turn = 1;
        metaBoard.zoom = gConfig.zoomDef;
        metaBoard.element($(gConfig.sels.metaBoard)).empty();

        /* Create new DIVs and board objects for each mini board,
         *  and add them to the meta board element */
        for (ri = 0; ri < 3; ri++) {
            $mbRow = $('<div>').addClass('mb-row');
            for (ci = 0; ci < 3; ci++) {
                tttBoard = new TTTBoard();
                tttBoard.buildBoard(ri, ci)
                        .element()
                        .appendTo($mbRow);
                metaBoard.setCell(ri, ci, tttBoard);
            }
            metaBoard.element().append($mbRow);
        }

        /* Show the meta board and get the party started (!) */
        metaBoard.element()
                 .hide()
                 .fadeIn(gConfig.fadeInTime);
        updateControls();
    }


    function handlePlayerTurn() {
        var colIdx, rowIdx, mbRow, mbCol,
            tttBoard, miniWinner, mbWon;

        // don't handle clicks when the game ends
        if (metaBoard.ended) { return; }

        // get row and column indexes
        colIdx = $(this).data('col');
        rowIdx = $(this).parent().data('row');
        mbRow = $(this).closest(gConfig.sels.board).data('mbRow');
        mbCol = $(this).closest(gConfig.sels.board).data('mbCol');

        // get the TTTBoard object for the mini board,
        // return if there's no board, or it's already set
        tttBoard = metaBoard.getCell(mbRow, mbCol);
        if (!tttBoard || tttBoard.getCell(rowIdx, colIdx) !== null) { return; }

        // put an X or O in the mini board cell, depending on whose turn it is
        tttBoard.setCell(rowIdx, colIdx, getPlayerForTurn())
                .updateBoard();

        // determine if mini board is won
        miniWinner = tttBoard.findWin();
        if (miniWinner) {
            tttBoard.setWon(miniWinner);
            metaBoard.wins.setCell(mbRow, mbCol, miniWinner);
        }

        // determine if meta board is won
        mbWon = metaBoard.wins.findWin();
        if (mbWon) {
            return gameOver(mbWon);
        }            

        // update meta board and controls
        metaBoard.lastBoard = tttBoard;
        metaBoard.lastRowIdx = rowIdx;
        metaBoard.lastColIdx = colIdx;
        updateMetaBoard();
        updateControls();
    }

    function handleStartOver() {
        if (window.confirm('Start new game?')) {
            init();
        }
    }

    function handleUndoMove() {
        var ri = metaBoard.lastRowIdx,
            ci = metaBoard.lastColIdx;
        //TODO: undo last move!?!
        metaBoard.turn--;
        metaBoard.lastBoard.setCell(ri, ci, null);
        metaBoard.lastBoard.updateBoard();
        updateMetaBoard();
        //TODO: must reset board to previous state!
        updateControls();
    }

    function handleZoom() {
        var mode, removeMode, zIdx, scale;

        zIdx = metaBoard.zoom;
        mode = $(this).attr('id');
        if (mode === 'zoom-in') {
            zIdx--;
        } else if (mode === 'zoom-out') {
            zIdx++;
        }
        zIdx = Math.max(zIdx, 0);
        zIdx = Math.min(zIdx, gConfig.zoom.length - 1);
        metaBoard.zoom = zIdx;

        scale = gConfig.zoom[zIdx].scale;
        metaBoard.element().css({
            transform: 'scale(' + scale + ') ' +
                       'translate(0px, ' + gConfig.zoom[zIdx].offset + ')'
        });
    }


    function getPlayerForTurn() {
        return (metaBoard.turn % 2) ? 'X' : 'O';
    }

    function updateControls() {
        var player = getPlayerForTurn();
        $(gConfig.sels.turn).removeClass().addClass(player);
        $(gConfig.sels.turnPlayer).text(player);
        $(gConfig.sels.undoMove).attr('disabled', (metaBoard.turn === 1));
        $(gConfig.sels.startOver).attr('disabled', (metaBoard.turn === 1));
    }

    function updateMetaBoard() {
        var nextBoard = metaBoard.lastRowIdx + '-' + metaBoard.lastColIdx;
        if (!$('.board-' + nextBoard).hasClass('won')) {
            // only enable the next clickable mini board
            $(gConfig.sels.metaBoard).find(gConfig.sels.board).removeClass('inactive')
                                     .not('.board-'  + nextBoard).addClass('inactive');
        } else {
            // next clickable board is won, enable all
            $(gConfig.sels.metaBoard).find(gConfig.sels.board).removeClass('inactive');
        }
        metaBoard.turn++;
    }

    function gameOver(winner) {
        // set game ended flag
        metaBoard.ended = true;

        // set classes on won boards
        $(metaBoard.element()).find(gConfig.sels.board).removeClass('inactive')
                              .not('.won.' + winner).addClass('inactive');

        // show a win message
        alert('And the winner is... ' + winner + '!!!');

        // disable undo button
        $(gConfig.sels.undoMove).prop('disabled', true);
    }


    /*==== TTTBoard ====*/

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

})(window.jQuery);
