const net = require('net')
const debug = require('debug')('client')

const client = net.connect(1337)

client.on('data', ondata)

process.stdin.on('data', write)

function write(data) {
  debug('sending: %s', data)
  client.write(data)
}

function ondata(data) {
  debug('received: %s', data)
  process.stdout.write(data)
}