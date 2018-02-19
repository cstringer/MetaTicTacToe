/*global window*/
import $ from 'jquery';
import _ from 'underscore';

import gConfig from './MT3Config';
import Main from './MT3Main';

import boardHtml from './board.html';
import controlsHtml from './controls.html';

import './style.css';


export default {
    init,

    // meta boards
    findMetaEl,
    buildMetaBoard,
    updateMetaBoard,
    hideMetaBoard,
    fadeInMetaBoard,

    // mini boards
    buildMiniBoard,
    findMiniBoard,
    markMiniBoard,
    getDataForMiniBoardCell,
    setMiniBoardWon,
    setMiniBoardCats,

    // general
    setGameOver,
    updateControls,
    showWinMessage,
    showNewGameConfirm
};

/** Reset DOM, add HTML templates, build board, bind events */
function init() {
    const $domRoot = $(gConfig.sels.domRoot);
    $domRoot.empty()
            .append(controlsHtml)
            .append(boardHtml);

    buildMetaBoard();
    bindEvents();
}

/**
 * Return jQuery-wrapped meta board element
 * @return {object}
 */
function findMetaEl() {
    return $(gConfig.sels.domRoot).find(gConfig.sels.metaBoard);
}

/** Build DOM for meta board */
function buildMetaBoard() {
    const $metaEl = findMetaEl();

    $metaEl.empty();

    // Create DIVs for each row of the meta board
    for (let ri = 0; ri < 3; ri++) {
        let $mbRow = $('<div>').addClass(gConfig.cls.metaRow);
        $metaEl.append($mbRow);

        for (let ci = 0; ci < 3; ci++) {
            $mbRow.append(buildMiniBoard(ri, ci));
        }
    }
}

/** Bind event listeners to DOM elements */
function bindEvents() {
    const $metaEl = findMetaEl();

    $metaEl.on('click', gConfig.sels.cell, Main.handleBoardClick);

    $(gConfig.sels.startOver).on('click', Main.handleStartOver);

    //$(gConfig.sels.undoMove).on('click', Main.handleUndoMove);
    //
    $(window).on('beforeunload', function() {
        return gConfig.msg.unload;
    });
}

/**
 * Update the meta board DOM based on clicked mini board
 * @param {number} rowIdx - row # in meta board
 * @param {number} colIdx - column # in meta board
 */
function updateMetaBoard(rowIdx, colIdx) {
    const nextBoard = rowIdx + '-' + colIdx,
        $nextBoard = $(gConfig.sels.board + '-' + nextBoard),
        $allBoards = $(gConfig.sels.metaBoard).find(gConfig.sels.board);

    $allBoards.removeClass(gConfig.cls.inactive);

    // only enable the next clickable mini board
    if (!$nextBoard.hasClass(gConfig.cls.won) &&
        !$nextBoard.hasClass(gConfig.cls.cats)) {
        $allBoards.not($nextBoard)
                  .addClass(gConfig.cls.inactive);
    }
}

/** Hide the meta board */
function hideMetaBoard() {
    findMetaEl().hide();
}

/** Fade in the meta board */
function fadeInMetaBoard() {
    findMetaEl().fadeIn(gConfig.fadeInTime);
}

/**
 * Build DOM for a mini board
 * @param {number} mbRow - row # in meta board
 * @param {number} mbCol - column # in meta board
 * @return {object} jQuery-wrapped board element
 */
function buildMiniBoard(mbRow, mbCol) {
    // create a .board div, add unique classes and metaboard data
    const $element = $('<div>')
              .addClass('board board-' + mbRow + '-' + mbCol)
              .data('mbRow', mbRow)
              .data('mbCol', mbCol);

    /* For the board matrix, first build a 'row' DIV,
     *  setting a data-row property and row classes;
     *  then, for each 'cell', append a SPAN and set
     *  data-col property and classes.  */
    for (let ri = 0; ri < 3; ri++) {
        let $rowDiv = $('<div>').addClass('row row-' + ri);

        for (let ci = 0; ci < 3; ci++) {
            $('<span>')
                .data('col', ci)
                .data('row', ri)
                .addClass('col col-' + ci)
                .appendTo($rowDiv);
        }

        $element.append($rowDiv);
    }

    return $element;
}

