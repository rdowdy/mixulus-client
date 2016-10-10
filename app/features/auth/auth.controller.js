(function() {
    'use strict';

    angular
        .module('app')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$http', '$window', 'localStorageService'];

    /* @ngInject */
    function AuthController($http, $window, localStorageService) {
        var vm = this;
        vm.login = login;

        ////////////////

        function login() {
        	var user = {
        		"email": vm.loginUsername,
        		"password": vm.loginPassword
        	};

        	$http.post("/authenticate", user).then(function(res) {
        		if(res.data.success == true) {
        			console.log(res.data.token);
        			localStorageService.set('token', res.data.token);
        		} else {
        			// some sort of error
        		}
        	});
        }

        function signup() {

        }
    }
})();