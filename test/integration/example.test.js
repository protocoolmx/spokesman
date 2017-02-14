'use strict';

const MyEmitter = require('../../example/MyEmitter');
const MyProvider = require('../../example/MyProvider');

const assert = require('assert');

describe('ExampleTest', function () {

  it('should register provider', function () {
    MyEmitter.getInstance().registerProvider(new MyProvider());
  });

  it('should get provider data once', function (done) {

    MyEmitter.getInstance().once('data', function (data) {
      assert.equal(data, 'Hello world!');

      return done();
    });
  });

  it('should verify that provider is OFF', function () {
    assert.equal(MyEmitter.getInstance().provider.isTurnedON(), false);
  });
});
