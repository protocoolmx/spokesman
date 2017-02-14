'use strict';

const EventEmitter = require('events');
const ServiceProvider = require('./ServiceProvider');
const _pick = require('lodash.pick');

class ServiceEmitter extends EventEmitter {

  constructor (opts) {

    // Default value for `opts`.
    opts = opts || {};

    super(); // Call `EventEmitter` constructor.

    /**
     * Will hold object returned by `setInterval` to control service intervals.
     *
     * @private
     * @type {Object}
     */
    this._intervalObject = undefined;

    /**
     * Delay in milliseconds to for intervals.
     *
     * @private
     * @constant
     * @type {Number}
     */
    this._delay = opts.delay || 1000;

    /**
     * Keeps last data set by provider.
     *
     * @private
     * @type {Object}
     */
    this._data = undefined;

    /**
     * Some implementation of `ServiceProvider`.
     *
     * @private
     * @type {ServiceProvider}
     */
    this._provider = undefined;

    // Listen for new event listeners.
    this.on('newListener', (event, listener) => {

      // First we make sure `provider` is defined.
      if (this._provider === undefined) {
        throw new Error('"provider" should be defined before listening any event.');
      }

      // We do not handle 'removeListener' here.
      if (event === 'removeListener') { return; }

      // Only 'data' and 'error' events allowed.
      if (event !== 'data' && event !== 'error') {
        throw new Error('For now, only listening "data" and "error" events are allow.');
      }

      // event 'data' is our keyword event name for main process.
      if (event === 'data') {

        // When got first 'data' listener...
        if (!this.dataHasListeners()) {

          // ...set provider to ON.
          this._provider.turnON();

          // Listen for provider 'data' event to be able to transmit the message
          // to custom service emitters.
          this._provider.on('data', data => {
            this._data = data;
            this.onProviderData(data);
          });

          // Listen provider 'error' event to be able to transmit error to
          // custom service emitters.
          this._provider.on('error', err => this.onProviderError(err));
        }

        // Make sure we are not overriding `_intervalObject`.
        if (this._intervalObject === undefined) {
          this._intervalObject = setInterval(() => this.interval(), this._delay);
        }
      }

      // Call `onNewListener` for custom behavior.
      this.onNewListener(event, listener);
    });

    // Listen removeListener event.
    this.on('removeListener', (event, listener) => {

      // If no one listens 'data' event then...
      if (!this.dataHasListeners()) {

        // Reset interval.
        clearInterval(this._intervalObject);
        this._intervalObject = undefined;

        // Reset data.
        this._data = undefined;

        // Make sure provider is registered before setting it OFF.
        if (this._provider) {
          this._provider.turnOFF();
          this._provider.removeAllListeners();
        }
      }

      // Call `onRemoveListener` for custom behavior.
      this.onRemoveListener(event, listener);
    });
  }

  /**
   * Checks if any listeners listen 'data' event.
   *
   * @return {Boolean} `true` if at least one client listens `data` event.
   */
  dataHasListeners () {
    return this.listenerCount('data') > 0;
  }

  /**
   * Checks if listener provided is listening event name.
   *
   * @param {String} event - Event name to check.
   * @param {Function} listener - Listener to check.
   * @return {Boolean} Whether listener listens event.
   */
  isListeningTo (event, listener) {
    return this.listeners(event).some(_listener => {
      return _listener === listener;
    });
  }

  /**
   * Public method for ServiceProvider registration.
   *
   * @param {ServiceProvider} provider - One of the available providers.
   */
  registerProvider (provider) {

    if (!(provider instanceof ServiceProvider)) {
      throw new Error('"provider" must be an instance of `ServiceProvider`.');
    }

    if (this.isProviderRegistered()) {
      throw new Error('"provider" is already registered!');
    }

    // Do the actual registration.
    this._provider = provider;
  }

  /**
   * Verifies if {@link this._provider} is already registered.
   *
   * @return {Boolean} `true` is registered, `false` otherwise.
   */
  isProviderRegistered () {
    return this._provider && this._provider instanceof ServiceProvider;
  }

  /**
   * Get current provider data with optional pick filter.
   *
   * @param {Array} [pick] - Array of properties to return in Object.
   * @return {Object} Current provider data Object.
   */
  getCurrentData (pick) {
    return !pick ? this._data : _pick(this._data, pick);
  }

  /**
   * Empty `interval` function to be implemented by custom emitter.
   *
   * @abstract
   * @desc This function will be called in each cycle of main interval.
   */
  interval () { }

  /**
   * Empty `onNewListener` function to be implemented by custom emitter.
   *
   * @abstract
   * @desc This function will be called on new event listener.
   * @param {String} event - Event name.
   * @param {Function} listener - Listener Function.
   */
  onNewListener (event, listener) { }

  /**
   * Empty `onRemoveListener` function to be implemented by custom emitter.
   *
   * @abstract
   * @desc This function will be called on remotion of event listener.
   * @param {String} event - Event name.
   * @param {Function} listener - Listener Function.
   */
  onRemoveListener (event, listener) { }

  /**
   * Empty `onProviderData` function to be implemented by custom emitter.
   *
   * @abstract
   * @desc This function will be called when provider emits new data.
   * @param {Object} data - Data to emit.
   */
  onProviderData (data) { }

  /**
   * Empty `onProviderError` function to be implemented by custom emitter.
   *
   * @abstract
   * @desc This function will be called when provider emits an error.
   * @param {Object} err - Error to emit.
   */
  onProviderError (err) { }
}

module.exports = ServiceEmitter;
