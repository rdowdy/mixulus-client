(function() {
    'use strict';

    angular
        .module('app')
        .factory('CollabFactory', CollabFactory);

    CollabFactory.$inject = ['apiUrl', '$http'];

    /* @ngInject */
    function CollabFactory(apiUrl, $http) {
        var service = {
            getAllCollabs: getAllCollabs,
            getCollabById: getCollabById,
            addTrackToCollab: addTrackToCollab
        };
        return service;

        ////////////////

        function getAllCollabs() {
        	return $http.get(apiUrl + "/collabs");
        }

        function getCollabById(id) {
            return $http.get(apiUrl + "/collabs/" + id);
        }

        function addTrackToCollab(collabId, trackId) {
            return $http.post(apiUrl + "/collabs/" + collabId + "/tracks/" + trackId);
        }
    }
})();