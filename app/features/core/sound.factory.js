(function() {
    'use strict';

    angular
        .module('app')
        .factory('SoundFactory', SoundFactory);

    SoundFactory.$inject = ['$http'];

    /* @ngInject */
    function SoundFactory($http) {
        var service = {
            addSound: addSound,
            getSoundById: getSoundById,
            updateSound: updateSound,
            deleteSound: deleteSound
        };
        return service;

        ////////////////

        function addSound(sound) {
        	return $http.post("/sounds", sound);
        }

        function getSoundById(soundId) {
            return $http.get("/sounds/" + soundId);
        }

        function updateSound(sound) {
            return $http.put("/sounds/" + sound._id, sound);
        }

        function deleteSound(sound) {
            return $http.delete("/sounds/" + sound._id);
        }
    }
})();