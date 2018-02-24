# Crude benchmarks for TS-Promise

Although the tests are rather synthetic, these results indicate ts-promise is
pretty fast.

Note that e.g. 200 ops/sec actually means 2 million promises being resolved per
second. Higher is better.

```
$ node --version
v8.9.4

$ npm test
Node 8.9.4, V8 6.1.534.50
Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Linux 3.13.0-141-generic x64
Every run creates 100 chains of 100 promises = ~10000 promises
Long stack traces: false

ts-promise syncResolve x 246 ops/sec ±1.48% (73 runs sampled)
ts-promise asyncResolve x 267 ops/sec ±0.68% (75 runs sampled)
ts-promise syncReject x 3,733 ops/sec ±0.77% (88 runs sampled)
ts-promise asyncReject x 370 ops/sec ±0.66% (84 runs sampled)
Bluebird syncResolve x 263 ops/sec ±2.38% (77 runs sampled)
Bluebird asyncResolve x 270 ops/sec ±0.38% (82 runs sampled)
Bluebird syncReject x 484 ops/sec ±1.14% (85 runs sampled)
Bluebird asyncReject x 574 ops/sec ±0.49% (89 runs sampled)
RsvpPromise syncResolve x 165 ops/sec ±0.72% (80 runs sampled)
RsvpPromise asyncResolve x 165 ops/sec ±0.85% (74 runs sampled)
RsvpPromise syncReject x 213 ops/sec ±0.64% (80 runs sampled)
RsvpPromise asyncReject x 209 ops/sec ±1.47% (79 runs sampled)
Q syncResolve x 5.65 ops/sec ±10.29% (19 runs sampled)
Q asyncResolve x 5.61 ops/sec ±9.05% (19 runs sampled)
Q syncReject x 3.85 ops/sec ±8.20% (16 runs sampled)
Q asyncReject x 3.65 ops/sec ±5.91% (16 runs sampled)
```

With long stack traces enabled:
```
$ node --version
v8.9.4

$ NODE_ENV=development npm test
Node 8.9.4, V8 6.1.534.50
Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Linux 3.13.0-141-generic x64
Every run creates 100 chains of 100 promises = ~10000 promises
Long stack traces: true

ts-promise syncResolve x 9.00 ops/sec ±2.62% (27 runs sampled)
ts-promise asyncResolve x 8.90 ops/sec ±1.27% (26 runs sampled)
ts-promise syncReject x 551 ops/sec ±1.20% (85 runs sampled)
ts-promise asyncReject x 9.08 ops/sec ±1.00% (27 runs sampled)
Bluebird syncResolve x 10.33 ops/sec ±2.87% (30 runs sampled)
Bluebird asyncResolve x 10.46 ops/sec ±0.72% (30 runs sampled)
Bluebird syncReject x 5.51 ops/sec ±3.93% (19 runs sampled)
Bluebird asyncReject x 5.83 ops/sec ±3.48% (19 runs sampled)
Q syncResolve x 0.25 ops/sec ±2.38% (5 runs sampled)
Q asyncResolve x 0.25 ops/sec ±2.63% (5 runs sampled)
Q syncReject x 0.24 ops/sec ±2.40% (5 runs sampled)
Q asyncReject x 0.24 ops/sec ±3.91% (5 runs sampled)
```

Notes:
* RSVP was excluded from this test because it doesn't support long traces.
* Bluebird complained about being rejected with a non-Error, which seems a false positive.

This was measured on my laptop:
```
Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Ubuntu 14.04 - 'Performance' profile
ts-promise 1.0.0
Bluebird 3.5.1
es6-promise 4.2.4 (RSVP)
Q 1.5.1
```

# Running

```
git clone https://github.com/poelstra/ts-promise-benchmark
cd ts-promise-benchmark
npm install
npm test
```

# License

The MIT license.
