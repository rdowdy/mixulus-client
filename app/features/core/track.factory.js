(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['$http'];

    /* @ngInject */
    function TrackFactory($http) {
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