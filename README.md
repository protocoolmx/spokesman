# spokesman.js

[![npm version](https://badge.fury.io/js/spokesman.js.svg)](https://badge.fury.io/js/spokesman.js)

Super flexible Node.js Service Emitter, you ask and you decide how spokesman will answer.

## Install

```sh
$ npm install spokesman.js --save
```

## How to create custom `ServiceEmitter`

First of all you need to extend emitter class.

```javascript
// MyEmitter.js
const ServiceEmitter = require('spokesman.js').ServiceEmitter;

let singleton = Symbol();
let singletonEnforcer = Symbol();

class MyEmitter extends ServiceEmitter {

  constructor (enforcer) {

    // This disables creating instance outside.
    if (enforcer !== singletonEnforcer) {
      throw 'Cannot construct singleton';
    }

    super({ delay: 2000 }); // Call `ServiceEmitter` constructor.
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
  onProviderData (data) {
    // Emit data received from provider to custom emitters.
    //
    // Note: if you call `super({ autoRequest: false })`, then this method will
    // not get fired unless you call first `this.provider.requestData(opts)` in
    // the override of `interval()`.
    this.emit('data', data);

    return true; // This means `data` received is valid.
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
```

**Note:** `MyEmitter` is a singleton, we recommend use this pattern to keep a
clean implementation.

## How to create custom `ServiceProvider`

Once we have our basic `MyEmitter` the next step is to create a custom provider.

```javascript
// MyProvider.js
const ServiceProvider = require('spokesman.js').ServiceProvider;

class MyProvider extends ServiceProvider {

  constructor () {
    super(); // Call `ServiceProvider` constructor.
  }

  /**
   * @override
   */
  turnON () {

    if (this.isTurnedON()) { return }; // Return if already ON.

    super.turnON(); // Do not forget to call `turnON()` method of super class.

    // Listen for emitter data requests.
    this.on('wantsData', (opts) => this.setData('Hello world!'));
  }
}

module.exports = MyProvider;
```

**Note:** The default behavior of `ServiceEmitter` is to remove all provider
listeners when no one listens 'data' event of `ServiceEmitter`.

## MyEmitter + MyProvider usage

Now that our custom emitter and provider are ready we will see how they work
together.

```javascript
const MyEmitter = require('./MyEmitter');
const MyProvider = require('./MyProvider');

// First register `MyProvider` in `MyEmitter`.
MyEmitter.getInstance().registerProvider(new MyProvider());

// Then listen for 'data' event.
MyEmitter.getInstance().on('data', (data) => {
  console.log(data); // output: 'Hello world!' each 2 seconds.
});
```

You can create your own Emitters and Providers to adapt to your necessities.

## ServiceEmitter Properties

### .provider : `ServiceProvider`

Instance of `ServiceProvider` registered.

## ServiceEmitter Methods

### constructor (opts)

Constructor receives an `Object` with options:

* `delay` (Number) - Delay in milliseconds for intervals, default set to `1000`.
* `autoRequest` (Boolean) - Whether to request data to provider automatically
or not, default set to `true`.

### .dataHasListeners () : `Boolean`

Checks if any listeners listen 'data' event.

### .isListeningTo (event, listener) : `Boolean`

Checks if listener provided is listening event name.

* `event` (String) - Event name to check.
* `listener` (Function) - Listener to check

### .registerProvider (provider)

Public method for ServiceProvider registration.

* `provider` (ServiceProvider) - One of the available providers.

### .isProviderRegistered () : `Boolean`

Verifies if a provider is already registered.

### .getCurrentData ([pick]) : `Object`

Get current provider data with optional pick filter.

* `pick` (Array) - Array of properties to return in Object.

### .interval ()

Abstract `interval` function to be implemented by custom emitter.

**Note:** This function will be called in each cycle of main interval.

### .onNewListener (event, listener)

Abstract `onNewListener` function to be implemented by custom emitter.

* `event` (String) - Event name.
* `listener` (Function) - Listener Function.


**Note:** This function will be called on new event listener.

### .onRemoveListener (event, listener)

Abstract `onRemoveListener` function to be implemented by custom emitter.

* `event` (String) - Event name.
* `listener` (Function) - Listener Function.

**Note:** This function will be called on remotion of event listener.

### .onProviderData (data) : `Boolean`

Abstract `onProviderData` function to be implemented by custom emitter.

* `data` (Object) - Data to emit.

**Notes:**

* This function will be called when provider emits new data.
* The returned value by the implementation of this method will be used to
decide if we should update provider data received from provider or not.

### .onProviderError (err)

Abstract `onProviderError` function to be implemented by custom emitter.

* `err` (Object) - Error to emit.

**Note:** This function will be called when provider emits an error.

### .removeListener (event, listener)

+ `event` (String) - Event name of listener to remove.
+ `listener` (Function) - Listener of event name to remove.

### .removeAllListeners ()

It does what it says it does.

## ServiceProvider Events

### .on('data', callback)

Listens for main emitter event.

Callback arguments:

* `data` (Object) - Data received from custom emitter.

### .on('error', callback)

Listens for error emitter event.

Callback arguments:

* `error` (Object) - Error received from custom emitter.

## ServiceProvider Methods

### .turnON ()

Turns ON provider, usually you would like to override default behavior for this
action in providers.

**Note:** Even if you override this, you should always call super class `turnON`
method to update `ServiceProvider` status.

### .turnOFF ()

Turns OFF provider, usually you would like to override default behavior for this
action in providers.

**Note:** Even if you override this, you should always call super class `turnOFF`
method to update `ServiceProvider` status.

### .isTurnedON () : `Boolean`

Whether provider is turned 'ON' or not.

### .requestData ([opts])

Notifies to custom provider that custom emitter wants new data.

* `opts` (Object) - Optional Object to be passed along 'wantsData' event.

**Note:** 'wantsData' event should be listened by custom provider in order to
be able to process request and return response to custom emitter.s

### .setData (data)

Emits 'data' event which is listened by `ServiceEmitter` with data received
from custom provider to make it available for consumers of your custom emitter.

* `data` (Object) - Data to transmit to `ServiceEmitter`.

**Note:** You should NOT override this method on your providers.

### .setError (err)

Emits 'error' event which is listened by `ServiceEmitter` with error received
from custom provider to make it available for consumers of your custom emitter.

* `err` (Object) - Possible error to transmit to `ServiceEmitter`.

## ServiceProvider Events

### .on('wantsData', callback)

Listens for `wantsData` event, this event should be listen by custom provider
to know when custom emitters are requesting new data.

Callback arguments:

* `opts` (Object) - Optional Object passed from custom emitter.

## Testing

```sh
$ npm test
```

## License

MIT
