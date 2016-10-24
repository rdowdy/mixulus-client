(function() {
    'use strict';

    angular
        .module('app')
        .factory('ProjectModelFactory', ProjectModelFactory);

    ProjectModelFactory.$inject = ['localStorageService', 'CollabFactory', 'AudioGraphFactory'];

    /* @ngInject */
    function ProjectModelFactory(localStorageService, CollabFactory, AudioGraphFactory) {
    	/////////////////////
    	// Functions
    	/////////////////////
        var service = {
            getModelRef: getModelRef
        };

        /////////////////////
    	// Variables
    	/////////////////////
    	var projectModel;

		/////////////////////
    	// Initialize
    	/////////////////////
        activate();

        /////////////////////
    	// Activate & Getter
    	/////////////////////
        function activate() {
        	CollabFactory.getCollabById(localStorageService.get('collabId')).then(function(res) {
        		projectModel = res.data;
        	});
        }

        function getModelRef() {
        	return projectModel;
        }

        /////////////////////
    	// Track Manipulation
    	/////////////////////
    	function trackAdd() {

    	}

    	function trackAddSound() {

    	}

    	function trackChangeVolume(trackNum, volume) {

    	}

    	function trackMuteToggle(trackNum) {

    	}

    	function trackSoloToggle(trackNum) {

    	}

    	function trackDelete(trackNum) {

    	}

    	/////////////////////
    	// Sound Manipulation
    	/////////////////////
    	function soundMove(sound) {

    	}

    	function soundDelete(sound) {

    	}

        return service;
    }
})();