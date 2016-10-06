(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['$http', 'ContextFactory'];

    /* @ngInject */
    function TrackFactory($http, ContextFactory) {
        var service = {
            addTrack: addTrack,
            createEmptyTrack: createEmptyTrack,
            addInitialEffectsChainToTrack: addInitialEffectsChainToTrack
        };
        return service;

        ////////////////

        ////////////////
        // DB CRUD

        function addTrack(track) {
        	return $http.post("/tracks", track);
        }

        ////////////////
        // TrackFactory helpers

        // generates an empty track with the fundamental
        // gain nodes (one for volume and one for mute/solo)
        function createEmptyTrack(name) {
            // name
            // initial gain of 100
            var initialGain = 100

            var newTrack = {
                name: name,
                gain: initialGain,
                mute: false
            }

            return newTrack;
        }

        function addInitialEffectsChainToTrack(track) {
            // inital effects chain of
            //   gainNode -> muteSoloGainNode -> destination
            var context = ContextFactory.getAudioContext();
            var volumeGainNode = context.createGain();
            var muteSoloGainNode = context.createGain();
            var initialGain = 100
            volumeGainNode.gain.value = initialGain / 100;
            muteSoloGainNode.gain.value = initialGain / 100;

            volumeGainNode.connect(muteSoloGainNode);
            muteSoloGainNode.connect(context.destination);

            track.volumeGainNode = volumeGainNode;
            track.muteSoloGainNode = muteSoloGainNode;
            track.effectsChainStart = volumeGainNode;
        }
    }
})();