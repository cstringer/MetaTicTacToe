import assert from 'assert';
import Board from '../src/MT3BoardData';

describe('MT3BoardData Test', function() {

    describe('Instance defaults', function() {
        const board = new Board();

        it('should have null values in board matrix', function() {
            assert.deepEqual(board.getRow(0), [null,null,null]);
            assert.deepEqual(board.getRow(1), [null,null,null]);
            assert.deepEqual(board.getRow(2), [null,null,null]);
        });

        it('should have null element', function() {
            assert.equal(board.element(), null);
        });
    });

    describe('get/setCell() value', function() {
        const board = new Board();

        board.setCell(0,0,'X');

        it('should set first row/cell to X', function() {
            assert.equal(board.getCell(0,0), 'X');
        });
    });

    describe('element() gets/sets value', function() {
        const board = new Board();
        const el = {};
        board.element(el);

        it('should return element object', function() {
            assert.equal(board.element(), el);
        });
    });

    describe('findWin() finds three in a row', function() {
        const board = new Board();
        board.setCell(0,0,'X');
        board.setCell(0,1,'X');
        board.setCell(0,2,'X');
        const win = board.findWin();

        it('should find three in a row', function() {
            assert.equal(win, 'X');
        });

    });

    describe('findWin() finds three in a column', function() {
        const board = new Board();
        board.setCell(0,0,'X');
        board.setCell(1,0,'X');
        board.setCell(2,0,'X');
        const win = board.findWin();

        it('should find three in a column', function() {
            assert.equal(win, 'X');
        });

    });

    describe('findWin() finds three diagonally', function() {
        const board = new Board();
        board.setCell(0,0,'X');
        board.setCell(1,1,'X');
        board.setCell(2,2,'X');
        const win = board.findWin();

        it('should find three diagonally', function() {
            assert.equal(win, 'X');
        });
    });

    describe('findWin() returns false for no win', function() {
        const board = new Board();
        const win = board.findWin();

        it('should not find a win by default', function() {
            assert.equal(win, false);
        });

    });

    describe('isCats() detects a "cats game"', function() {
        const board = new Board();
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
