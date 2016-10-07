(function() {
    'use strict';

    angular
        .module('app')
        .factory('SoundFactory', SoundFactory);

    SoundFactory.$inject = ['$http'];

    /* @ngInject */
    function SoundFactory($http) {
        var service = {
            addSound: addSound
        };
        return service;

        ////////////////

        function addSound(sound) {
        	return $http.post("/sounds", sound);
        }
    }
})();