/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

describe('evaluator', function() {
  function XrefMock(queue) {
    this.queue = queue;
  }
  XrefMock.prototype = {
    fetchIfRef: function() {
      return this.queue.shift();
    }
  };
  function HandlerMock() {
    this.inputs = [];
  }
  HandlerMock.prototype = {
    send: function(name, data) {
      this.inputs({name: name, data: data});
    }
  };
  function ResourcesMock() { }
  ResourcesMock.prototype = {
    get: function(name) {
      return this[name];
    }
  };

  describe('splitCombinedOperations', function() {
    it('should reject unknown operations', function() {
      var evaluator = new PartialEvaluator(new XrefMock(), new HandlerMock(),
                                           'prefix');
      var stream = new StringStream('qTT');
      var thrown = false;
      try {
        evaluator.getOperatorList(stream, new ResourcesMock(), []);
      } catch (e) {
        thrown = e;
      }
      expect(thrown).toNotEqual(false);
    });

    it('should handle one operations', function() {
      var evaluator = new PartialEvaluator(new XrefMock(), new HandlerMock(),
                                           'prefix');
      var stream = new StringStream('Q');
      var result = evaluator.getOperatorList(stream, new ResourcesMock(), []);

      expect(!!result.fnArray && !!result.argsArray).toEqual(true);
      expect(result.fnArray.length).toEqual(1);
      expect(result.fnArray[0]).toEqual('restore');
    });

    it('should handle two glued operations', function() {
      var evaluator = new PartialEvaluator(new XrefMock(), new HandlerMock(),
                                           'prefix');
      var resources = new ResourcesMock();
      resources.Res1 = {};
      var stream = new StringStream('/Res1 DoQ');
      var result = evaluator.getOperatorList(stream, resources, []);

      expect(!!result.fnArray && !!result.argsArray).toEqual(true);
      expect(result.fnArray.length).toEqual(2);
      expect(result.fnArray[0]).toEqual('paintXObject');
      expect(result.fnArray[1]).toEqual('restore');
    });

    it('should handle tree glued operations', function() {
      var evaluator = new PartialEvaluator(new XrefMock(), new HandlerMock(),
                                           'prefix');
      var stream = new StringStream('qqq');
      var result = evaluator.getOperatorList(stream, new ResourcesMock(), []);

      expect(!!result.fnArray && !!result.argsArray).toEqual(true);
      expect(result.fnArray.length).toEqual(3);
      expect(result.fnArray[0]).toEqual('save');
      expect(result.fnArray[1]).toEqual('save');
      expect(result.fnArray[2]).toEqual('save');
    });
  });
});

