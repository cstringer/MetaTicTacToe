import $ from 'jquery';
import _ from 'underscore';

export default {
    buildBoardDom,
    updateDomForBoard,
    setWonForElement,
    setCatsForElement
};

function buildBoardDom(mbRow, mbCol) {
    let element, ri, $rowDiv, ci;

    /* Create a .board div, add unique classes and metaboard data
     *  and store it in the current instance element property */
    element = $('<div>')
        .addClass('board board-' + mbRow + '-' + mbCol)
        .data('mbRow', mbRow)
        .data('mbCol', mbCol);

    /* For the board matrix, first build a 'row' DIV,
     *  setting a data-row property and row classes;
     *  then, for each 'cell', append a SPAN and set
     *  data-col property and classes.  */
    for (ri = 0; ri < 3; ri++) {
        $rowDiv = $('<div>')
            .data('row', ri)
            .addClass('row row-' + ri);

        for (ci = 0; ci < 3; ci++) {
            $('<span>')
                .data('col', ci)
                .addClass('col col-' + ci)
                .appendTo($rowDiv);
        }

        element.append($rowDiv);
    }

    return element;
}

function updateDomForBoard(board) {
    let ri, ci, mark;

    /* Step through the board matrix, and
     *  check the stored value in each cell -
     *  if it's an X or O, mark it: set the text
     *  of the cell, and set it as a class */
    for (ri = 0; ri < 3; ri++) {
        for (ci = 0; ci < 3; ci++) {
            mark = /(X|O)/.test(board.getCell(ri, ci)) ? board.getCell(ri, ci) : '';
            $(board.element())
                .find('.row-' + ri + ' .col-' + ci)
                .text(mark)
                .removeClass('X O')
                .addClass(mark);
        }
    }
}


function setWonForElement(element, winner) {
    if (_.isObject(element) && _.isString(winner)) {
        element.addClass('won' + ' ' + winner)
               .text(winner);
    }
}

function setCatsForElement(element) {
    if (_.isObject(element)) {
        element.addClass('cats');
    }
}

