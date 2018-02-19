/*global describe, it*/
import _ from 'underscore';
import assert from 'assert';
import sinon from 'sinon';
import Main from '../src/MT3Main';

const mockMetaBoard = {
    ended: false,
    turn:  1
};

const mockDom = {
    getDataForMiniBoardCell: sinon.stub(),
    markMiniBoard: sinon.stub(),
    setGameOver: sinon.stub(),
    setMiniBoardWon: sinon.stub(),
    setMiniBoardCats: sinon.stub(),
    showNetGameConfirm: sinon.stub(),
    showWinMessage: sinon.stub(),
    updateControls: sinon.stub(),
    updateMetaBoard: sinon.stub()
};

describe('MT3Main Test', function() {

    describe('init()', function() {
        const dom = {
            init: sinon.stub()
        };
        Main.setDom(dom);
        Main.init();

        it('should create a board data object', function() {
            assert.ok(_.isObject(Main.getMetaBoard()));
        });

        it('should call Dom.init()', function() {
            assert.ok(dom.init.called);
        });

    });

    describe('get/setMetaBoard()', function() {
        Main.setMetaBoard(mockMetaBoard);

        it('should reference mock object', function() {
            assert.deepEqual(Main.getMetaBoard(), mockMetaBoard);
        });
    });

    describe('get/setDom()', function() {
        Main.setDom(mockDom);

        it('should reference mock object', function() {
            assert.deepEqual(Main.getDom(), mockDom);
        });
    });

    describe('createBoardData()', function() {
        const data = Main.createBoardData();
        _.extend(mockMetaBoard, data);

        it('should return object', function() {
            assert.ok(_.isObject(data));
        });

        it('return should duck-type as Board', function() {
            assert.ok(_.isFunction(data.getCell));
        });

        it('should contain matrix of objects', function() {
            assert.ok(_.isObject(data.getCell(0,0)));
            assert.ok(_.isObject(data.getCell(0,1)));
            assert.ok(_.isObject(data.getCell(0,2)));
            assert.ok(_.isObject(data.getCell(1,0)));
            assert.ok(_.isObject(data.getCell(1,1)));
            assert.ok(_.isObject(data.getCell(1,2)));
            assert.ok(_.isObject(data.getCell(2,0)));
            assert.ok(_.isObject(data.getCell(2,1)));
            assert.ok(_.isObject(data.getCell(2,2)));
        });

        it('matrix objects should duck-type as Board', function() {
            assert.ok(_.isFunction(data.getCell(0,0).getCell));
            assert.ok(_.isFunction(data.getCell(1,1).getCell));
            assert.ok(_.isFunction(data.getCell(2,2).getCell));
        });
    });

    describe('doPlayerTurn() first turn', function() {
        mockMetaBoard.turn = 1;
        const turnData = {
            metaRow: 1, metaCol: 1,
            miniRow: 1, miniCol: 1
        };
        Main.doPlayerTurn(turnData);

        it('should set mini board cell to X', function() {
            assert.equal(mockMetaBoard.getCell(1,1).getCell(1,1), 'X');
        });

        it('should call Dom.markMiniBoard()', function() {
            assert.ok(mockDom.markMiniBoard.calledWith(turnData, 'X'));
        });

        it('should call Dom.updateMetaBoard()', function() {
            assert.ok(mockDom.updateMetaBoard.calledWith(turnData.miniRow, turnData.miniCol));
        });

        it('should call Dom.updateControls()', function() {
            assert.ok(mockDom.updateControls.calledWith(mockMetaBoard.turn));
        });
    });

    describe('doPlayerTurn() when mini board cell is already set', function() {
        const mockMini = {
            getCell: sinon.stub().returns('X'),
            setCell: sinon.stub()
        };
        mockMetaBoard.setCell(0,2,mockMini);
        Main.doPlayerTurn({
            metaRow: 0, metaCol: 2,
            miniRow: 1, miniCol: 1
        });

        it('should NOT call mini board setCell()', function() {
            assert.equal(mockMini.setCell.called, false);
        });
    });

    describe('doPlayerTurn() on mini board win', function() {
        mockMetaBoard.turn = 3;
        const mini = mockMetaBoard.getCell(1,1);
        mini.setCell(0,0,'X');
        Main.doPlayerTurn({
            metaRow: 1, metaCol: 1,
            miniRow: 2, miniCol: 2
        });

        it('should call Dom.setMiniBoardWon()', function() {
            assert.ok(mockDom.setMiniBoardWon.calledWith(1, 1, 'X'));
        });
    });

    describe('doPlayerTurn() on meta board win', function() {
        mockMetaBoard.findWin = sinon.stub().returns('X');
        Main.doPlayerTurn({
            metaRow: 2, metaCol: 2,
            miniRow: 2, miniCol: 2
        });

        it('should set meta board to ended', function() {
            assert.equal(mockMetaBoard.ended, true);
        });

        it('should call Dom.setGameOver()', function() {
            assert.ok(mockDom.setGameOver.calledWith('X'));
        });

        it('should call Dom.showWinMessage()', function() {
            assert.ok(mockDom.showWinMessage.calledWith('X'));
        });

    });

    describe('getPlayerForTurn()', function() {

        it('should return X for odd turns', function() {
            assert.equal(Main.getPlayerForTurn(1), 'X');
        });

        it('should return O for even turns', function() {
            assert.equal(Main.getPlayerForTurn(2), 'O');
        });

        it('should default to metaBoard turn number', function() {
            mockMetaBoard.turn = 42;
            assert.equal(Main.getPlayerForTurn(), 'O');
        });

    });

});
