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

        function initializeRecording() {

        }

        /////////////////////
    	// Recording
    	/////////////////////

        /////////////////////
    	// Playback
    	/////////////////////

    	/////////////////////
    	// Socket Comm
    	/////////////////////

        return service;
    }
})();