export default {
    // CSS classes
    cls: {
        board:      'board',
        cats:       'cats',
        inactive:   'inactive',
        won:        'won'
    },

    // game start fade in time (milliseconds)
    fadeInTime:     500,

    // CSS selectors
    sels: {
        board:      '.board',
        domRoot:    'body',
        metaBoard:  '#meta-board',
        startOver:  '#start-over',
        turn:       '#turn',
        turnPlayer: '#turn-player',
        undoMove:   '#undo-move',
        zoomIn:     '#zoom-in',
        zoomOut:    '#zoom-out'
    },

    winMsg: 'And the winner is... <%= winner %>!!!',

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
};
