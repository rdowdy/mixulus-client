(function() {
    'use strict';

    angular
        .module('app')
        .factory('AudioGraphFactory', AudioGraphFactory);

    AudioGraphFactory.$inject = [];

    /* @ngInject */
    function AudioGraphFactory() {
    	/////////////////////
    	// Functions
    	/////////////////////
        var service = {
            initialize: initialize
        };

        /////////////////////
        // Variables
        /////////////////////
        var context;
        var inputStream;

        /////////////////////
        // Initialization
        /////////////////////
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
        }

        function initializeAudioInputGraph(stream) {
            console.log("Initializing audio input graph...");
            // Create an AudioNode from the media stream.
            var realAudioInput = audioContext.createMediaStreamSource(stream);
   
            // create a zero gain node, so the user can't hear the audio as it comes in
            var zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            realAudioInput.connect(zeroGain);
            zeroGain.connect(audioContext.destination);

            // initialize the recorder
            initRecorder(realAudioInput);
        }

        return service;
    }
})();