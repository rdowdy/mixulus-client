(function() {
    'use strict';

    angular
        .module('app')
        .factory('PlaybackFactory', PlaybackFactory);

    PlaybackFactory.$inject = [];

    /* @ngInject */
    function PlaybackFactory() {
    	/////////////////////
    	// Functions
    	/////////////////////
        var service = {
            initialize: initialize,
            playAt: playAt
        };
        
        /////////////////////
    	// Variables
    	/////////////////////
    	var audioContext = null;
    	var currentlyPlaying = [];

		/////////////////////
        // Initialization
        /////////////////////
        function initialize(context) {
        	// I NEED the audio context to work
        	if(context == null) {
        		throw new Error("PlaybackFactory can't be instantiated without an audio context.");
        	}

        	// set the global
        	audioContext = context;
        }

        /////////////////////
        // Playback
        /////////////////////
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

        return service;
    }
})();