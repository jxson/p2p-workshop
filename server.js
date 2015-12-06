const net = require('net')
const debug = require('debug')('server')
const set = require('stream-set')

const server = net.createServer(onsocket)
const sockets = set()

server.listen(1337)

function onsocket(socket) {
  sockets.add(socket)

  debug('new client, %d total', sockets.size)
  socket.on('data', ondata)
  socket.on('end', onend)
}

function ondata(data) {
  var current = this

  sockets.forEach(function iterator(stream) {
    if (current !== stream) {
      stream.write(data)
    }
  })
}

function onend() {
  debug('client disconnected, %d left', sockets.size)
}
