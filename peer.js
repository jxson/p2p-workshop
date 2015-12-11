const args = require('yargs').argv
const debug = require('debug')('peer')
const peers = args.peers.split(',')
const topology = require('fully-connected-topology')

debug('--port %s', args.port)
debug('--peers %o', peers)

const swarm = topology(args.port, peers)

swarm.on('connection', function(connection, peer) {
  debug('connected to %s', peer)
})