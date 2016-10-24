importScripts('socket.io.js');

var soundId;
//var socketUrl = "http://localhost:9998";
var socketUrl = "https://mixulus.com/record";
var socket;
var recBuffer;
var recLen;
var numBuffers;

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      init(e.data.soundId);
      break;
    case 'emit':
      emit(e.data.buffer, e.data.bufferNum);
      break;
    case 'finish':
      finish(e.data.soundId, e.data.callback);
      break;
  }
};

function init(id) {
  soundId = id;
  socket = io.connect(socketUrl, { path: '/record' });
  socket.emit("start", {id: soundId});
  recLen = 0;
  recBuffer = [];
  numBuffers = 0;

  var worker = this;
  socket.on("ready", function() {
    worker.postMessage({
      message: 'ready start'
    });
  });
}

function emit(buffer, bufferNum) {
  numBuffers++;
  socket.emit("queue", {
    id: soundId,
    buffer: buffer,
    bufferNum: bufferNum,
    bufferLen: buffer.length
  });
  recBuffer.push(buffer);
  recLen += buffer.length;
}

function finish(soundId, callback) {
  socket.emit("stop", {
    id: soundId,
    numBuffers: numBuffers
  });

  this.postMessage({ 
    buffer: recBuffer,
    recLen: recLen 
  });

  socket.disconnect();
}

