/*jshint esnext: true */

const net = require('net');

module.exports = function sendBouyomi(msg, port, callback) {
  const messageBuffer = new Buffer(msg);

  var buffer = new Buffer(15 + messageBuffer.length);
  buffer.writeUInt16LE(0x0001, 0);
  buffer.writeUInt16LE(0xFFFF, 2);
  buffer.writeUInt16LE(0xFFFF, 4);
  buffer.writeUInt16LE(0xFFFF, 6);
  buffer.writeUInt16LE(0x0000, 8);
  buffer.writeUInt8   (0x0000, 10);
  buffer.writeUInt32LE(messageBuffer.length, 11);
  messageBuffer.copy(buffer, 15, 0, messageBuffer.length);

  var client = new net.Socket();

  client.connect(port ? port : '50001', 'localhost');

  client.on('error', function(e){
    callback(e);
  });

  client.on('connect', function(){
    client.end(buffer);

    callback();
  });
};
