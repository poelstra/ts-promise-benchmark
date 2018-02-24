/**
 * Some made-up benchmarks for Promise implementation performance.
 *
 * These are pretty 'raw' tests, a more realistic test involving different
 * 'patterns' would make sense to get 'real world' stats.
 *
 * Copyright (C) 2015 Martin Poelstra
 */

import "source-map-support/register";
import "microtime";

import * as Benchmark from "benchmark";
import * as assert from "assert";
import * as os from "os";
import * as sinon from "sinon";

var enableLongStacks = process.env["NODE_ENV"] === "development";

// Import ts-promise
import { Promise as TsPromise, Thenable } from "ts-promise";
TsPromise.setLongTraces(enableLongStacks);

interface PromiseStatic<T> {
	new(resolver: (fulfill: (value: T|Thenable<T>) => void, reject: (reason: Error) => void) => void): Thenable<T>;
	resolve<R>(value: R|Thenable<R>): Thenable<R>;
	reject<R>(reason: Error): Thenable<R>;
	all<R>(thenables: Thenable<R>[]): Thenable<R[]>;
}

// Import Bluebird
import * as BluebirdPromise from "bluebird";
if (enableLongStacks) {
	BluebirdPromise.longStackTraces();
	BluebirdPromise.config({
		warnings: false // disable false positive for "non-Error rejection"
	});
}
// Override Bluebird's scheduler, such that it uses setImmediate, which can be
// overriden by Sinon. (Could also e.g. have used process.nextTick).
// Note that the scheduler is not called often, so it does not have a big impact
// anyway.
BluebirdPromise.setScheduler((callback: Function): void => {
	setImmediate(callback);
});

// RSVP and Q don't have an interface to override their scheduler, so
// 'intercept' process.nextTick() and setImmediate()
function fakeableScheduler(callback: Function) {
	// This call to setImmediate will be overridden by Sinon
	setImmediate.apply(undefined, arguments);
}
var oldSetImmediate = setImmediate;
var oldSetTimeout = setTimeout;
var oldProcessNextTick = process.nextTick;
global.setImmediate = fakeableScheduler;
global.setTimeout = <any>fakeableScheduler;
process.nextTick = fakeableScheduler;

// Import Q
import * as Q from "q";
(<any>Q).longStackSupport = enableLongStacks;
var QPromise: PromiseStatic<any> = <any>Q.Promise;

// Import RSVP
import { Promise as RsvpPromise } from "es6-promise";

// Restore 'normal' versions
global.setImmediate = oldSetImmediate;
global.setTimeout = oldSetTimeout;
process.nextTick = oldProcessNextTick;


var parallelCount = 100;
var chainLength = 100;

var boomError = new Error("boom");

function testSyncResolve(Promise: PromiseStatic<number>): Thenable<number> {
	var p = Promise.resolve(42);
	for (var i = 0; i < chainLength; i++) {
		p = p.then((n: number): number => {
			return n++;
		});
	}
	return p;
}

function testSyncReject(Promise: PromiseStatic<number>): Thenable<number> {
	var p = Promise.reject<number>(boomError);
	for (var i = 0; i < chainLength; i++) {
		p = p.then((n: number): number => {
			return n++;
		});
	}
	return p;
}

function testAsyncResolve(Promise: PromiseStatic<number>): Thenable<number> {
	var resolver: (v: number) => void;
	var p = new Promise((res): void => {
		resolver = res;
	});
	for (var i = 0; i < chainLength; i++) {
		p = p.then((n: number): number => {
			return n++;
		});
	}
	resolver!(42);
	return p;
}

function testAsyncReject(Promise: PromiseStatic<number>): Thenable<number> {
	var resolver: (v: number) => void;
	var rejecter: (r: Error) => void;
	var p = new Promise((res, rej): void => {
		resolver = res;
		rejecter = rej;
	});
	for (var i = 0; i < chainLength; i++) {
		p = p.then((n: number): number => {
			return n++;
		});
	}
	rejecter!(boomError);
	return p;
}

function makeRunner(Promise: PromiseStatic<number>, testFunc: (Promise: PromiseStatic<number>) => Thenable<number>): () => void {
	return function run() {
		var promises: Thenable<number>[] = [];
		var ready = 0;
		function callback() {
			ready++;
		}
		var clock = sinon.useFakeTimers();
		var oldProcessNextTick = process.nextTick;
		process.nextTick = fakeableScheduler; // Sinon doesn't stub this

		for (var i = 0; i < parallelCount; i++) {
			testFunc(Promise).then(callback, callback);
		}
		clock.tick(0);
		clock.restore();
		process.nextTick = oldProcessNextTick;

		if (ready !== parallelCount) {
			var e = new Error("Error flushing promises");
			console.log(e);
			throw e;
		}
	}
}

// It seems necessary to run one of the implementations once, to 'prime' the JIT
function prime(): void {
	makeRunner(TsPromise, testSyncResolve)();
}
prime();

function addTests(suite: Benchmark.Suite, name: string, promiseStatic: PromiseStatic<any>): void {
	suite
		.add(name + " syncResolve", makeRunner(promiseStatic, testSyncResolve))
		.add(name + " asyncResolve", makeRunner(promiseStatic, testAsyncResolve))
		.add(name + " syncReject", makeRunner(promiseStatic, testSyncReject))
		.add(name + " asyncReject", makeRunner(promiseStatic, testAsyncReject));
}

var suite = new Benchmark.Suite();
suite
	.on("cycle", (event: any): void => {
		console.log(String(event.target));
	});

console.log(`Node ${process.versions.node}, V8 ${process.versions.v8}`);
console.log(os.cpus()[0].model);
console.log(os.type(), os.release(), os.arch());
console.log(`Every run creates ${parallelCount} chains of ${chainLength} promises = ~${parallelCount * chainLength} promises`);
console.log("Long stack traces:", enableLongStacks);
console.log();

addTests(suite, "ts-promise", TsPromise);
addTests(suite, "Bluebird", BluebirdPromise);
if (!enableLongStacks) { // Rsvp doesn't have this feature, so exclude
	addTests(suite, "RsvpPromise", RsvpPromise);
}
addTests(suite, "Q", QPromise);

suite.run({ async: true });
