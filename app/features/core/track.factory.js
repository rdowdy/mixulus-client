(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['localStorageService'];

    /* @ngInject */
    function TrackFactory(localStorageService) {
    	////////////////
    	// variables 
        var tracks = [];

        ////////////////
        // functions
        var service = {
        	getTracks: getTracks,
            addAudioToTrack: addAudioToTrack
        };
        return service;


        ////////////////
        function getTracks() {
        	return tracks;
        }

        function addAudioToTrack(num, buffer, gridLocation) {
        	if(tracks[num] == null) {
        		tracks[num] = {};
        	}

        	if(tracks[num].sounds == null) {
        		tracks[num].sounds = [];
        	}

        	var track = tracks[num];
        	track.sounds.push({
        		track: num,
        		gridLocation: gridLocation,
        		collabId: localStorageService.get('collabId'),
        		buffer: buffer
        	})

        }
    }
})();