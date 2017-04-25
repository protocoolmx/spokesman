# Change Log

### v0.2.2

 _2017-04-24_ [v0.2.1...v0.2.2](https://github.com/protocoolmx/spokesman/compare/v0.2.1...v0.2.2)

* [BUG FIX] Override `removeAllListeners()` in `ServiceEmitter` to only remove `data` and `error` listeners and kept untouched `newListener` and `removeListener` [PR #13](https://github.com/protocoolmx/spokesman/pull/13).

### v0.2.1

 _2017-02-20_ [v0.2.0...v0.2.1](https://github.com/protocoolmx/spokesman/compare/v0.2.0...v0.2.1)

* [BUG FIX] `ServiceEmitter` options are now validated [PR #8](https://github.com/protocoolmx/spokesman/pull/8).

### v0.2.0

 _2017-02-16_ [v0.1.0...v0.2.0](https://github.com/protocoolmx/spokesman/compare/v0.1.0...v0.2.0)

* [NEW OPTION] You can now use boolean `runImmediately` option to call interval the right moment you start listening 'data' event [4c649dd...822e2a4](https://github.com/protocoolmx/spokesman/compare/4c649dd...822e2a4).
* [API CHANGED] `onProviderData` now takes a callback as second argument for data validation and emition of `data` event [3f2c6d1...cbf11c6](https://github.com/protocoolmx/spokesman/compare/3f2c6d1...cbf11c6).
