'use strict';

const ServiceProvider = require('../index').ServiceProvider;

class MyProvider extends ServiceProvider {

  constructor () {
    super(); // Call `ServiceProvider` constructor.
  }

  /**
   * @override
   */
  turnON () {

    if (this.isTurnedON()) { return; } // Return if already ON.

    super.turnON(); // Do not forget to call `turnON()` method of super class.

    // Listen for emitter data requests.
    this.on('wantsData', (opts) => this.setData('Hello world!'));
  }
}

module.exports = MyProvider;
