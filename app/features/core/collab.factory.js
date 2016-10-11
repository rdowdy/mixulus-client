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
            addTrackToCollab: addTrackToCollab,
            updateCollab: updateCollab
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

        function updateCollab(collab) {
            // custom set up the object to send out
            // because we don't want to include all the sound
            // buffers in this request .. they aren't necessary
            var newCollab = {
                _id: collab._id,
                name: collab.name,
                startDate: collab.startDate,
                completed: collab.completed
            }
            return $http.put(apiUrl + "/collabs/" + newCollab._id, newCollab)
        }
    }
})();