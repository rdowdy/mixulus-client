(function() {
    'use strict';

    angular
        .module('app')
        .controller('DialogController', DialogController);

    DialogController.$inject = ['$http','CollabFactory', 'localStorageService'];

    /* @ngInject */
    function DialogController($http, CollabFactory, localStorageService) {
        var vm = this;

        /////////////////////
        // Functions
        /////////////////////
        vm.addUserToCollab = addUserToCollab;

        getCollabInfo();
        /////////////////////
        // Function Definitions
        /////////////////////
        // add user to the collaboration only if they're not already in it
        function addUserToCollab(username) {
            $http.get("/users/search/" + username).then(function(res) {
                if(res.data._id != null && !isUserInCollab(res.data, vm.collab)) {
                    CollabFactory.addUserToCollab(vm.collabId, res.data._id).then(function(res) {
                        vm.collab.userIds.push({username: username});
                        vm.addUsername = "";
                    });
                }
            });
        }

        // get the collab info
        function getCollabInfo() {
            vm.collabId = localStorageService.get('collabId');
            CollabFactory.getCollabById(vm.collabId).then(function(res) {
                vm.collab = res.data;
            });
        }

        // check by ID if a user is in a collaboration
        function isUserInCollab(user, collab) {
            for(var i = 0; i < collab.userIds.length; i++) {
                if(collab.userIds[i]._id == user._id) {
                    return true;
                }
            }

            return false;
        }
    }
})();
