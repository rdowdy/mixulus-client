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
            getCollabById: getCollabById
        };
        return service;

        ////////////////

        function getAllCollabs() {
        	return $http.get(apiUrl + "/collabs");
        }

        function getCollabById(id) {
            return $http.get(apiUrl + "/collabs/" + id);
        }
    }
})();