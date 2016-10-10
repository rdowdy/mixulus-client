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
        vm.signup = signup;

        ////////////////

        function login() {
        	var user = {
        		"username": vm.loginUsername,
        		"password": vm.loginPassword
        	};

        	$http.post("/login", user).then(function(res) {
        		if(res.data.success == true) {
                    localStorageService.set('userId', res.data.user._id);
        			$window.location.href = "/home";
        		} else {
        			// some sort of error
        		}
        	});

            //$http.post("/login", user);
        }

        function signup() {

        }
    }
})();