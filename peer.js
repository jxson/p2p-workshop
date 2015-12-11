const args = require('yargs').argv
const debug = require('debug')('peer')
const format = require('format')
const json = require('duplex-json-stream')
const peers = args.peers.split(',').map((port)=> 'localhost:' + port)
const set = require('stream-set')
const topology = require('fully-connected-topology')

debug('--port %s', args.port)
debug('--peers %o', peers)

const swarm = topology('localhost:' + args.port, peers)
const sockets = set()

swarm.on('connection', function(socket, peer) {
  debug('connected to %s', peer)

  var wrapped = json(socket)

  sockets.add(wrapped)
  wrapped.on('data', ondata)
})

process.stdin.on('data', write)

function write(buffer) {
  var current = this
  var message = buffer.toString().trim()
  debug('sending: %s', message)

  sockets.forEach(function iterator(stream) {
    stream.write({
      username: args.username,
      message: message
    })
  })
}

function ondata(data) {
  debug('received: %o', data)
  var message = format('   %s > %s\n', data.username, data.message)
  process.stdout.write(message)
}
