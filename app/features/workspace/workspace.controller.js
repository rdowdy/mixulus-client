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
        vm.adjustTrackVolume = adjustTrackVolume;
        vm.trackListUpdated = trackListUpdated;

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
                if (err.status == 403) {
                    // forbidden, not authorized, 
                    // redirect to home
                    $window.location.href = "/home";
                }
            });

            if (!Modernizr.hiddenscroll) {
                var mixContainer = document.getElementById('mixBoard');
                console.log("scrollbar!");
                var height = mixContainer.offsetHeight;
                height -= 17;
                mixContainer.style.height = height + "px";

                // do the same for the location marker
                var locationMarker = document.getElementById("locationMarker");
                height = locationMarker.offsetHeight;
                height -= 17;
                locationMarker.style.height = height + "px";
            }
        }

        function toggleMute(trackNum) {
            MixFactory.toggleMute(trackNum);
        }

        function toggleSolo(trackNum) {
            MixFactory.toggleSolo(trackNum);
        }

        function adjustTrackVolume(track) {
            MixFactory.adjustTrackVolume(track);
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

        function trackListUpdated() {
            /////////////////
            // check to see if the grid marker
            // needs to be extended
            var trackList = document.getElementById("grid");
            var locationMarker = document.getElementById("locationMarker");
            var mixContainer = document.getElementById("mixBoard");

            console.log(trackList.offsetHeight);

            if (trackList.offsetHeight > mixContainer.offsetHeight) {
                locationMarker.style.height = trackList.offsetHeight + "px";
            }
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
            // chrome was recording pageY coordinates weirdly, 
            // so im gonna calculate y-coord using clientY + scrollTop
            var yCoord = $event.clientY;
            var mixContainer = document.getElementById('mixBoard');
            yCoord += mixContainer.scrollTop;

            // calculate track number
            var trackNum = GridFactory.getTrackNumFromY(yCoord);

            // set selectedSound reference to sound object
            vm.selectedSound.sound = MixFactory.getSoundFromX(trackNum, $event.pageX);
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

                    $rootScope.$broadcast("refreshPlay");
                }
            }

            // handle left/right arrow keypresses
            if ($event.keyCode == 37 || $event.keyCode == 39) {
                if (vm.selectedSound.sound != null) {
                    var xDirection;
                    if ($event.keyCode == 37) {
                        xDirection = -1;
                    } else {
                        xDirection = 1;
                    }

                    var div = vm.selectedSound.canvas.parentNode;
                    var leftOffset = parseInt(div.style.left);
                    leftOffset += xDirection;
                    div.style.left = leftOffset + "px";
                    vm.selectedSound.sound.gridLocation += xDirection;

                    $rootScope.$broadcast("refreshPlay");
                    // update sound in the DB

                    // reconstruct the sound obj for the DB because we don't 
                    // want to resend the audio buffer
                    var soundToSave = {
                        "_id": vm.selectedSound.sound._id,
                        "trackId": vm.selectedSound.sound.trackId,
                        "fps": vm.selectedSound.sound.fps,
                        "gridLocation": vm.selectedSound.sound.gridLocation,
                        "track": vm.selectedSound.sound.track,
                        "filePath": vm.selectedSound.sound.filePath,
                        "frameLength": vm.selectedSound.sound.frameLength
                    }

                    SoundFactory.updateSound(soundToSave);
                    MixFactory.updateEndMarker(vm.selectedSound.sound);
                }
            }

            // handle space keypress
            if ($event.keyCode == 32) {
                $rootScope.$broadcast("togglePlay");

                $event.preventDefault();
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
