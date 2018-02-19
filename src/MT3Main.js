import _ from 'underscore';

import Board from './MT3Board';
import Dom from './MT3Dom';
import Zoom from './MT3Zoom';

export default {
    init,
    handleBoardClick,
    handleStartOver,
    doPlayerTurn,
    getPlayerForTurn,
    gameOver
};

// storage for meta board data
let metaBoard = null;
const metaProps = {
    ended: false,
    turn:  1
};

/** Game entry point */
function init() {
    metaBoard = createBoardData();

    Dom.init();
    Dom.hideMetaBoard();

    Zoom.init();

    Dom.updateControls();
    Dom.fadeInMetaBoard();
}

/**
 * Create meta and mini board data objects in given object
 * @param {object} meta - reference to meta board object
 */
function createBoardData() {
    // create new data for meta board
    const meta = Board();

    // extend meta board with extra props */
    _.extend(meta, metaProps);

    // create data objects for mini boards
    for (let ri = 0; ri < 3; ri++) {
        for (let ci = 0; ci < 3; ci++) {
            let mini = Board();
            meta.setCell(ri, ci, mini);
        }
    }

    return meta;
}

/**
 * Event handler for clicks on mini board cells
 * @param {object} event        - DOM click event
 * @param {object} event.target - DOM element for mini board cell
 */
function handleBoardClick(event) {
    const target = _.result(event, 'target');
    if (_.isObject(target) && !metaBoard.ended) {
        doPlayerTurn(Dom.getDataForMiniBoardCell(target));
    }
}

/** Handle clicks on new game button */
function handleStartOver() {
    if (Dom.showNewGameConfirm()) {
        init();
    }
}

/*
function handleUndoMove() {
    //TODO: undo last move
    //metaBoard.turn--;
    //updateMetaBoard();
    //updateControls();
}
*/

/**
 * Perform player turn actions
 * @param {object} data
 * @param {number} data.metaRow
 * @param {number} data.metaCol
 * @param {number} data.miniRow
 * @param {number} data.miniCol
 */
function doPlayerTurn(data) {
    const player = getPlayerForTurn();

    /* Get the Board object for the mini board;
     *  return if there's no board, or it's already set */
    const miniBoard = metaBoard.getCell(data.metaRow, data.metaCol);
    if (!miniBoard || miniBoard.getCell(data.miniRow, data.miniCol) !== null) { return; }

    // put an X or O in the mini board cell, depending on whose turn it is
    miniBoard.setCell(data.miniRow, data.miniCol, player);
    Dom.markMiniBoard(data, player);

    // determine if mini board is won
    const miniWinner = miniBoard.findWin();
    if (miniWinner) {
        Dom.setMiniBoardWon(data.metaRow, data.metaCol, miniWinner);
    } else if (miniBoard.isCats()) {
        Dom.setMiniBoardCats(data.metaRow, data.metaCol);
    }

    // determine if meta board is won
    const metaWinner = metaBoard.findWin();
    if (!metaWinner) {
        // update meta board and controls
        Dom.updateMetaBoard(data.miniRow, data.miniCol);
        metaBoard.turn++;
        Dom.updateControls(metaBoard.turn);
    } else {
        // meta board won, game over
        gameOver(metaWinner);
    }
}

/**
 * Return 'X' or 'O' depending on turn number
 * @param {number} turn
 * @return {string}
 */
function getPlayerForTurn(turn) {
    turn = turn || metaBoard.turn;
    return (turn % 2) ? 'X' : 'O';
}

/**
 * Perform end-of-game actions
 * @param {string} winner   - 'X' or 'O'
 */
function gameOver(winner) {
    // set game ended flag
    metaBoard.ended = true;

    // set classes on won boards
    Dom.setGameOver(winner);

    // show a win message
    Dom.showWinMessage(winner);
}
