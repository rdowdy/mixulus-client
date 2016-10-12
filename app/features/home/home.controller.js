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
        init();
        /////////////////////

        function init() {
            // get user id
            vm.userId = localStorageService.get('userId');

            // get collabs and check which ones
            // are available to make changes
        	CollabFactory.getAllCollabs().then(function(response) {
        		vm.collabs = response.data;

                var collab;
                for(var i = 0; i < vm.collabs.length; i++) {
                    collab = vm.collabs[i];
                    console.log(collab);

                    if(collab.userIds[collab.currentUserIndex]._id == vm.userId) {
                        collab.waiting = false;
                    } else {
                        collab.waiting = true;
                    }
                }
        	});
        }

        function goToWorkspace(collab) {
            if(!collab.waiting) {
                localStorageService.set('collabId', collab._id);
                $window.open("/workspace", "_blank");
            }
        }
    }
})();