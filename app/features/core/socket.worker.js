importScripts('socket.io.js');

var soundId;
var socketUrl = "https://mixulus.com/record";
var socket;
var recBuffer;
var recLen;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.soundId, e.data.callback);
      break;
    case 'emit':
      emit(e.data.buffer, e.data.bufferNum);
      break;
    case 'finish':
      finish(e.data.soundId, e.data.callback);
      break;
  }
};

function init(id, cb) {
  soundId = id;
  socket = io.connect(socketUrl, { path: '/record' });
  socket.emit("start record", {id: soundId});
  recLen = 0;
  recBuffer = [];

  socket.on("ready", function() {
    cb();
  })
}

function emit(buffer, bufferNum) {
  socket.emit("audio buffer", {
    id: soundId,
    buffer: buffer,
    bufferNum: bufferNum,
    bufferLen: buffer.length
  });
  recBuffer.push(buffer);
  recLen += buffer.length;
}

function finish(soundId, callback) {
  socket.emit("done record", {
    id: soundId
  });

  this.postMessage({ 
    buffer: recBuffer,
    recLen: recLen 
  });

  socket.disconnect();
}

