(function() {
    'use strict';

    angular
        .module('app')
        .service('EncoderService', EncoderService);

    EncoderService.$inject = [];

    /* @ngInject */
    function EncoderService() {
        this.func = func;

        ////////////////

        function func() {
        }
    }
})();