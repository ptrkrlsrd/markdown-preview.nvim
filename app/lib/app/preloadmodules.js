"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neovim = require('neovim');
const tslib = require('tslib');
const socketIO = require('socket.io');
const msgpackLite = require('msgpack-lite');
exports.default = {
    neovim,
    tslib,
    'socket.io': socketIO,
    'msgpack-lite': msgpackLite
};
