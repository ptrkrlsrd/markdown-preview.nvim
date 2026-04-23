const neovim = require('neovim')
const tslib = require('tslib')
const socketIO = require('socket.io')
const msgpackLite = require('msgpack-lite')

export default {
  neovim,
  tslib,
  'socket.io': socketIO,
  'msgpack-lite': msgpackLite
}
