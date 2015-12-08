const args = require('yargs').argv
const net = require('net')
const debug = require('debug')('server')
const set = require('stream-set')
const json = require('duplex-json-stream')
const register = require('register-multicast-dns')

const server = net.createServer(onsocket)
const sockets = set()

register(args.username + '.local')
server.listen(1337)

function onsocket(socket) {
  var wrapped = json(socket)
  sockets.add(wrapped)

  debug('new client, %d total', sockets.size)
  wrapped.on('data', ondata)
  wrapped.on('end', onend)
}

function ondata(data) {
  var current = this
  debug('data: %o', data)
  sockets.forEach(function iterator(stream) {
    if (current !== stream) {
      stream.write(data)
    }
  })
}

function onend() {
  debug('client disconnected, %d left', sockets.size)
}
