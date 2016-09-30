(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = ['localStorageService'];

    /* @ngInject */
    function WorkspaceController(localStorageService) {
        var vm = this;
        
        ////////////////

        console.log(localStorageService.get('collabId'));
    }
})();