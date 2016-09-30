(function() {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['CollabFactory', '$window'];

    /* @ngInject */
    function HomeController(CollabFactory, $window) {
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
        	$window.location.href = "/workspace";
        }
    }
})();