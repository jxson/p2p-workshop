const args = require('yargs').argv
const net = require('net')
const debug = require('debug')('client')
const json = require('duplex-json-stream')
const format = require('format')

const socket = net.connect(1337, args.server + '.local')
const client = json(socket)

require('lookup-multicast-dns/global')
client.on('data', ondata)

process.stdin.on('data', write)

function write(buffer) {
  var message = buffer.toString().trim()
  debug('sending: %s', message)
  client.write({
    username: args.username,
    message: message
  })
}

function ondata(data) {
  debug('received: %o', data)
  var message = format('   %s > %s\n', data.username, data.message)
  process.stdout.write(message)
}