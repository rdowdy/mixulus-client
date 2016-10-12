(function() {
    'use strict';

    angular
        .module('app')
        .controller('DialogController', DialogController);

    DialogController.$inject = ['$http', '$scope', 'CollabFactory', 'localStorageService'];

    /* @ngInject */
    function DialogController($http, $scope, CollabFactory, localStorageService) {
        var vm = this;
        vm.title = 'DialogController';

        vm.addUserToCollab = addUserToCollab;

        ////////////////

        function addUserToCollab(username) {
        	$http.get("/users/search/" + username).then(function(res) {
        		if(res.data._id != null) {
        			var collabId = localStorageService.get('collabId');
        			CollabFactory.addUserToCollab(collabId, res.data._id).then(function(res) {
        				$scope.closeThisDialog();
        			});
        		}
        	});
        }
    }
})();
