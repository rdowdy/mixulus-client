(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = [
        '$window', '$rootScope', 'localStorageService', 'CollabFactory',
        'MixFactory', 'TrackFactory', 'GridFactory', 'SoundFactory', 'ngDialog'
    ];

    /* @ngInject */
    function WorkspaceController($window, $rootScope, localStorageService, CollabFactory, MixFactory, TrackFactory, GridFactory, SoundFactory, ngDialog) {
        var vm = this;

        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        vm.selectedSound = {};

        ////////////////
        vm.toggleTrackArmed = toggleTrackArmed;
        vm.addTrack = addTrack;
        vm.addUser = addUserDialog;
        vm.keydown = keydown;
        vm.toggleMute = toggleMute;
        vm.toggleSolo = toggleSolo;
        vm.updateCollabName = updateCollabName;
        vm.updateTrackName = updateTrackName;
        vm.commit = commit;
        vm.addUserToCollab = addUserToCollab;

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

            }, function(err) {
                console.log(err);
                if(err.status == 403) {
                    // forbidden, not authorized, 
                    // redirect to home
                    $window.location.href = "/home";
                }
            });
        }

        function toggleMute(trackNum) {
            MixFactory.toggleMute(trackNum);
        }

        function toggleSolo(trackNum) {
            MixFactory.toggleSolo(trackNum);
        }

        function toggleTrackArmed(trackNum) {
            if (vm.armedTrack == trackNum) {
                vm.armedTrack = null;
            } else {
                vm.armedTrack = trackNum;
            }
        }

        function addTrack() {
            MixFactory.addTrack();
        }

        function addUserDialog() {
            // open a modal to get user input
            ngDialog.open({
                templateUrl: 'features/dialog/addUser.tmpl.html',
                controller: "DialogController",
                controllerAs: "dialog"
            });
        }

        function addUserToCollab() {
            console.log("did it work");
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

            // regardless of whether something is selected
            // remove the selected class from all elements
            var elems = document.getElementsByClassName('selected');
            for (var i = 0; i < elems.length; i++) {
                var elem = elems[i];

                elem.className =
                    elem.className.replace(/\bselected\b/, '');
            }

            if (vm.selectedSound.sound != null) {
                // add 'selected' class to selected sound canvas
                vm.selectedSound.canvas.classList += " selected";
            } 
        }

        function keydown($event) {
            // handle delete keypress
            if ($event.keyCode == 8) {
                if (vm.selectedSound.sound != null) {
                    // remove from DB
                    SoundFactory.deleteSound(vm.selectedSound.sound);
                    // remove from mix
                    MixFactory.deleteSound(vm.selectedSound.sound);
                    // remove from grid ui
                    GridFactory.removeSound(vm.selectedSound.canvas);
                }
            }
        }

        function commit() {
            CollabFactory.commitChanges(vm.collab).then(function(res) {
                // redirect back to homepage
                $window.location.href = "/home";
            });
        }

    }
})();
