(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = [
        '$window', '$timeout', '$rootScope', 'localStorageService', 'ContextFactory', 'CollabFactory',
        'MixFactory', 'TrackFactory', 'GridFactory', 'SoundFactory', 'ngDialog'
    ];

    /* @ngInject */
    function WorkspaceController($window, $timeout, $rootScope, localStorageService, ContextFactory, CollabFactory, MixFactory, TrackFactory, GridFactory, SoundFactory, ngDialog) {
        var vm = this;

        //////////////////////////
        // Functions
        //////////////////////////
        vm.addTrack = addTrack;
        vm.addUser = addUserDialog;
        vm.adjustTrackVolume = adjustTrackVolume;
        vm.commit = commit;
        vm.editCollabKeyDown  = editCollabKeyDown;
        vm.editTrackKeyDown = editTrackKeyDown;
        vm.focusOnCollabNameInput = focusOnCollabNameInput
        vm.focusOnTrackNameInput = focusOnTrackNameInput;
        vm.keydown = keydown;
        vm.toggleMute = toggleMute;
        vm.toggleSolo = toggleSolo;
        vm.toggleTrackArmed = toggleTrackArmed;
        vm.trackListUpdated = trackListUpdated;
        vm.updateCollabName = updateCollabName;
        vm.updateTrackName = updateTrackName;

        //////////////////////////
        // Variables
        //////////////////////////
        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        vm.selectedSound = {};
        vm.disableUserActions = false;

        //////////////////////////
        // Key Codes
        //////////////////////////
        var DELETE = 8;
        var LEFT_ARROW = 37;
        var RIGHT_ARROW = 39;
        var SPACE = 32;
        
        //////////////////////////
        // Root Scope Listeners
        //////////////////////////
        $rootScope.$on('onended', function() {
            vm.playing = false;
            $rootScope.$apply();
        });

        $rootScope.$on('gridClick', function(event, args) {
            gridClickEvent(args.$event);
        });


        init();
        //////////////////////////
        // Initialization
        //////////////////////////
        function init() {
            vm.collabId = localStorageService.get('collabId');

            CollabFactory.getCollabById(vm.collabId).then(function(response) {
                vm.collab = response.data;
                vm.tracks = MixFactory.initTracks(vm.collab);

            }, function(err) {
                if (err.status == 403) {
                    // forbidden, not authorized, redirect to home
                    $window.location.href = "/home";
                }
            });

            if (!Modernizr.hiddenscroll) {
                var mixContainer = document.getElementById('mixBoard');
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

        //////////////////////////
        // Track Events
        //////////////////////////
        function addTrack() {
            MixFactory.addTrack();
        }

        function adjustTrackVolume(track) {
            MixFactory.adjustTrackVolume(track);
        }

        // set focus on the track name editing input field and place cursor at the end
        function focusOnTrackNameInput($index, track) {
            $timeout(function() {
                var input = document.getElementById("track" + $index + "Input");
                input.focus();
                input.setSelectionRange(track.name.length, track.name.length);
            }, 0, false);
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

        function trackListUpdated() {
            // check to see if the grid marker height needs to be extended
            var trackList = document.getElementById("grid");
            var locationMarker = document.getElementById("locationMarker");
            var mixContainer = document.getElementById("mixBoard");

            if (trackList.offsetHeight > mixContainer.offsetHeight) {
                locationMarker.style.height = trackList.offsetHeight + "px";
            }
        }

        function updateTrackName(track) {
            TrackFactory.updateTrack(track);
        }

        //////////////////////////
        // Keypress Events
        //////////////////////////
        function editCollabKeyDown($event) {
            if($event.keyCode == 13) {
                vm.editCollabName = false;
            }
        }

        function editTrackKeyDown($event, track) {
            if($event.keyCode == 13) {
                track.editTrackName = false;
            }
        }

        function keydown($event) {
            // user actions are disabled, so get outta here
            if(vm.disableUserActions) {
                return;
            }

            switch($event.keyCode) {
                case DELETE:
                    deleteKeypress($event);
                    break;
                case LEFT_ARROW:
                case RIGHT_ARROW:
                    arrowKeypress($event);
                    break;
                case SPACE:
                    spaceKeypress($event);
                    break;
                default:
                    break;
            }
        }

        function deleteKeypress($event) {
            if (vm.selectedSound.sound != null) {
                $event.preventDefault();
                // remove from DB
                SoundFactory.deleteSound(vm.selectedSound.sound);
                // remove from mix
                MixFactory.deleteSound(vm.selectedSound.sound);
                // remove from grid ui
                GridFactory.removeCanvas(vm.selectedSound.canvas);
                // refresh playback
                $rootScope.$broadcast("refreshPlay");
            }
        }

        function arrowKeypress($event) {
            if (vm.selectedSound.sound != null) {
                $event.preventDefault();
                var xDirection;
                if ($event.keyCode == LEFT_ARROW) {
                    xDirection = -1;
                } else {
                    xDirection = 1;
                }

                // update the location of the sound
                var div = vm.selectedSound.canvas.parentNode;
                var leftOffset = parseInt(div.style.left);
                leftOffset += xDirection;
                div.style.left = leftOffset + "px";
                vm.selectedSound.sound.gridLocation += xDirection;

                // refresh playback to reflect changes
                $rootScope.$broadcast("refreshPlay");

                // update sound in the DB
                SoundFactory.updateSound(vm.selectedSound.sound);
                MixFactory.updateEndMarker(vm.selectedSound.sound);
            }
        }

        function spaceKeypress($event) {
            $event.preventDefault();
            $rootScope.$broadcast("togglePlay");
        }

        //////////////////////////
        // Collab Events
        //////////////////////////
        function addUserDialog() {
            // pause the music
            $rootScope.$broadcast("toggleIfPlaying");
            vm.disableUserActions = true;

            // open a modal to get user input
            ngDialog.open({
                templateUrl: 'features/dialog/addUser.tmpl.html',
                controller: "DialogController",
                controllerAs: "dialog"
            }).closePromise.then(function() {
                vm.disableUserActions = false;
            });
        }

        // commit changes to the collaboration
        function commit() {
            $rootScope.$broadcast("toggleIfPlaying");
            vm.disableUserActions = true;

            CollabFactory.commitChanges(vm.collab).then(function(res) {
                // redirect back to homepage
                $window.location.href = "/home";
            });
        }

        // set focus on the collab name editing input field and place cursor at the end
        function focusOnCollabNameInput() {
            $timeout(function() {
                var input = document.getElementById("collabHeaderInput");
                input.focus();
                input.setSelectionRange(vm.collab.name.length, vm.collab.name.length);
            }, 0, false);
        }

        function updateCollabName() {
            CollabFactory.updateCollab(vm.collab);
        }
        
        //////////////////////////
        // Grid Events
        //////////////////////////
        function gridClickEvent($event) {
            // user actions are disabled, so get outta here
            if(vm.disableUserActions) {
                return;
            }

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

    }
})();
