(function() {
    'use strict';

    angular
        .module('app')
        .controller('DialogController', DialogController);

    DialogController.$inject = ['$http','CollabFactory', 'localStorageService'];

    /* @ngInject */
    function DialogController($http, CollabFactory, localStorageService) {
        var vm = this;
        vm.title = 'DialogController';

        vm.addUserToCollab = addUserToCollab;

        ////////////////

        getUsers();

        function getUsers() {
            vm.collabId = localStorageService.get('collabId');
            CollabFactory.getCollabById(vm.collabId).then(function(res) {
                vm.users = res.data;
            })
        }

        function addUserToCollab(username) {
        	$http.get("/users/search/" + username).then(function(res) {
        		if(res.data._id != null) {
        			CollabFactory.addUserToCollab(vm.collabId, res.data._id).then(function(res) {
                        vm.users.userIds.push({username: username});
                        vm.addUsername = "";
        			});
        		}
        	});
        }
    }
})();
