(function() {
    'use strict';

    angular
        .module('app')
        .controller('GridController', GridController);

    GridController.$inject = ['$rootScope'];

    /* @ngInject */
    function GridController($rootScope) {
        var vm = this;

 		////////////////
        // marker location stuff
        $rootScope.$on('markerMove', function(e, args) {
            vm.markerLocation = args.loc;
        })
 		vm.gridClickEvent = gridClickEvent;
 		////////////////

 		function gridClickEvent(event) {
            $rootScope.$broadcast('gridClick', {$event: event})
        }       
    }
})();