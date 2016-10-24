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
    	var audioContext;
    	var audioGraph;

        ////////////////

        /////////////////////
    	// Initialization
    	/////////////////////
        function initialize() {
        	audioGraph = {};
        }

        function initializeContext() {

        }

        function initializeInputGraph() {

        }

        function initializeRecording() {

        }

        /////////////////////
    	// Recording
    	/////////////////////
    	function audioProcessEventCallback() {

    	}

    	function startRecordingSession() {

    	}

    	function startCollectingSamples() {

    	}

    	function endRecordingSession() {

    	}

    	function mergeBuffers() {

    	}

        /////////////////////
    	// Playback
    	/////////////////////
    	function play() {

    	}

		function pause() {

		}

		function skipHome() {

		} 	

		function skipEnd() {

		}
    	/////////////////////
    	// Socket Comm
    	/////////////////////

        return service;
    }
})();