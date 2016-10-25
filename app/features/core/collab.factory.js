(function() {
    'use strict';

    angular
        .module('app')
        .factory('CollabFactory', CollabFactory);

    CollabFactory.$inject = ['apiUrl', '$http'];

    /* @ngInject */
    function CollabFactory(apiUrl, $http) {
        
        /////////////////////
        // Functions
        /////////////////////
        var service = {
            addCollab: addCollab,
            addTrackToCollab: addTrackToCollab,
            addUserToCollab: addUserToCollab,
            commitChanges: commitChanges,
            getAllCollabs: getAllCollabs,
            getCollabById: getCollabById,
            updateCollab: updateCollab
        };
        return service;

        /////////////////////
        // Function Definitions
        /////////////////////

        // POST /collabs
        function addCollab(collab) {
            return $http.post(apiUrl + "/collabs", stripCollab(collab));
        }

        // POST /collabs/:collabId/tracks/:trackId
        function addTrackToCollab(collabId, trackId) {
            return $http.post(apiUrl + "/collabs/" + collabId + "/tracks/" + trackId);
        }

        // POST //collabs/:collabId/:userId
        function addUserToCollab(collabId, userId) {
            return $http.post(apiUrl + "/collabs/" + collabId + "/" + userId)
        }

        // POST to collabs/:collabId/commit
        function commitChanges(collab) {
            // signals that this user is done making changes
            return $http.post(apiUrl + "/collabs/commit/" + collab._id);
        }

        // GET /collabs
        function getAllCollabs() {
        	return $http.get(apiUrl + "/collabs");
        }

        // GET /collabs/:collabId
        function getCollabById(id) {
            return $http.get(apiUrl + "/collabs/" + id);
        }

        // PUT /collabs/:collabId
        function updateCollab(collab) {
            // strip out unnecessities
            var newCollab = stripCollab(collab);
            return $http.put(apiUrl + "/collabs/" + newCollab._id, newCollab)
        }

        function stripCollab(collab) {
            // custom set up the object
            // because we don't want to include all the sound
            return {
                _id: collab._id,
                completed: collab.completed,
                currentUserIndex: collab.currentUserIndex,
                name: collab.name,
                startDate: collab.startDate
            };
        }
    }
})();