(function() {
    'use strict';

    angular
        .module('app')
        .factory('ContextFactory', ContextFactory);

    ContextFactory.$inject = ['$window', 'SoundFactory', 'localStorageService'];

    /* @ngInject */
    function ContextFactory($window, SoundFactory, localStorageService) {

        var audioContext;
        var audioRecorder;
        var processorNode;
        var bufferSource;
        var realAudioInput;

        var recording = false;

        var bufferLen = 4096;

        var recLen = 0;
        var recBuffer = new Float32Array();

        var socket;
        var socketWorker;
        var socketUrl = "https://mixulus.com:9999";
        var currentCallback;
        var currentSoundId;
        var audioBufferNum = 0;
        var armedTrack;

        var currentlyPlaying = [];

        init();

        ///////////////////////////////
        var service = {
            getAudioContext: getAudioContext,
            getSource: getBufferSource,
            record: record,
            stop: stop,
            playAt: playAt,
            stopAudio: stopAudio
        };

        return service;

        ///////////////////////////////
        // Initialization Functions
        ///////////////////////////////

        // set audio context, create new instance
        function init() {
            console.log("initializing")
                // add the audio context to the window if needed
            if (!$window.AudioContext) {
                $window.AudioContext = $window.AudioContext || $window.webkitAudioContext;
            }

            // instantiate the singleton
            audioContext = new AudioContext();

            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // get the media stream aka 
            // ask for access to the stream which is tied to the user's 
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
            }, gotStream, function(e) {
                alert('Error getting audio');
                console.log(e);
            });

            socketWorker = new Worker("features/core/socket.worker.js");
            socketWorker.onmessage = function(e) {
                if(e.data.message == "ready start") {
                    startCollectingInput();
                } else {
                    recLen = e.data.recLen;
                    currentCallback(mergeBuffers(e.data.buffer), armedTrack);  
                }
            }
        }

        // once we are permitted access to the stream
        // set up the source and gain nodes
        function gotStream(stream) {
            // Create an AudioNode from the media stream.
            realAudioInput = audioContext.createMediaStreamSource(stream);

            // [realAudioInput] => [zeroGain] => [audioContext.destination]
            // where realAudioInput is the media stream source node
            var zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            realAudioInput.connect(zeroGain);
            zeroGain.connect(audioContext.destination);

            initRecorder(realAudioInput);

            // set up audio buffer source for playback
            bufferSource = audioContext.createBufferSource();
            bufferSource.connect(audioContext.destination);
        }

        ////////////////
        // Initialize recorder
        ////////////////
        function initRecorder(source) {
            // initialize a processor node
            // which will be linked to an input buffer
            // and an output buffer. This allows for
            // audio processing

            if (!audioContext.createScriptProcessor) {
                processorNode = audioContext.createJavaScriptNode(bufferLen, 1, 1);
            } else {
                processorNode = audioContext.createScriptProcessor(bufferLen, 1, 1);
            }

            processorNode.onaudioprocess = audioProcessCallback;

            source.connect(processorNode);
            processorNode.connect(audioContext.destination);

        }


        // when new audio samples arrive
        // either discard them (if not recording)
        // or push them to the recording buffer
        // and send to the server 
        function audioProcessCallback(e) {
            if (recording) {
                //var inputBuffer = e.inputBuffer.getChannelData(0);
                //recBuffer.push(new Float32Array(inputBuffer));
                //recLen += inputBuffer.length;
                socketWorker.postMessage({
                    command: 'emit',
                    buffer: e.inputBuffer.getChannelData(0),
                    bufferNum: audioBufferNum++
                })
            }
        }

        function record(soundId) {
            recBuffer = [];
            recLen = 0;
            currentSoundId = soundId;
            socketWorker.postMessage({
                command: 'init',
                soundId: soundId
            })
        }

        function startCollectingInput() {
            recording = true;
        }

        function stop(callback, trackNum) {
            recording = false;
            socketWorker.postMessage({
                command: 'finish',
                soundId: currentSoundId
            })
            currentCallback = callback;
            armedTrack = trackNum;
            audioBufferNum = 0;
            //return mergeBuffers(recBuffer);
        }

        function mergeBuffers(buf) {
            console.log('merging');
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
        ///////////////////////////////

        ////////////////
        // Play
        function playAt(buffer, effects, offset) {
            var source = audioContext.createBufferSource();
            source.buffer = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);

            var audioBufferArray = source.buffer.getChannelData(0);
            audioBufferArray.set(buffer);

            if (effects == null) {
                source.connect(audioContext.destination);
            } else {
                source.connect(effects);
            }

            source.start(offset);

            currentlyPlaying.push(source);
            source.onended = function() {
                currentlyPlaying.splice(currentlyPlaying.indexOf(source), 1);
            }
        }
        ////////////////
        // Stop Audio
        function stopAudio() {
            for (var i = 0; i < currentlyPlaying.length; i++) {
                currentlyPlaying[i].stop();
            }
        }

        ////////////////
        // Getters
        ////////////////
        function getAudioContext() {
            return audioContext;
        }

        function getBufferSource() {
            return bufferSource;
        }

    }
})();
