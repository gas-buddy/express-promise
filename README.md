express-promise-patch
=====================

[![Greenkeeper badge](https://badges.greenkeeper.io/gas-buddy/express-promise.svg)](https://greenkeeper.io/)

A simple patch to express 4.x to better deal with async handler methods.
Without this patch, exceptions in these methods will usually end up as
uncaughtRejections disassociated from the request that caused them. This
patch normalizes them back to calls to next() with the error.