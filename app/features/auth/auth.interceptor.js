(function() {
    'use strict';

    angular
        .module('app')
        .factory('AuthInterceptor', AuthInterceptor);

    AuthInterceptor.$inject = ['$q', 'localStorageService'];

    /* @ngInject */
    function AuthInterceptor($q, localStorageService) {
        var service = {
            request: request
        };
        return service;

        ////////////////

        function request(config) {            
            config.headers = config.headers || {};
            var token = localStorageService.get('token');

            if(token) {
                config.headers['x-access-token'] = token;
            }

            return config;
        }
    }
})();