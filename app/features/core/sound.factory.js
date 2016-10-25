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
            deleteSound: deleteSound,
            getSoundById: getSoundById,
            updateSound: updateSound
        };
        return service;

        ////////////////

        // POST /sounds
        function addSound(sound) {
        	return $http.post("/sounds", sound);
        }

        // DELETE /sounds/:soundId
        function deleteSound(sound) {
            return $http.delete("/sounds/" + sound._id);
        }

        // GET /sounds/:soundId
        // note: this may take a while since it will also send the buffer
        function getSoundById(soundId) {
            return $http.get("/sounds/" + soundId);
        }

        // PUT /sounds/:soundId
        function updateSound(sound) {
            sound = stripSound(sound);
            return $http.put("/sounds/" + sound._id, sound);
        }

        // prepare the sound object for the database
        function stripSound(sound) {
            return {
                _id: sound._id,
                filePath: sound.filePath,
                fps: sound.fps,
                frameLength: sound.frameLength,
                gridLocation: sound.gridLocation,
                track: sound.track,
                trackId: sound.trackId
            }
        }
    }
})();