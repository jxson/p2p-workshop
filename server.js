const net = require('net')
const debug = require('debug')('server')

const server = net.createServer(onsocket)

server.listen(1337)

function onsocket(socket) {
  debug('client connection')
  socket.on('data', ondata)
  socket.on('end', onend)
}

function ondata(data) {
  var socket = this
  debug('data: %s', data)
  socket.write(data)
}

function onend() {
  debug('client disconnected')
}
