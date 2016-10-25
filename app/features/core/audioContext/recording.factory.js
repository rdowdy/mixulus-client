(function() {
    'use strict';

    angular
        .module('app')
        .factory('RecordingFactory', RecordingFactory);

    RecordingFactory.$inject = [];

    /* @ngInject */
    function RecordingFactory() {

    	/////////////////////
    	// Functions
    	/////////////////////
        var service = {
            initialize: initialize,
            record: record,
            stop: stop
        };
        
        /////////////////////
        // Variables
        /////////////////////
        var audioContext = null;

        var armedTrack = 0; // track to record to
        var audioBufferNum = 0; // chronology of buffers
        var bufferLen = 4096; // samples per buffer
        var currentSoundId = null; // current sound model associated with recording
        var doneRecordingCallback = null;
        var readyRecordingCallback = null;
        var recBuffer = new Float32Array();
        var recLen = 0; // total number if samples recorded
        var recording = false;
        var socketWorkerPath = "features/core/socket.worker.js";
        var socketWorker = null;

        /////////////////////
        // Initialization
        /////////////////////
        function initialize(streamNode, context) {
        	// I NEED the audio context to work
        	if(streamNode == null || context == null) {
        		throw new Error("RecordingFactory can't be instantiated without an audio context or a media stream source.");
        	}

        	// set the globals
        	audioContext = context;

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

            // initialize the socket worker so I can talk to the server
            initializeWorker();
        }

        // initialize the socket worker which will handle recording
        function initializeWorker() {
            console.log("Initializing socket worker....");
            // instantiate
            socketWorker = new Worker(socketWorkerPath);
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

        return service;
    }
})();