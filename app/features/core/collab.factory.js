(function() {
    'use strict';

    angular
        .module('app')
        .factory('CollabFactory', CollabFactory);

    CollabFactory.$inject = ['apiUrl', '$http'];

    /* @ngInject */
    function CollabFactory(apiUrl, $http) {
        var service = {
            getAllCollabs: getAllCollabs
        };
        return service;

        ////////////////

        function getAllCollabs() {
        	return $http.get(apiUrl + "/collabs");
        }
    }
})();