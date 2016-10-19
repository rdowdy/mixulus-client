importScripts('socket.io.js');

var soundId;
var socketUrl = "https://mixulus.com:9999";
var socket;
var recBuffer;
var recLen;
var token

this.onmessage = function(e){
  switch(e.data.command){
    case 'init':
      token = e.data.token,
      init(e.data.soundId, e.data.socket);
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
  token = token;
  soundId = id;
  socket = io.connect(socketUrl, {
    token: token
  });
  socket.emit("start record", {id: soundId});
  recLen = 0;
  recBuffer = [];
}

function emit(buffer, bufferNum) {
  socket.emit("audio buffer", {
    id: soundId,
    buffer: buffer,
    bufferNum: bufferNum,
    bufferLen: buffer.length,
    token: token
  });
  recBuffer.push(buffer);
  recLen += buffer.length;
}

function finish(soundId, callback) {
  socket.emit("done record", {
    id: soundId,
    token: token
  });

  this.postMessage({ 
    buffer: recBuffer,
    recLen: recLen 
  });

  socket.disconnect();
}

