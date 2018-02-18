import $ from 'jquery';
import _ from 'underscore';

import gConfig from './MT3Config';

import boardHtml from './board.html';
import controlsHtml from './controls.html';

export default {
    init,
    buildMetaBoard,
    updateMetaBoard,
    buildMiniBoard,
    findMiniBoard,
    updateMiniBoard,
    setWonForElement,
    setCatsForElement,
    setGameOver
};

/**
 * Reset DOM, add HTML templates
 * @return {object} jQuery-wrapped meta board element
 */
function init() {
    const $domRoot = $(gConfig.sels.domRoot);
    $domRoot.empty()
            .append(controlsHtml)
            .append(boardHtml);

    const $metaEl = $(gConfig.sels.metaBoard);
    $metaEl.empty();

    return $metaEl;
}

/**
 * Build DOM for meta board
 * @param {object} $metaEl - jQuery-wrapped meta board element
 */
function buildMetaBoard($metaEl) {
    let ri, ci, $mbRow;

    // Create DIVs for each row of the meta board
    for (ri = 0; ri < 3; ri++) {
        $mbRow = $('<div>').addClass('mb-row');
        $metaEl.append($mbRow);

        for (ci = 0; ci < 3; ci++) {
            $mbRow.append(buildMiniBoard(ri, ci));
        }
    }
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
    if (!$nextBoard.hasClass('won') &&
        !$nextBoard.hasClass('cats')) {
        $allBoards.not($nextBoard)
                  .addClass(gConfig.cls.inactive);
    }
}

/**
 * Build DOM for a mini board
 * @param {number} mbRow - row # in meta board
 * @param {number} mbCol - column # in meta board
 * @return {object} jQuery-wrapped board element
 */
function buildMiniBoard(mbRow, mbCol) {
    let $element, ri, $rowDiv, ci;

    // create a .board div, add unique classes and metaboard data
    $element = $('<div>')
        .addClass('board board-' + mbRow + '-' + mbCol)
        .data('mbRow', mbRow)
        .data('mbCol', mbCol);

    /* For the board matrix, first build a 'row' DIV,
     *  setting a data-row property and row classes;
     *  then, for each 'cell', append a SPAN and set
     *  data-col property and classes.  */
    for (ri = 0; ri < 3; ri++) {
        $rowDiv = $('<div>')
            .addClass('row row-' + ri);

        for (ci = 0; ci < 3; ci++) {
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

function findMiniBoard($metaEl, mbRow, mbCol) {
    return $metaEl.find('.board-' + mbRow + '-' + mbCol);
}

/**
 * Update DOM with board data
 * @param {object} board - BoardData object
 */
function updateMiniBoard(board) {
    let ri, ci, mark;

    /* Step through the board matrix, and
     *  check the stored value in each cell -
     *  if it's an X or O, mark it: set the text
     *  of the cell, and set it as a class */
    for (ri = 0; ri < 3; ri++) {
        for (ci = 0; ci < 3; ci++) {
            mark = /(X|O)/.test(board.getCell(ri, ci)) ? board.getCell(ri, ci) : '';
            board.getElement()
                .find('.row-' + ri + ' .col-' + ci)
                .text(mark)
                .removeClass('X O')
                .addClass(mark);
        }
    }
}

/**
 * Set mini board as won by given side
 * @param {object} $element - jQuery-wrapped board element
 * @param {string} winner   - 'X' or 'O'
 */
function setWonForElement($element, winner) {
    if (_.isObject($element) && _.isString(winner)) {
        $element.addClass(gConfig.cls.won + ' ' + winner)
                .text(winner);
    }
}

/**
 * Set mini board element as a "cats game"
 * @param {object} $element - jQuery-wrapped board element
 */
function setCatsForElement($element) {
    if (_.isObject($element)) {
        $element.addClass(gConfig.cls.cats);
    }
}

/**
 * Set classes on won boards
 * @param {object} $metaEl - jQuery-wrapped meta board element
 * @param {string} winner  - 'X' or 'O'
 */
function setGameOver($metaEl, winner) {
    // set inactive class on all non-winner boards
    $metaEl.find(gConfig.sels.board)
           .removeClass(gConfig.cls.inactive)
           .not('.won.' + winner)
               .addClass(gConfig.cls.inactive);
}
