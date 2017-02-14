# spokesman.js

[![npm version](https://badge.fury.io/js/spokesman.js.svg)](https://badge.fury.io/js/spokesman.js)

Super flexible Node.js Service Emitter, you ask and you decide how spokesman will answer.

## Install

```
$ npm install spokesman.js --save
```

## How to create custom `ServiceEmitter`.

First of all you need to extend emitter class.

```javascript
const ServiceEmitter = spokesman.ServiceEmitter;

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
```

**Note:** `MyEmitter` is a singleton, we recommend use this pattern to keep a
clean implementation.

## How to create custom `ServiceProvider`.

Once we have our basic `MyEmitter` the next step is to create a custom provider.

```javascript
const ServiceProvider = spokesman.ServiceProvider;

class MyProvider extends ServiceProvider {

  constructor () {
    super(); // Call `ServiceProvider` constructor.
  }

  /**
   * @override
   */
  turnON () {

    if (this.isTurnedON()) return; // Return if already ON.

    super.turnON(); // Do not forget to call `turnON()` method of super class.

    // Listen for emitter data requests.
    this.on('wantsData', (opts) => this.setData('Hello world!'));
  }
}
```

**Note:** The default behavior of `ServiceEmitter` is to remove all provider
listeners when no one listens 'data' event of `ServiceEmitter`.

## MyEmitter + MyProvider usage

Now that our custom emitter and provider are ready we will see how they work
together.

```javascript
// First register `MyProvider` in `MyEmitter`.
MyEmitter.getInstance().registerProvider(new MyProvider());

// Then listen for 'data' event.
MyEmitter.getInstance().on('data', (data) => {
  console.log(data); // output: 'Hello world!' each 2 seconds.
});
```

You can create your own Emitters and Providers to adapt to your necessities.
