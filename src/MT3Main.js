import $ from 'jquery';
import _ from 'underscore';

import gConfig from './MT3Config';
import BoardData from './MT3BoardData';
import BoardDom from './MT3BoardDom';
import Zoom from './MT3Zoom';

import './style.css';


let metaBoard = {};

$(document).ready(init);

function init() {
    let $metaEl, ri, ci, miniBoard;

    // Create DOM elements for meta/mini boards
    $metaEl = BoardDom.init();
    BoardDom.buildMetaBoard($metaEl);

    /* Create data object to hold the meta board
     *  and extend with some extra props */
    metaBoard = BoardData({
        element: $metaEl
    });
    _.extend(metaBoard, {
        ended : false,
        lastBoard : null,
        lastColIdx : null,
        lastRowIdx : null,
        turn : 1
    });

    // create data objects for mini boards
    for (ri = 0; ri < 3; ri++) {
        for (ci = 0; ci < 3; ci++) {
            miniBoard = BoardData({
                element: BoardDom.findMiniBoard($metaEl, ri, ci)
            });
            metaBoard.setCell(ri, ci, miniBoard);
        }
    }

    // bind event handlers
    bindEvents($metaEl);

    // enable Zoom module
    Zoom.init();
    Zoom.setMetaBoardEl($metaEl);
    Zoom.applyZoomToElement();

    // show the meta board and get the party started
    $metaEl.hide()
           .fadeIn(gConfig.fadeInTime);

    updateControls();
}

function bindEvents($metaEl) {
    $metaEl.on('click', '.col', handleBoardClick);
    $(gConfig.sels.startOver).on('click', handleStartOver);
    //$(gConfig.sels.undoMove).on('click', handleUndoMove);

    $(window).on('beforeunload', function() {
        return 'Are you sure you want to leave?';
    });
}

function handleBoardClick(event) {
    let target = _.result(event, 'target'),
        colIdx, rowIdx, mbRow, mbCol;

    if (!target) { return; }

    // don't handle clicks when the game ends
    if (metaBoard.ended) { return; }

    // get row and column indexes
    mbRow = $(target).closest(gConfig.sels.board).data('mbRow');
    mbCol = $(target).closest(gConfig.sels.board).data('mbCol');
    rowIdx = $(target).data('row');
    colIdx = $(target).data('col');

    handlePlayerTurn(mbRow, mbCol, rowIdx, colIdx);
}

function handlePlayerTurn(mbRow, mbCol, rowIdx, colIdx) {
    let player, miniBoard, miniWinner, metaWinner;

    // get the Board object for the mini board,
    // return if there's no board, or it's already set
    miniBoard = metaBoard.getCell(mbRow, mbCol);
    if (!miniBoard || miniBoard.getCell(rowIdx, colIdx) !== null) { return; }

    // put an X or O in the mini board cell, depending on whose turn it is
    miniBoard.setCell(rowIdx, colIdx, getPlayerForTurn());
    BoardDom.updateMiniBoard(miniBoard);

    // determine if mini board is won
    miniWinner = miniBoard.findWin();
    if (miniWinner) {
        BoardDom.setWonForElement(miniBoard.getElement(), miniWinner);
    } else if (miniBoard.isCats()) {
        BoardDom.setCatsForElement(miniBoard);
    }

    // determine if meta board is won
    metaWinner = metaBoard.findWin();
    if (!metaWinner) {
        // update meta board and controls
        BoardDom.updateMetaBoard(rowIdx, colIdx);
        metaBoard.turn++;
        updateControls(metaBoard.turn);
    } else {
        // meta board won, game over
        gameOver(metaWinner);
    }
}

function handleStartOver() {
    if (window.confirm('Start new game?')) {
        init();
    }
}

function handleUndoMove() {
    //TODO: undo last move
    //metaBoard.turn--;
    //updateMetaBoard();
    //updateControls();
}

function getPlayerForTurn(turn) {
    turn = turn || metaBoard.turn;
    return (turn % 2) ? 'X' : 'O';
}

function updateControls(turn) {
    let player = getPlayerForTurn(turn);

    $(gConfig.sels.turn).removeClass()
                        .addClass(player);
    $(gConfig.sels.turnPlayer).text(player);

    $(gConfig.sels.undoMove).attr('disabled', (turn === 1));
    $(gConfig.sels.startOver).attr('disabled', (turn === 1));
}

function gameOver(winner) {
    // set game ended flag
    metaBoard.ended = true;

    // set classes on won boards
    BoardDom.setGameOver(metaBoard.getElement(), winner);

    // show a win message
    alert(_.template(gConfig.winMsg)({ winner }));

    // disable undo button
    //$(gConfig.sels.undoMove).prop('disabled', true);
}
