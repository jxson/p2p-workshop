const args = require('yargs').argv
const debug = require('debug')('peer')
const format = require('format')
const json = require('duplex-json-stream')
const peers = args.peers ? args.peers.split(',').map((port)=> 'localhost:' + port) : []
const set = require('stream-set')
const topology = require('fully-connected-topology')

debug('--port %s', args.port)
debug('--peers %o', peers)

const swarm = topology('localhost:' + args.port, peers)
const sockets = set()

const forwards = {}
const id = Math.random()
var seq = 0

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
      message: message,
      seq: seq,
      id: id
    })
  })

  seq++
}

function ondata(data) {
  debug('received: %o', data)
  var stream = this
  var message = format('   %s > %s\n', data.username, data.message)
  process.stdout.write(message)

  this._id = data.id
  this._seq = data.seq
  this._username = data.username

  // Forward to connected peers that aren't the sender and haven't been
  // forwarded yet.
  sockets.forEach(function iterator(stream) {
    var isSender = stream._id === data.id
    var forwarded = data.seq < stream._seq
    if (!isSender && !forwarded) {
      debug('forwaring to: %s', stream._username)
      stream.write(data)
    }
  })
}
