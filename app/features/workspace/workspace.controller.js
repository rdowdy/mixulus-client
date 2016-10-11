(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = 
        [
        '$rootScope', 'localStorageService', 'CollabFactory', 
        'MixFactory', 'TrackFactory', 'GridFactory', 'SoundFactory'
        ];

    /* @ngInject */
    function WorkspaceController($rootScope, localStorageService, CollabFactory, MixFactory, TrackFactory, GridFactory, SoundFactory) {
        var vm = this;

        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        vm.selectedSound = {};
        
        ////////////////
        vm.toggleTrackArmed = toggleTrackArmed;
        vm.addTrack = addTrack;
        vm.keydown = keydown;
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
            vm.selectedSound.sound = MixFactory.getSoundFromX(trackNum, $event.clientX);
            vm.selectedSound.canvas = $event.target;

            if(vm.selectedSound.sound != null) {                
                // remove 'selected' class from others
                var elems = document.getElementsByClassName("selected");
                for(var i = 0; i < elems.length; i++) {
                    var elem = elems[i];

                    elem.className =
                    elem.className.replace(/\bselected\b/,'');
                }

                // add 'selected' class to selected sound canvas
                vm.selectedSound.canvas.classList += " selected";
            }
        }

        function keydown($event){
            // handle delete keypress
            if($event.keyCode == 8) {
                if(vm.selectedSound.sound != null) {
                    // remove from DB
                    SoundFactory.deleteSound(vm.selectedSound.sound);
                    // remove from mix
                    MixFactory.deleteSound(vm.selectedSound.sound);
                    // remove from grid ui
                    GridFactory.removeSound(vm.selectedSound.canvas);
                }
            }
        }
        
    }
})();