(function() {
    'use strict';

    angular
        .module('app')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$window', 'localStorageService', 'CollabFactory'];

    /* @ngInject */
    function HomeController($window, localStorageService, CollabFactory) {
        var vm = this;
        
        vm.goToWorkspace = goToWorkspace;
        vm.newCollab = newCollab;
        vm.refresh = getCollabs;

        /////////////////////
        init();
        /////////////////////

        function init() {
            // get user id
            vm.userId = localStorageService.get('userId');
            getCollabs();
        }

        function getCollabs() {
            // get collabs and check which ones
            // are available to make changes
            CollabFactory.getAllCollabs().then(function(response) {
                vm.collabs = response.data;

                var collab;
                for(var i = 0; i < vm.collabs.length; i++) {
                    collab = vm.collabs[i];
                    //console.log(collab);

                    if(collab.userIds[collab.currentUserIndex]._id == vm.userId) {
                        collab.waiting = false;
                    } else {
                        collab.waiting = true;
                    }
                }
            });
        }

        function newCollab() {
            var newCollab = {
                name: "New Collab", 
                currentUserIndex: 0
            }

            CollabFactory.addCollab(newCollab).then(function(res) {
                console.log(res.data);
                res.data.waiting = false;
                goToWorkspace(res.data);
            });
        }

        function goToWorkspace(collab) {
            if(!collab.waiting) {
                localStorageService.set('collabId', collab._id);
                $window.location.href = "/workspace";
            }
        }
    }
})();