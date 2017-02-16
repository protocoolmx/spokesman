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
     * Delay in milliseconds for intervals.
     *
     * @private
     * @constant
     * @type {Number}
     */
    this._delay = opts.delay || 1000;

    /**
     * Determines if {@link this._intervalCallback()} should be called immediately.
     *
     * @private
     * @constant
     * @type {Boolean}
     */
    this._runImmediately = opts.runImmediately || false;

    /**
     * Flag to know if we have to call {@link this.provider.requestData()}
     * automatically or not, default set to true.
     *
     * @private
     * @constant
     * @type {Boolean}
     */
    this._autoRequest = opts.autoRequest || true;

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
    this.provider = undefined;

    // Listen for new event listeners.
    this.on('newListener', (event, listener) => {

      // We do not handle 'removeListener' here.
      if (event === 'removeListener') { return; }

      // First we make sure `provider` is defined.
      if (!this.isProviderRegistered()) {
        throw new Error('"provider" should be registered before listening any event.');
      }

      // Only 'data' and 'error' events allowed.
      if (event !== 'data' && event !== 'error') {
        throw new Error('For now, only listening "data" and "error" events are allow.');
      }

      // event 'data' is our keyword event name for main process.
      if (event === 'data') {

        // When got first 'data' listener...
        if (!this.dataHasListeners()) {

          // ...set provider to ON.
          this.provider.turnON();

          // Listen for provider 'data' event to be able to transmit the message
          // to custom service emitters.
          this.provider.on('data', data => {

            // Call this method for custom emitters to know of new provider
            // data, the callback should be called by custom emitters with
            // proper validation.
            this.onProviderData(data, (error, validatedData) => {

              // In case of any error, emit it using 'error' event.
              if (error) {
                return this.emit('error', error);
              }

              // Update validated data.
              this._data = validatedData;

              // Proceed to emit validated data.
              this.emit('data', this._data);
            });
          });

          // Listen provider 'error' event to be able to transmit error to
          // custom service emitters.
          this.provider.on('error', err => this.onProviderError(err));
        }

        // Make sure we are not overriding `_intervalObject`.
        if (this._intervalObject === undefined) {
          this._intervalObject = setInterval(() => this._intervalCallback(), this._delay);

          // Call interval callback NOW if `runImmediately` option is true.
          if (this._runImmediately) {
            this._intervalCallback();
          }
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
        if (this.isProviderRegistered()) {
          this.provider.turnOFF();

          // Remove all provider listeners, 'data', 'error' and 'wantsData'.
          this.provider.removeAllListeners();
        }
      }

      // Call `onRemoveListener` for custom behavior.
      this.onRemoveListener(event, listener);
    });
  }

  /**
   * Interval callback for {@link this._intervalObject}.
   *
   * @private
   */
  _intervalCallback () {

    // If `this._autoRequest` is true and provider is registered then
    // request data to provider.
    if (this._autoRequest && this.isProviderRegistered()) {
      this.provider.requestData();
    }

    // Call `this.interval()` for custom emitters to know.
    this.interval();
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
    this.provider = provider;
  }

  /**
   * Verifies if {@link this.provider} is already registered.
   *
   * @return {Boolean} `true` is registered, `false` otherwise.
   */
  isProviderRegistered () {
    return this.provider && this.provider instanceof ServiceProvider;
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
   * @param {ServiceEmitter~onProviderDataCallback} [cb] - Function to be called for data validation.
   */
  onProviderData (data, cb) { }

  /**
   * Callback to be called for data validation in {@link this.onProviderData()}
   * implementation.
   *
   * @callback ServiceEmitter~onProviderDataCallback
   * @param {Object} error - Reason of validation failure.
   * @param {Object} validatedData - Validated data to be applied to {@link this._data}.
   */

  /**
   * Empty `onProviderError` function to be implemented by custom emitter.
   *
   * Note: Default behavior is to emit error received.
   *
   * @abstract
   * @desc This function will be called when provider emits an error.
   * @param {Object} err - Error to emit.
   */
  onProviderError (err) {
    this.emit('error', err);
  }
}

module.exports = ServiceEmitter;
