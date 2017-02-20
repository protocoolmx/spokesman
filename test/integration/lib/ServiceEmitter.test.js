'use strict';

const ServiceEmitter = require('../../../lib/ServiceEmitter');
const ServiceProvider = require('../../../lib/ServiceProvider');
const assert = require('assert');

describe('ServiceEmitter', function () {

  describe('#_validateOpts()', function () {

    it('should override all default opts values', function () {

      const opts = { delay: 500, runImmediately: true, autoRequest: false };
      let serviceEmitter = new ServiceEmitter(opts);

      assert.equal(serviceEmitter._delay, 500);
      assert.equal(serviceEmitter._runImmediately, true);
      assert.equal(serviceEmitter._autoRequest, false);
    });

    it('should use default opts values', function () {

      let serviceEmitter = new ServiceEmitter();

      assert.equal(serviceEmitter._delay, 1000);
      assert.equal(serviceEmitter._runImmediately, false);
      assert.equal(serviceEmitter._autoRequest, true);
    });

    it('should only runImmediately option value', function () {

      let serviceEmitter = new ServiceEmitter({ runImmediately: true });

      assert.equal(serviceEmitter._delay, 1000);
      assert.equal(serviceEmitter._runImmediately, true);
      assert.equal(serviceEmitter._autoRequest, true);
    });
  });

  describe('#autoRequest', function () {

    it('should verify autoRequest as false works', function (done) {
      let serviceEmitter = new ServiceEmitter({ autoRequest: false, runImmediately: true });
      let serviceProvider = new ServiceProvider();
      serviceEmitter.registerProvider(serviceProvider);

      serviceProvider.once('wantsData', () => {
        return done(new Error('wantsData should not be called automatically when autoRequest is false.'));
      });

      serviceEmitter.once('data', () => {});

      setTimeout(() => done(), 100);
    });

    it('should verify autoRequest when not provided works', function (done) {
      let serviceEmitter = new ServiceEmitter({ runImmediately: true });
      let serviceProvider = new ServiceProvider();
      serviceEmitter.registerProvider(serviceProvider);

      serviceProvider.once('wantsData', () => done());
      serviceEmitter.once('data', () => {});
      serviceEmitter.once('error', done);
    });
  });
});
