# Crude benchmarks for TS-Promise

Although the tests are rather synthetic, early results indicate ts-promise is
pretty fast.

Note that e.g. 200 ops/sec actually means 2 million promises being resolved per
second.

```
$ npm test

Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Linux 3.13.0-45-generic x64
Every run creates 100 chains of 100 promises = ~10000 promises
Long stack traces: false

ts-promise syncResolve x 209 ops/sec ±2.54% (85 runs sampled)
ts-promise asyncResolve x 215 ops/sec ±1.47% (86 runs sampled)
ts-promise syncReject x 3,090 ops/sec ±1.76% (94 runs sampled)
ts-promise asyncReject x 230 ops/sec ±1.43% (86 runs sampled)
Bluebird syncResolve x 165 ops/sec ±3.29% (82 runs sampled)
Bluebird asyncResolve x 170 ops/sec ±1.29% (80 runs sampled)
Bluebird syncReject x 235 ops/sec ±1.70% (86 runs sampled)
Bluebird asyncReject x 224 ops/sec ±2.61% (84 runs sampled)
RsvpPromise syncResolve x 237 ops/sec ±2.76% (89 runs sampled)
RsvpPromise asyncResolve x 235 ops/sec ±2.20% (88 runs sampled)
RsvpPromise syncReject x 1,911 ops/sec ±2.60% (92 runs sampled)
RsvpPromise asyncReject x 280 ops/sec ±2.67% (92 runs sampled)
Q syncResolve x 4.91 ops/sec ±3.34% (17 runs sampled)
Q asyncResolve x 5.02 ops/sec ±4.66% (17 runs sampled)
Q syncReject x 4.63 ops/sec ±4.36% (16 runs sampled)
Q asyncReject x 4.65 ops/sec ±4.21% (16 runs sampled)
```

With long stack traces enabled:
```
$ NODE_ENV=development npm test

Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Linux 3.13.0-45-generic x64
Every run creates 100 chains of 100 promises = ~10000 promises
Long stack traces: true

ts-promise syncResolve x 7.87 ops/sec ±1.78% (24 runs sampled)
ts-promise asyncResolve x 7.96 ops/sec ±0.56% (24 runs sampled)
ts-promise syncReject x 511 ops/sec ±2.78% (76 runs sampled)
ts-promise asyncReject x 7.32 ops/sec ±5.57% (23 runs sampled)
Bluebird syncResolve x 8.95 ops/sec ±4.57% (27 runs sampled)
Bluebird asyncResolve x 9.10 ops/sec ±3.84% (27 runs sampled)
Bluebird syncReject x 8.13 ops/sec ±2.29% (25 runs sampled)
Bluebird asyncReject x 8.11 ops/sec ±2.80% (25 runs sampled)
Q syncResolve x 0.18 ops/sec ±1.29% (5 runs sampled)
Q asyncResolve x 0.18 ops/sec ±1.65% (5 runs sampled)
Q syncReject x 0.18 ops/sec ±3.36% (5 runs sampled)
Q asyncReject x 0.19 ops/sec ±0.84% (5 runs sampled)
```

This was measured on my laptop:
```
Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Ubuntu 14.04 - 'Performance' profile
Node 0.10.26
ts-promise 0.1.1
Bluebird 2.9.25
es6-promise 2.1.1 (RSVP)
Q 1.3.0
```

# Running

```
git clone https://github.com/poelstra/ts-promise-benchmark
cd ts-promise-benchmark
npm install
npm test
```
