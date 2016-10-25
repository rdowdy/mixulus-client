(function() {
    'use strict';

    angular
        .module('app')
        .factory('AudioGraphFactory', AudioGraphFactory);

    AudioGraphFactory.$inject = ['$window', 'RecordingFactory'];

    /* @ngInject */
    function AudioGraphFactory(window, RecordingFactory) {
    	/////////////////////
    	// Functions
    	/////////////////////
        var service = {
            initialize: initialize
        };

        /////////////////////
        // Variables
        /////////////////////
        var audioContext;
        var inputStream;

        initialize();
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

            // check that its there
            if(audioContext == null) {
                throw new Error("Audio Context couldn't be instantied properly.");
            }

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
            }, 
            initializeAudioGraph, 
            function(err) {
                alert('Error getting audio');
                throw new Error("Couldn't retrieve user media stream! " + err);
            });
        }

        function initializeAudioGraph(stream) {
            console.log("Initializing audio input graph...");
            // Create an AudioNode from the media stream.
            var realAudioInput = audioContext.createMediaStreamSource(stream);
   
            // create a zero gain node, so the user can't hear the audio as it comes in
            var zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            realAudioInput.connect(zeroGain);
            zeroGain.connect(audioContext.destination);

            // initialize the recorder
            RecordingFactory.initialize(realAudioInput, audioContext);
        }

        /////////////////////
        // Track Functions
        /////////////////////

        // add initial effects chain to track
        // [volumeGainNode] => [muteSoloGainNode] => [destination]
        function addInitialEffectsChainToTrack(track) {
            var volumeGainNode = audioContext.createGain();
            var muteSoloGainNode = audioContext.createGain();

            volumeGainNode.gain.value = 1.0;
            muteSoloGainNode.gain.value = 1.0;

            volumeGainNode.connect(muteSoloGainNode);
            muteSoloGainNode.connect(audioContext.destination);

            track.volumeGainNode = volumeGainNode;
            track.muteSoloGainNode = muteSoloGainNode;
            track.effectsChainStart = volumeGainNode;

            track.mute = false;

            return track;
        }

        return service;
    }
})();