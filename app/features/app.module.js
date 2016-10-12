(function() {
    'use strict';

    angular
        .module('app', ['LocalStorageModule', 'ngDialog'])
        .config(function($httpProvider) {
			$httpProvider.interceptors.push('AuthInterceptor');
        })
        .value('apiUrl', '');
})();