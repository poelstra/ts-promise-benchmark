# Crude benchmarks for TS-Promise

Although the tests are rather synthetic, early results indicate ts-promise is
pretty fast (higher is better):
```
$ npm test

Every run creates 100 chains of 100 promises = ~10000 promises
ts-promise syncResolve x 216 ops/sec ±1.33% (87 runs sampled)
ts-promise asyncResolve x 219 ops/sec ±1.03% (88 runs sampled)
ts-promise syncReject x 3,053 ops/sec ±1.47% (90 runs sampled)
ts-promise asyncReject x 239 ops/sec ±0.87% (89 runs sampled)
Bluebird syncResolve x 169 ops/sec ±2.17% (84 runs sampled)
Bluebird asyncResolve x 164 ops/sec ±1.30% (86 runs sampled)
Bluebird syncReject x 237 ops/sec ±0.96% (88 runs sampled)
Bluebird asyncReject x 233 ops/sec ±1.22% (87 runs sampled)
```

This was measured on my laptop:
```
Intel(R) Core(TM) i3-3120M CPU @ 2.50GHz
Ubuntu 14.04
Node 0.10.26
ts-promise 0.1.1
Bluebird 2.9.25
'Performance' profile
```
