(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = ['$rootScope', 'localStorageService', 'CollabFactory', 'TrackFactory'];

    /* @ngInject */
    function WorkspaceController($rootScope, localStorageService, CollabFactory, TrackFactory) {
        var vm = this;
        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        
        ////////////////
        vm.toggleTrackArmed = toggleTrackArmed;
        vm.addTrack = addTrack;
        vm.toggleMute = toggleMute;
        vm.toggleSolo = toggleSolo;

        ////////////////
        getCollab();

        $rootScope.$on('onended', function() {
            vm.playing = false;
            $rootScope.$apply();
        });

        function getCollab() {
            vm.collabId = localStorageService.get('collabId');
            
            CollabFactory.getCollabById(vm.collabId).then(function(response) {
                vm.collab = response.data;
                vm.tracks = TrackFactory.initTracks(vm.collab);
                console.log(vm.tracks);
            });
        }

        function toggleMute(trackNum) {
            TrackFactory.toggleMute(trackNum);
        }

        function toggleSolo(trackNum) {
            TrackFactory.toggleSolo(trackNum);
        }

        function toggleTrackArmed(trackNum) {
            if(vm.armedTrack == trackNum) {
                vm.armedTrack = null;
            } else {
                vm.armedTrack = trackNum;
            }
        }

        function addTrack() {
            vm.push(TrackFactory.addTrack());
        }
        
    }
})();