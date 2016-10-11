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
                if (res.data.success == true) {
                    // now get the JWT token for API endpoint
                    $http.post('/authenticate', user).then(function(jwtRes) {
                        if (jwtRes.data.success == true) {
                            localStorageService.set('token', jwtRes.data.token);
                            localStorageService.set('userId', res.data.user._id);
                            $window.location.href = "/home";
                        } else {
                            // some sort of JWT error
                        }
                    })

                } else {
                    // some sort of login error
                }
            });

            //$http.post("/login", user);
        }

        function signup() {

        }
    }
})();