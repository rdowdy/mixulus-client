(function() {
    'use strict';

    angular
        .module('app')
        .factory('CollabFactory', CollabFactory);

    CollabFactory.$inject = ['apiUrl', '$http'];

    /* @ngInject */
    function CollabFactory(apiUrl, $http) {
        var service = {
            addCollab: addCollab,
            getAllCollabs: getAllCollabs,
            getCollabById: getCollabById,
            addTrackToCollab: addTrackToCollab,
            addUserToCollab: addUserToCollab,
            updateCollab: updateCollab,
            commitChanges: commitChanges
        };
        return service;

        ////////////////
        function addCollab(collab) {
            return $http.post(apiUrl + "/collabs", collab);
        }

        function getAllCollabs() {
        	return $http.get(apiUrl + "/collabs");
        }

        function getCollabById(id) {
            return $http.get(apiUrl + "/collabs/" + id);
        }

        function addTrackToCollab(collabId, trackId) {
            return $http.post(apiUrl + "/collabs/" + collabId + "/tracks/" + trackId);
        }

        function addUserToCollab(collabId, userId) {
            return $http.post(apiUrl + "/collabs/" + collabId + "/" + userId)
        }

        function updateCollab(collab) {
            // strip out unnecessities
            var newCollab = stripCollab(collab);
            return $http.put(apiUrl + "/collabs/" + newCollab._id, newCollab)
        }

        // POST to collabs/:collabId/commit
        // will signal the server that this user
        // is done making changes, and to pass the collab
        // off to the next user
        function commitChanges(collab) {
            return $http.post(apiUrl + "/collabs/commit/" + collab._id);
        }

        function stripCollab(collab) {
            // custom set up the object
            // because we don't want to include all the sound
            return {
                _id: collab._id,
                name: collab.name,
                startDate: collab.startDate,
                completed: collab.completed
            };
        }
    }
})();