(function() {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['CollabFactory', '$window', 'localStorageService'];

    /* @ngInject */
    function HomeController(CollabFactory, $window, localStorageService) {
        var vm = this;
        
        vm.goToWorkspace = goToWorkspace;

        /////////////////////
        getCollabs();
        /////////////////////

        function getCollabs() {
        	CollabFactory.getAllCollabs().then(function(response) {
        		vm.collabs = response.data;
        	});
        }

        function goToWorkspace(collabId) {
        	localStorageService.set('collabId', collabId);
        	$window.location.href = "/workspace";
        }
    }
})();