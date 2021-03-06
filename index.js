const Layer = require('express/lib/router/layer');

const BUILTIN_HANDLE_REQUEST = Symbol('Generic request handler for GasBuddy services');

function isPromise(o) {
  return !!o && typeof o.then === 'function' && !!o.catch;
}

module.exports = function expressPromisePatch(reqErrorLogger) {
  function handleWithPromises(req, res, next) {
    if (!req.app) {
      return this[BUILTIN_HANDLE_REQUEST](req, res, next);
    }

    const fn = this.handle;

    if (fn.length > 3) {
      // not a standard request handler
      return next();
    }

    const nextDebounce = () => {
      if (typeof reqErrorLogger === 'function') {
        reqErrorLogger(req, new Error('Handler called next more than once'));
      }
    };
    let nextProxy = (e) => {
      nextProxy = nextDebounce;
      next(e);
    };
    try {
      const maybePromise = fn(req, res, (e) => {
        nextProxy(e);
      });
      if (isPromise(maybePromise)) {
        Promise.resolve(maybePromise).catch((error) => {
          nextProxy(error);
        });
      }
    } catch (err) {
      nextProxy(err);
    }
    return undefined;
  }

  if (!Layer.prototype[BUILTIN_HANDLE_REQUEST]) {
    // Monkey patch express Layer to handle Promises better
    Layer.prototype[BUILTIN_HANDLE_REQUEST] = Layer.prototype.handle_request;
    Layer.prototype.handle_request = handleWithPromises;
  }
};
