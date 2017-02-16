'use strict';

const ServiceEmitter = require('../index').ServiceEmitter;

let singleton = Symbol();
let singletonEnforcer = Symbol();

class MyEmitter extends ServiceEmitter {

  constructor (enforcer) {

    // This disables creating instance outside.
    if (enforcer !== singletonEnforcer) {
      throw 'Cannot construct singleton';
    }

    super({ delay: 500 }); // Call `ServiceEmitter` constructor.
  }

  /**
   * Get unique instance of `MyEmitter`.
   */
  static getInstance () {
    if (!this[singleton]) {
      this[singleton] = new MyEmitter(singletonEnforcer);
    }

    return this[singleton];
  }

  /**
   * @override
   */
  onProviderData (data, cb) {
    // Emit data received from provider to custom emitters.
    //
    // Note: if you call `super({ autoRequest: false })`, then this method will
    // not get fired unless you call first `this.provider.requestData(opts)` in
    // the override of `interval()`.

    //validate Data here
    
    return cb(null, data);
  }

  /**
   * @override
   */
  onProviderError (err) {
    // Emit error received from provider to custom emitters.
    this.emit('error', err);
  }
}

module.exports = MyEmitter;
