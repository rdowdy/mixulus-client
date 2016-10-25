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
                            vm.loginError = "Unable to log in due to server error.";
                        }
                    })

                } else {
                    vm.loginError = "Incorrect username/password. Please try again.";
                }
            }, function(err) {
                vm.loginError = "Incorrect username/password. Please try again.";
            });
        }

        function signup() {
            var newUser = {
                "username": vm.signupUsername,
                "password": vm.signupPassword
            }

            if(vm.signupPassword != vm.signupPasswordConfirm) {
                alert("Your passwords don't match!");
            } else {

                $http.post("/signup", newUser).then(function(res) {
                    if(res.data.success == true) {
                        $http.post("/authenticate", newUser).then(function(jwtRes) {
                            if(jwtRes.data.success == true) {
                                localStorageService.set('token', jwtRes.data.token);
                                localStorageService.set('userId', res.data.user._id);
                                $window.location.href = "/home";
                            } else {
                                // some sort of JWT error
                            }
                        });
                    }
                    
                })
            }
        }
    }
})();
