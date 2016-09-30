(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = ['localStorageService', 'CollabFactory'];

    /* @ngInject */
    function WorkspaceController(localStorageService, CollabFactory) {
        var vm = this;
        
        ////////////////
        getCollab();

        function getCollab() {
            var collabId = localStorageService.get('collabId');
            
            CollabFactory.getCollabById(collabId).then(function(response) {
                vm.collabMeta = response.data;
            });
        }
        
    }
})();