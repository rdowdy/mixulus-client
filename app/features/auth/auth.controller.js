(function() {
    'use strict';

    angular
        .module('app')
        .controller('AuthController', AuthController);

    AuthController.$inject = ['$http', '$window', 'localStorageService'];

    /* @ngInject */
    function AuthController($http, $window, localStorageService) {
        var vm = this;

        /////////////////////
        // Functions
        /////////////////////
        vm.login = login;
        vm.signup = signup;

        /////////////////////
        // Function Definitions
        /////////////////////
        ///////////
        // LOGIN
        ///////////
        function login() {
            var user = {
                "username": vm.loginUsername,
                "password": vm.loginPassword
            };

            // POST username/password to /login
            // then POST again to /authenticate to get JWT token
            $http.post("/login", user).then(function(res) {
                if (res.data.success == true) {
                    // now get the JWT token for API endpoint
                    $http.post('/authenticate', user).then(function(jwtRes) {
                        if (jwtRes.data.success == true) {
                            // localStorageService will allow me to access token and userId
                            // from other pages in the app
                            localStorageService.set('token', jwtRes.data.token);
                            localStorageService.set('userId', res.data.user._id);
                            $window.location.href = "/home";
                        } else {
                            vm.loginError = "Unable to log in due to server error. Please try again later.";
                        }
                    })

                } else {
                    vm.loginError = "Incorrect username/password. Please try again.";
                }
            }, function(err) {
                vm.loginError = "Incorrect username/password. Please try again.";
            });
        }

        ///////////
        // SIGNUP
        ///////////
        function signup() {
            var newUser = {
                "username": vm.signupUsername,
                "password": vm.signupPassword
            }

            if(vm.signupPassword != vm.signupPasswordConfirm) {
                vm.signupError = "Your passwords don't match!";
            } else {

                // POST username/password to /signup
                // then POST again to /authenticate to get JWT
                $http.post("/signup", newUser).then(function(res) {
                    if(res.data.success == true) {
                        $http.post("/authenticate", newUser).then(function(jwtRes) {
                            if(jwtRes.data.success == true) {
                                // localStorageService will allow me to access token and userId
                                // from other pages in the app
                                localStorageService.set('token', jwtRes.data.token);
                                localStorageService.set('userId', res.data.user._id);
                                $window.location.href = "/home";
                            } else {
                                vm.signupError = "Unable to log in due to server error. Please try again later.";
                            }
                        });
                    }
                    
                }, function(err) {
                    vm.signupError = "That username is already taken. Please try another one!";
                })
            }
        }
    }
})();
