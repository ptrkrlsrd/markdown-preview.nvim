const neovim = require('@chemzqm/neovim')
const tslib = require('tslib')
const socketIO = require('socket.io')
const msgpackLite = require('msgpack-lite')

export default {
  '@chemzqm/neovim': neovim,
  tslib,
  'socket.io': socketIO,
  'msgpack-lite': msgpackLite
}
