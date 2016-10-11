(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = ['$rootScope', 'localStorageService', 'CollabFactory', 'MixFactory', 'TrackFactory', 'GridFactory'];

    /* @ngInject */
    function WorkspaceController($rootScope, localStorageService, CollabFactory, MixFactory, TrackFactory, GridFactory) {
        var vm = this;
        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        vm.selectedSound = null;
        
        ////////////////
        vm.toggleTrackArmed = toggleTrackArmed;
        vm.addTrack = addTrack;
        vm.toggleMute = toggleMute;
        vm.toggleSolo = toggleSolo;
        vm.updateCollabName = updateCollabName;
        vm.updateTrackName = updateTrackName;

        ////////////////
        getCollab();

        $rootScope.$on('onended', function() {
            vm.playing = false;
            $rootScope.$apply();
        });

        $rootScope.$on('gridClick', function(event, args) {
            gridClickEvent(args.$event);
        });

        function getCollab() {
            vm.collabId = localStorageService.get('collabId');
            
            CollabFactory.getCollabById(vm.collabId).then(function(response) {
                vm.collab = response.data;
                vm.tracks = MixFactory.initTracks(vm.collab);
            });
        }

        function toggleMute(trackNum) {
            MixFactory.toggleMute(trackNum);
        }

        function toggleSolo(trackNum) {
            MixFactory.toggleSolo(trackNum);
        }

        function toggleTrackArmed(trackNum) {
            if(vm.armedTrack == trackNum) {
                vm.armedTrack = null;
            } else {
                vm.armedTrack = trackNum;
            }
        }

        function addTrack() {
            MixFactory.addTrack();
        }

        function updateCollabName() {
            CollabFactory.updateCollab(vm.collab);
        }

        function updateTrackName(track) {
            TrackFactory.updateTrack(track);
        }

        function gridClickEvent($event) {
            // calculate track number
            var trackNum = GridFactory.getTrackNumFromY($event.clientY);

            // set selectedSound reference to sound object
            vm.selectedSound = MixFactory.getSoundFromX(trackNum, $event.clientX);
        }
        
    }
})();