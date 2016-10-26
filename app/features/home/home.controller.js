(function() {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$window', 'localStorageService', 'CollabFactory'];

    /* @ngInject */
    function HomeController($window, localStorageService, CollabFactory) {
        var vm = this;
        
        /////////////////////
        // Functions
        /////////////////////
        vm.goToWorkspace = goToWorkspace;
        vm.newCollab = newCollab;
        vm.refresh = getCollabs;

        init();
        /////////////////////
        // Function Definitions
        /////////////////////
        function init() {
            vm.userId = localStorageService.get('userId');
            getCollabs();
        }

        // get the list of collaborations that are available to this user
        function getCollabs() {
            // get collabs and check which ones are available to make changes
            CollabFactory.getAllCollabs().then(function(response) {
                vm.collabs = response.data;

                for(var i = 0; i < vm.collabs.length; i++) {
                    var collab = vm.collabs[i];

                    // check which are available to make changes
                    if(collab.userIds[collab.currentUserIndex]._id == vm.userId) {
                        collab.waiting = false;
                    } else {
                        collab.waiting = true;
                    }
                }
            });
        }

        // redirect to the workspace page for a collaboration
        function goToWorkspace(collab) {
            if(!collab.waiting) {
                localStorageService.set('collabId', collab._id);
                $window.location.href = "/workspace";
            }
        }

        // start a new collaboration
        function newCollab() {
            var newCollab = {
                name: "New Collab", 
                currentUserIndex: 0
            }

            CollabFactory.addCollab(newCollab).then(function(res) {
                res.data.waiting = false;
                goToWorkspace(res.data);
            });
        }
    }
})();