/**
 * Find a mini board element by row/column
 * @param {object} options
 */
function findMiniBoard(options) {
    let $mini = $();
    if (_.isObject(options)) {
        if (_.isNumber(options.row) && _.isNumber(options.col)) {
            $mini = findMetaEl().find('.board-' + options.row + '-' + options.col);
        } else if (_.isObject(options.cellEl)) {
            $mini = $(options.cellEl).closest(gConfig.sels.board);
        }
    }

    return $mini;
}

/**
 * Mark mini board cell for player
 * @param {object} data
 * @param {number} data.metaRow
 * @param {number} data.metaCol
 * @param {number} data.metaRow
 * @param {number} data.metaCol
 * @param {string} player
 */
function markMiniBoard(data, player) {
    const $boardEl = findMiniBoard({
        row: data.metaRow,
        col: data.metaCol
    });

    $boardEl.find('.row-' + data.miniRow + ' .col-' + data.miniCol)
            .text(player)
            .removeClass('X O')
            .addClass(player);
}

/**
 * Return row and column indexes for meta and mini positions
 * @param {object} cellEl - board cell DOM element
 * @return {object}       - row, column positions for mini and meta boards
 */
function getDataForMiniBoardCell(cellEl) {
    const $cell = $(cellEl);
    return {
        metaRow: $cell.closest(gConfig.sels.board).data('mbRow'),
        metaCol: $cell.closest(gConfig.sels.board).data('mbCol'),
        miniRow: $cell.data('row'),
        miniCol: $cell.data('col')
    };
}

/**
 * Set mini board as won by given side
 * @param {object} $element - jQuery-wrapped board element
 * @param {string} winner   - 'X' or 'O'
 */
function setMiniBoardWon(mbRow, mbCol, winner) {
    if (_.isString(winner)) {
        findMiniBoard({row:mbRow, col:mbCol})
            .addClass(gConfig.cls.won + ' ' + winner)
            .text(winner);
    }
}

/**
 * Set mini board element as a "cats game"
 * @param {object} $element - jQuery-wrapped board element
 */
function setMiniBoardCats(mbRow, mbCol) {
    findMiniBoard({row:mbRow, col:mbCol}).addClass(gConfig.cls.cats);
}

/**
 * Set classes on won boards
 * @param {object} $metaEl - jQuery-wrapped meta board element
 * @param {string} winner  - 'X' or 'O'
 */
function setGameOver(winner) {
    const $metaEl = findMetaEl();

    // set inactive class on all non-winner boards
    $metaEl.find(gConfig.sels.board)
           .removeClass(gConfig.cls.inactive)
           .not('.won.' + winner)
               .addClass(gConfig.cls.inactive);

    // disable undo button
    //$(gConfig.sels.undoMove).prop('disabled', true);
}

/**
 * Update the controls based on turn number
 * @param {number} turn - turn number
 */
function updateControls(turn) {
    const player = Main.getPlayerForTurn(turn);
    $(gConfig.sels.turn).removeClass().addClass(player);
    $(gConfig.sels.turnPlayer).text(player);
    $(gConfig.sels.undoMove).attr('disabled', (turn === 1));
    $(gConfig.sels.startOver).attr('disabled', (turn === 1));
}

/**
 * Show an alert with a "game won" message
 * @param {string} winner - 'X' or 'O'
 */
function showWinMessage(winner) {
    window.alert(_.template(gConfig.msg.win)({ winner }));
}

/**
 * Show a "new game" confirm message
 * @return {boolean}
 */
function showNewGameConfirm() {
    return window.confirm(gConfig.msg.newGame);
}
