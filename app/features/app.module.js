(function() {
    'use strict';

    angular
        .module('app', ['LocalStorageModule'])
        .config(function($httpProvider) {
			$httpProvider.interceptors.push('AuthInterceptor');
        })
        .value('apiUrl', '');
})();