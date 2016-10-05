(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = [];

    /* @ngInject */
    function TrackFactory() {
        var service = {
            addTrack: addTrack
        };
        return service;

        ////////////////

        function addTrack(track) {
        	return $http.post("/tracks", track);
        }
    }
})();