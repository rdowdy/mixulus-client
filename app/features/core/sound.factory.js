(function() {
    'use strict';

    angular
        .module('app')
        .factory('SoundFactory', SoundFactory);

    SoundFactory.$inject = [];

    /* @ngInject */
    function SoundFactory() {
        var service = {
            addSound: addSound
        };
        return service;

        ////////////////

        function addSound() {
        	// do stuff
        }
    }
})();