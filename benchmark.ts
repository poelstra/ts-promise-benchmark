/**
 * Some made-up benchmarks for Promise implementation performance.
 *
 * These are pretty 'raw' tests, a more realistic test involving different
 * 'patterns' would make sense to get 'real world' stats.
 *
 * Copyright (C) 2015 Martin Poelstra
 */

/// <reference path="typings/tsd.d.ts" />

"use strict";

// These have no typings yet
require("source-map-support").install();
require("microtime");
var Benchmark = require("benchmark");
type Suite = any;

import assert = require("assert");
import sinon = require("sinon");

import { Promise as TsPromise, Thenable } from "ts-promise";
import * as BluebirdPromise from "bluebird";
// import * as Q from "q";
// import { Promise as RsvpPromise } from "es6-promise";

interface PromiseStatic<T> {
	new(resolver: (fulfill: (value: T|Thenable<T>) => void, reject: (reason: Error) => void) => void): Thenable<T>;
	resolve<R>(value: R|Thenable<R>): Thenable<R>;
	reject<R>(reason: Error): Thenable<R>;
	all<R>(thenables: Thenable<R>[]): Thenable<R[]>;
}

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
	var p = Promise.reject(boomError);
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
	resolver(42);
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
	rejecter(boomError);
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
		for (var i = 0; i < parallelCount; i++) {
			testFunc(Promise).then(callback, callback);
		}
		clock.tick(0);
		clock.restore();
		if (ready !== parallelCount) {
			var e = new Error("Error flushing promises");
			console.log(e);
			throw e;
		}
	}
}

// Override Bluebird's scheduler, such that it uses setImmediate, which can be
// overriden by Sinon. (Could also e.g. have used process.nextTick).
// Note that the scheduler is not called often, so it does not have a big impact
// anyway.
BluebirdPromise.setScheduler(function() {
	setImmediate.apply(undefined, arguments);
});

// It seems necessary to run one of the implementations once, to 'prime' the JIT
function prime(): void {
	makeRunner(TsPromise, testSyncResolve)();
}
prime();

function addTests(suite: Suite, name: string, promiseStatic: PromiseStatic<any>): void {
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

console.log(`Every run creates ${parallelCount} chains of ${chainLength} promises = ~${parallelCount * chainLength} promises`);
addTests(suite, "ts-promise", TsPromise);
addTests(suite, "Bluebird", BluebirdPromise);

suite.run({ async: true });
