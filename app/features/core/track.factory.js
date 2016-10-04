(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['localStorageService', 'ContextFactory'];

    /* @ngInject */
    function TrackFactory(localStorageService, ContextFactory) {
    	////////////////
    	// variables 
        var tracks = [];

        ////////////////
        // functions
        var service = {
        	getTracks: getTracks,
            addAudioToTrack: addAudioToTrack,
            playAt: playAt
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

        function playAt(baseOffset, markerOffset, fps) {
        	var context = ContextFactory.getAudioContext();
        	var track = tracks[0];
        	for(var i = 0; i < track.sounds.length; i++) {
        		var sound = track.sounds[i];

        		var soundStart = sound.gridLocation - baseOffset;
        		soundStart /= fps;

        		var startTime = soundStart + context.currentTime;
        		ContextFactory.playAt(sound.buffer, startTime);
        	}

        }
    }
})();