"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const noop = () => {};
const error = (...args) => process.stderr.write('[mkdp] ' + args.join(' ') + '\n');
module.exports = () => ({ debug: noop, info: noop, warn: noop, error });
