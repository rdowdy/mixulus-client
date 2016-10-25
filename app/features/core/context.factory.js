(function() {
    'use strict';

    angular
        .module('app')
        .factory('ContextFactory', ContextFactory);

    ContextFactory.$inject = ['$window', 'SoundFactory', 'localStorageService'];

    /* @ngInject */
    function ContextFactory($window, SoundFactory, localStorageService) {
        //////////////////////////
        // Functions
        //////////////////////////
        var service = {
            getAudioContext: getAudioContext,
            playAt: playAt,
            record: record,
            stop: stop,
            stopAudio: stopAudio
        };

        //////////////////////////
        // Variables 
        //////////////////////////

        ///////////
        // Audio Context
        ///////////
        var audioContext;
        var processorNode;
        var realAudioInput;

        ///////////
        // Recording
        ///////////
        var armedTrack = 0; // track to record to
        var audioBufferNum = 0; // chronology of buffers
        var bufferLen = 4096; // samples per buffer
        var currentSoundId = null; // current sound model associated with recording
        var doneRecordingCallback = null;
        var readyRecordingCallback = null;
        var recBuffer = new Float32Array();
        var recLen = 0; // total number if samples recorded
        var recording = false;
        var socketWorker = null;

        ///////////
        // Playback
        ///////////
        var currentlyPlaying = [];

        ///////////////////////////////

        ////////////////
        // init and return the object
        initialize();
        return service;

        //////////////////////////
        // Getter
        //////////////////////////
        function getAudioContext() {
            return audioContext;
        }

        //////////////////////////
        // Initialization 
        //////////////////////////

        // set audio context, create new instance
        function initialize() {
            console.log("Initializing audio context...");
            // add the audio context to the window if needed
            if (!$window.AudioContext) {
                $window.AudioContext = $window.AudioContext || $window.webkitAudioContext;
            }
            // instantiate the singleton
            audioContext = new AudioContext();

            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // ask for access to the stream associated with the user's 
            // selected recording source
            navigator.getUserMedia({
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }, initializeAudioInputGraph, function(e) {
                alert('Error getting audio');
                console.log(e);
            });

            initializeWorker();
        }

        // initialize the socket worker which will handle recording
        function initializeWorker() {
            console.log("Initializing socket worker....");
            // instantiate
            socketWorker = new Worker("features/core/socket.worker.js");
            // set the handler when receiving messages from the worker
            socketWorker.onmessage = function(e) {
                if(e.data.message == "ready start") {
                    startCollectingInput();
                } else {
                    recLen = e.data.recLen;
                    doneRecordingCallback(mergeBuffers(e.data.buffer), armedTrack);  
                }
            }
        }

        // once we are permitted access to the stream, set up the input graph
        // [realAudioInput] => [zeroGain] => [audioContext.destination]
        function initializeAudioInputGraph(stream) {
            console.log("Initializing audio input graph...");
            // Create an AudioNode from the media stream.
            realAudioInput = audioContext.createMediaStreamSource(stream);
   
            // create a zero gain node, so the user can't hear the audio as it comes in
            var zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            realAudioInput.connect(zeroGain);
            zeroGain.connect(audioContext.destination);

            // initialize the recorder
            initRecorder(realAudioInput);
        }

        // initialize recording graph
        // [source] => [processorNode] => [destination]
        function initRecorder(source) {
            console.log("Initializing recorder...");
            // the processornode will allow me to collect audio samples 
            // from the mic during recording
            // initialization depends on compatibility
            if (!audioContext.createScriptProcessor) {
                processorNode = audioContext.createJavaScriptNode(bufferLen, 1, 1);
            } else {
                processorNode = audioContext.createScriptProcessor(bufferLen, 1, 1);
            }

            // when an audio buffer is ready, call this function
            processorNode.onaudioprocess = audioProcessCallback;

            // wire everything up
            source.connect(processorNode);
            processorNode.connect(audioContext.destination);
        }

        //////////////////////////
        // Recording
        //////////////////////////
        // the order of functions in this section
        // reflects the general chronology of a recording session

        // this will initiate the recording process
        function record(soundId, cb) {
            // intialize session vars
            recBuffer = [];
            recLen = 0;
            currentSoundId = soundId;
            readyRecordingCallback = cb;
            audioBufferNum = 0;

            // init socket worker
            socketWorker.postMessage({
                command: 'init',
                soundId: soundId
            })
        }

        // this will be called when the server is ready to record
        function startCollectingInput() {
            recording = true;
            readyRecordingCallback();
        }

        // when new audio samples arrive
        // push them to the recBuffer, if recording
        function audioProcessCallback(e) {
            if (recording) {
                socketWorker.postMessage({
                    command: 'emit',
                    buffer: e.inputBuffer.getChannelData(0),
                    bufferNum: audioBufferNum++
                })
            }
        }

        // stop the recording process
        function stop(callback, trackNum) {
            recording = false;
            socketWorker.postMessage({
                command: 'finish',
                soundId: currentSoundId
            });
            doneRecordingCallback = callback;
            armedTrack = trackNum;
            audioBufferNum = 0;
        }

        // merge the array of sample buffers into one big array of samples
        function mergeBuffers(buf) {
            var result = new Float32Array(recLen);
            var offset = 0;
            for (var i = 0; i < buf.length; i++) {
                // put recBuffer[i] values into result
                // at position {offset}
                result.set(buf[i], offset);
                offset += buf[i].length;
            }

            return result;
        }

        //////////////////////////
        // Playback
        //////////////////////////
        function playAt(buffer, effects, offset) {
            // create a buffer source node which will play the audio
            var source = audioContext.createBufferSource();
            source.buffer = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);

            // set the node's buffer data to the buffer passed on
            var audioBufferArray = source.buffer.getChannelData(0);
            audioBufferArray.set(buffer);

            // connect to the effects chain if there is one
            if (effects == null) {
                source.connect(audioContext.destination);
            } else {
                source.connect(effects);
            }

            source.start(offset);

            // keep track of all buffers that are currently playing
            currentlyPlaying.push(source);
            source.onended = function() {
                currentlyPlaying.splice(currentlyPlaying.indexOf(source), 1);
            }
        }

        function stopAudio() {
            for (var i = 0; i < currentlyPlaying.length; i++) {
                currentlyPlaying[i].stop();
            }
        }
    }
})();
