import $ from 'jquery';
import _ from 'underscore';

import gConfig from './MT3Config';
import BoardData from './MT3BoardData';
import BoardDom from './MT3BoardDom';

import './style.css';

import boardHtml from './board.html';
import controlsHtml from './controls.html';


let metaBoard = {};

$(document).ready(init);

function init() {
    var ri, ci, miniBoard, $mbRow, mbEl;

    $('body').empty();
    $('body').append(controlsHtml);
    $('body').append(boardHtml);

    /* Create an object to hold the meta board,
     *  one for the win state of the mini boards,
     *  extend some extra values, and prepare a DOM element
     */
    metaBoard = new BoardData();
    _.extend(metaBoard, {
        ended : false,
        lastBoard : null,
        lastColIdx : null,
        lastRowIdx : null,
        turn : 1,
        wins : new BoardData(),
        zoom : gConfig.zoomDef
    });
    metaBoard.element($(gConfig.sels.metaBoard)).empty();

    /* Create new DIVs and board objects for each mini board,
     *  and add them to the meta board element */
    for (ri = 0; ri < 3; ri++) {
        $mbRow = $('<div>').addClass('mb-row');
        for (ci = 0; ci < 3; ci++) {
            miniBoard = new BoardData();
            mbEl = BoardDom.buildBoardDom(ri, ci);
            miniBoard.element(mbEl).appendTo($mbRow);
            metaBoard.setCell(ri, ci, miniBoard);
        }
        metaBoard.element().append($mbRow);
    }

    // bind event handlers
    bindEvents();

    /* Show the meta board and get the party started (!) */
    metaBoard.element()
             .hide()
             .fadeIn(gConfig.fadeInTime);

    updateControls();
}

function bindEvents() {
    metaBoard.element().on('click', '.col', handlePlayerTurn);
    $(gConfig.sels.startOver).on('click', handleStartOver);
    $(gConfig.sels.undoMove).on('click', handleUndoMove);
    $(gConfig.sels.zoomIn).on('click', handleZoom);
    $(gConfig.sels.zoomOut).on('click', handleZoom);

    $(window).on('beforeunload', function() {
        return 'Are you sure you want to leave?';
    });
}

function handlePlayerTurn() {
    var colIdx, rowIdx, mbRow, mbCol,
        miniBoard, miniWinner, mbWon;

    // don't handle clicks when the game ends
    if (metaBoard.ended) { return; }

    // get row and column indexes
    colIdx = $(this).data('col');
    rowIdx = $(this).parent().data('row');
    mbRow = $(this).closest(gConfig.sels.board).data('mbRow');
    mbCol = $(this).closest(gConfig.sels.board).data('mbCol');

    // get the Board object for the mini board,
    // return if there's no board, or it's already set
    miniBoard = metaBoard.getCell(mbRow, mbCol);
    if (!miniBoard || miniBoard.getCell(rowIdx, colIdx) !== null) { return; }

    // put an X or O in the mini board cell, depending on whose turn it is
    miniBoard.setCell(rowIdx, colIdx, getPlayerForTurn());
    BoardDom.updateDomForBoard(miniBoard);

    // determine if mini board is won
    miniWinner = miniBoard.findWin();
    if (miniWinner) {
        BoardDom.setWonForElement(miniBoard.element(), miniWinner);
        metaBoard.wins.setCell(mbRow, mbCol, miniWinner);
    } else if (miniBoard.isCats()) {
        BoardDom.setCatsForElement(miniBoard);
    }

    // determine if meta board is won
    mbWon = metaBoard.wins.findWin();
    if (mbWon) {
        return gameOver(mbWon);
    }            

    // update meta board and controls
    metaBoard.lastBoard = miniBoard;
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
    BoardDom.updateDomForBoard(metaBoard.lastBoard);
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
    var nextBoard = metaBoard.lastRowIdx + '-' + metaBoard.lastColIdx,
        $nextBoard = $('.board-' + nextBoard);
    if (!$nextBoard.hasClass('won') &&
        !$nextBoard.hasClass('cats')) {
        // only enable the next clickable mini board
        $(gConfig.sels.metaBoard)
            .find(gConfig.sels.board).removeClass('inactive')
            .not($nextBoard).addClass('inactive');
    } else {
        // next clickable board is won, enable all
        $(gConfig.sels.metaBoard)
            .find(gConfig.sels.board).removeClass('inactive');
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

