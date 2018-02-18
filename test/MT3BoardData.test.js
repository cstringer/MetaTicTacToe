import assert from 'assert';
import Board from '../src/MT3BoardData';

describe('MT3BoardData Test', function() {

    describe('Instance defaults', function() {
        const board = Board();

        it('should have null values in board matrix', function() {
            assert.deepEqual(board.getRow(0), [null,null,null]);
            assert.deepEqual(board.getRow(1), [null,null,null]);
            assert.deepEqual(board.getRow(2), [null,null,null]);
        });

        it('should have null element', function() {
            assert.equal(board.getElement(), null);
        });
    });

    describe('get/setCell() string', function() {
        const board = Board();

        board.setCell(0,0,'X');

        it('should set/get same value', function() {
            assert.equal(board.getCell(0,0), 'X');
        });
    });

    describe('get/setCell() object', function() {
        const board = Board();
        const obj = {};

        board.setCell(0,0,obj);

        it('should set/get same object', function() {
            assert.deepEqual(board.getCell(0,0), obj);
        });
    });

    describe('get/setElement() value', function() {
        const board = Board();
        const el = {};
        board.setElement(el);

        it('should set/get same object', function() {
            assert.equal(board.getElement(), el);
        });
    });

    describe('findWin() three in a row', function() {
        const board = Board();
        board.setCell(0,0,'X');
        board.setCell(0,1,'X');
        board.setCell(0,2,'X');
        const win = board.findWin();

        it('should find three in a row', function() {
            assert.equal(win, 'X');
        });

    });

    describe('findWin() three in a column', function() {
        const board = Board();
        board.setCell(0,0,'X');
        board.setCell(1,0,'X');
        board.setCell(2,0,'X');
        const win = board.findWin();

        it('should find three in a column', function() {
            assert.equal(win, 'X');
        });

    });

    describe('findWin() three diagonally', function() {
        const board = Board();
        board.setCell(0,0,'X');
        board.setCell(1,1,'X');
        board.setCell(2,2,'X');
        const win = board.findWin();

        it('should find three diagonally', function() {
            assert.equal(win, 'X');
        });
    });

    describe('findWin() default behavior', function() {
        const board = Board();
        const win = board.findWin();

        it('should not find a win by default', function() {
            assert.equal(win, false);
        });

    });

    describe('findWin() calls itself on cells containing objects', function() {
        const board = Board();
        const cell = { findWin: () => 'X' };
        board.setCell(0,0,cell);
        board.setCell(0,1,cell);
        board.setCell(0,2,cell);
        const win = board.findWin();

        it('should find a win by calling findWin() on cell objects', function() {
            assert.equal(win, 'X');
        });
    });

    describe('isCats() when board is not full', function() {
        const board = Board();
        const isCats = board.isCats();

        it('should return false when board is not full', function() {
            assert.equal(isCats, false);
        });
    });

    describe('isCats() when board is full and won', function() {
        const board = Board();
        board.setCell(0,0,'X'); // X X X
        board.setCell(0,1,'X');
        board.setCell(0,2,'X');
        board.setCell(1,0,'O'); // O O X
        board.setCell(1,1,'O');
        board.setCell(1,2,'X');
        board.setCell(2,0,'X'); // X O O
        board.setCell(2,1,'O');
        board.setCell(2,2,'O');
        const isCats = board.isCats();

        it('should return false when board is won', function() {
            assert.equal(isCats, false);
        });
    });

    describe('isCats() when board is full but not won', function() {
        const board = Board();
        board.setCell(0,0,'O'); // O X O
        board.setCell(0,1,'X');
        board.setCell(0,2,'O');
        board.setCell(1,0,'O'); // O X X
        board.setCell(1,1,'X');
        board.setCell(1,2,'X');
        board.setCell(2,0,'X'); // X O X
        board.setCell(2,1,'O');
        board.setCell(2,2,'X');
        const isCats = board.isCats();

        it('should return true when board is full with no winner', function() {
            assert.equal(isCats, true);
        });

    });

});
