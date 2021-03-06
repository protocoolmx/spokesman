'use strict';

const EventEmitter = require('events');

class ServiceProvider extends EventEmitter {

  constructor () {

    super(); // Call `EventEmitter` constructor.

    /**
     * Flag for provider status, can be 'ON' or 'OFF'.
     *
     * @private
     * @type {String}
     */
    this._status = 'OFF';
  }

  /**
   * Turns ON provider, usually you would like to override
   * default behavior for this action in providers.
   *
   * Note: Even if you override this, you should always call {@link super.turnON()}
   * to update {@link this._status} flag.
   */
  turnON () {
    this._status = 'ON';
  }

  /**
  * Turns OFF provider, usually you would like to override
  * default behavior for this action in providers.
  *
  * Note: Even if you override this, you should always call {@link super.turnOFF()}
  * to update {@link this._status} flag.
  */
  turnOFF () {
    this._status = 'OFF';
  }

  /**
   * Whether provider is turned ON or not.
   *
   * @return {Boolean} `true` if 'ON', false otherwise.
   */
  isTurnedON () {
    return this._status === 'ON';
  }

  /**
   * Notifies to custom provider that custom emitter wants new data.
   *
   * Note: 'wantsData' event should be listened by custom provider in order to
   * be able to process request and return response to custom emitter.
   *
   * @param {Object} [opts] - Optional Object to be passed along 'wantsData'
   *                          event.
   */
  requestData (opts) {
    this.emit('wantsData', opts || {});
  }

  /**
   * Emits 'data' event which is listened by {@link ServiceEmitter} with data
   * received from custom provider to make it available for consumers of your
   * custom emitter.
   *
   * Note: You should NOT override this method on your providers.
   *
   * @param {Object} data - Data to transmit to `ServiceEmitter`.
   */
  setData (data) {
    this.emit('data', data);
  }

  /**
   * Emits 'error' event which is listened by {@link ServiceEmitter} with error
   * received from custom provider to make it available for consumers of your
   * custom emitter.
   *
   * @param {Object} err - Possible error to transmit to `ServiceEmitter`.
   */
  setError (err) {
    this.emit('error', err);
  }
}

module.exports = ServiceProvider;
