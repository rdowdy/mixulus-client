(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['$http', 'ContextFactory'];

    /* @ngInject */
    function TrackFactory($http, ContextFactory) {

        /////////////////////
        // Functions
        /////////////////////
        var service = {
            addInitialEffectsChainToTrack: addInitialEffectsChainToTrack,
            addTrack: addTrack,
            createEmptyTrack: createEmptyTrack,
            updateTrack: updateTrack
        };
        return service;

        /////////////////////
        // Function Definitions
        /////////////////////

        function addTrack(track) {
        	return $http.post("/tracks", track);
        }

        // generates an empty track with the fundamental
        // gain nodes (one for volume and one for mute/solo)
        function createEmptyTrack(name) {
            var initialGain = 100

            var newTrack = {
                name: name,
                gain: initialGain
            }

            return newTrack;
        }

        function updateTrack(track) {
            track = stripTrack(track);
            return $http.put("/tracks/" + track._id, track);
        }

        /////////////////////
        // Helpers
        /////////////////////
        function addInitialEffectsChainToTrack(track) {
            // inital effects chain of
            //   gainNode -> muteSoloGainNode -> destination
            var context = ContextFactory.getAudioContext();
            var volumeGainNode = context.createGain();
            var muteSoloGainNode = context.createGain();

            volumeGainNode.gain.value = 1.0;
            muteSoloGainNode.gain.value = 1.0;

            volumeGainNode.connect(muteSoloGainNode);
            muteSoloGainNode.connect(context.destination);

            track.volumeGainNode = volumeGainNode;
            track.muteSoloGainNode = muteSoloGainNode;
            track.effectsChainStart = volumeGainNode;

            track.mute = false;
        }

        // prepare track object for DB
        function stripTrack(track) {
            return {
                _id: track._id,
                gain: track.gain,
                name: track.name
            }
        }
    }
})();