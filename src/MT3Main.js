import $ from 'jquery';

import gConfig from './MT3Config';
import TTTBoard from './MT3Board';

import './style.css';

import boardHtml from './board.html';
import controlsHtml from './controls.html';


let metaBoard = {};

$(document).ready(init);

function init() {
  var ri, ci, tttBoard, $mbRow;

  $('body').append(controlsHtml);
  $('body').append(boardHtml);

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

  // bind event handlers
  bindEvents();

  /* Show the meta board and get the party started (!) */
  metaBoard.element()
    .hide()
    .fadeIn(gConfig.fadeInTime);

  updateControls();
}

function bindEvents() {
  $(gConfig.sels.metaBoard).on('click', '.col', handlePlayerTurn);
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

