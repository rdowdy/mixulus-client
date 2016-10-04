(function() {
    'use strict';

    angular
        .module('app')
        .factory('ContextFactory', ContextFactory);

    ContextFactory.$inject = ['$window'];

    /* @ngInject */
    function ContextFactory($window) {

    	var audioContext;
        var audioRecorder;
        var processorNode;
        var bufferSource;
        var realAudioInput;

        var recording = false;

      	var bufferLen = 2048;

      	var recLen = 0;
      	var recBuffer = new Float32Array();

        init();

        ///////////////////////////////
        var service = {
            getAudioContext: getAudioContext,
            getSource: getBufferSource,
            record: record,
            stop: stop,
            playAt: playAt
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
            //var gainNode = audioContext.createGain();
            //gainNode.gain.value = 1.0;
            //bufferSource.connect(gainNode);
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
        	//var processorNode;

        	if(!audioContext.createScriptProcessor) {
        		processorNode = audioContext.createJavaScriptNode(bufferLen, 1, 1);
        	} else {
        		processorNode = audioContext.createScriptProcessor(bufferLen, 1, 1);
        	}

        	processorNode.onaudioprocess = audioProcessCallback;

        	source.connect(processorNode);
        	processorNode.connect(audioContext.destination);

        	console.log("dont initializing recorder")

        }


		// when new audio samples arrive
    	// either discard them (if not recording)
    	// or push them to the recording buffer
        function audioProcessCallback(e) {
        	if (recording) {
    			var inputBuffer = e.inputBuffer.getChannelData(0);
        		recBuffer.push(new Float32Array(inputBuffer));
        		recLen += inputBuffer.length;
    		}
        }

        function record() {
        	console.log('context factory record')
        	recBuffer = [];
        	recLen = 0;
        	recording = true;
        }

        function stop() {
        	console.log('context factory done');
        	recording = false;
        	//console.log(recBuffer);
        	return mergeBuffers(recBuffer);
        }

        function mergeBuffers(buf) {
        	console.log("merging buffers");
        	var result = new Float32Array(recLen);
        	var offset = 0;
        	for(var i = 0; i < buf.length; i++) {
        		// put recBuffer[i] values into result
        		// at position {offset}
        		//console.log(buf);
        		result.set(buf[i], offset);
        		offset += buf[i].length;
        	}

        	return result;
        }
        ///////////////////////////////

        ////////////////
        // Play
        function playAt(buffer, offset) {
            var source = audioContext.createBufferSource();
            source.buffer = audioContext.createBuffer(1, buffer.length, audioContext.sampleRate);

            var audioBufferArray = source.buffer.getChannelData(0);
            audioBufferArray.set(buffer);

            source.connect(audioContext.destination);
            source.start(offset);
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
