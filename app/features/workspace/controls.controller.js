(function() {
    'use strict';

    angular
        .module('app')
        .controller('ControlsController', ControlsController);

    ControlsController.$inject = [
        '$window', '$rootScope', 'ContextFactory',
        'GridFactory', 'MixFactory', 'SoundFactory', 'TrackFactory'
    ];

    /* @ngInject */
    function ControlsController($window, $rootScope, ContextFactory, GridFactory, MixFactory, SoundFactory, TrackFactory) {
        var vm = this;

        ////////////////
        // Functions

        vm.toggleRecord = toggleRecording;
        vm.togglePlay = togglePlay;
        vm.skipHome = skipHome;
        vm.skipEnd = skipEnd;

        ////////////////

        ////////////////
        // Variables

        //////
        // animation
        var fps = 30;
        var fpsInterval = 1000 / fps;
        var stop = false;
        var startTime, now, then, elapsed;

        //////
        // marker location stuff
        var trackWidth = 215;
        var markerCenterOffset = 1;
        var markerHomeLoc = trackWidth;

        vm.markerLocation = markerHomeLoc;

        $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });
        
        $rootScope.$on("gridClick", function(event, args) {
            gridClickEvent(args.$event);
        })

        $rootScope.$on("refreshPlay", function() {
            if(vm.playing) {
                pause();
                play();
            }
        })

        //////

        vm.buffer = null;
        vm.playing = false;

        //////
        // recording
        vm.recordMeta = {};


        ////////////////
        // Function Definitions
        ////////////////

        // record if recordBool is true, stop recording otherwise
        // this is the recording entry point
        function toggleRecording(recordBool, trackNum) {
            if (!recordBool) {
                vm.recording = false;
                // stop recording
                ContextFactory.stop(doneRecording, trackNum);

            } else {
                // before we start recording, create a new
                // sound entry in the DB
                SoundFactory.addSound({
                    track: trackNum,
                    gridLocation: vm.markerLocation,
                    trackId: MixFactory.getTracks()[trackNum]._id,
                    fps: fps
                }).then(function(res) {
                    vm.recording = true;

                    // some meta information about the current recording session
                    vm.recordMeta.soundId = res.data._id;
                    vm.recordMeta.soundModel = res.data;
                    vm.recordMeta.startLoc = vm.markerLocation;


                    // start recording
                    ContextFactory.record(vm.recordMeta.soundId);

                    // only initiate moveMarker animation if the collab was paused
                    // aka the marker wasnt moving
                    if (!vm.playing) {
                        vm.intervalId = setInterval(moveMarker, 1000 / fps);
                    } 
                })
            }
        }

        // callback for when the buffers are retrieved after the recording is done
        // this function will: 
        // 1. create a new canvas element and place it on the grid
        // 2. draw the audio bufer onto that canvas
        // 3. add the sound to the track in the MixFactory 
        function doneRecording(buffer, trackNum) {
            // the visual length of the clip is based on the
            // distance traversed by the marker
            var startLoc = vm.recordMeta.startLoc;
            var canvasLen = vm.markerLocation - startLoc;

            var canvas = GridFactory.createCanvas(trackNum, startLoc, canvasLen);
            GridFactory.drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffer);

            clearInterval(vm.intervalId);

            MixFactory.addAudioToTrack(trackNum, buffer, startLoc, canvasLen, fps, vm.recordMeta.soundModel);
        }

        // play the audio and trigger marker move animation
        function togglePlay() {
            if (!vm.playing) {
                play();

                stop = false;
                fpsInterval = 1000 / fps;
                then = Date.now();
                startTime = then;
                animate();
            } else {
                pause();
                stop = true;
            }
        }

        function play() {
            MixFactory.playAt(markerHomeLoc, vm.markerLocation, fps);
        }

        function pause() {
            MixFactory.stopAudio();
        }

        function skipHome() {
            var unpause = false;
            if (vm.playing) {
                pause();
                unpause = true;
            }

            vm.markerLocation = markerHomeLoc;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });

            if (unpause) {
                play();
            }
        }

        function skipEnd() {
            // MixFactory will provide the end loc based on all the tracks
            vm.markerLocation = MixFactory.getEndMarker();

            // edge case where MixFactory "end" is at 0
            if (vm.markerLocation == 0) {
                vm.markerLocation = markerHomeLoc;
            }

            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });

            if (vm.playing) {
                pause();
                stop = true;
            }
        }

        function gridClickEvent($event) {
            if (vm.recording) {
                return;
            }

            var unpause = false;
            if (vm.playing) {
                pause();
                unpause = true;
            }
            var x = $event.clientX - markerCenterOffset;
            vm.markerLocation = x;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });
            if (unpause) {
                play();
            }
        }

        function animate() {
            if (!stop) {
                // request another frame

                requestAnimationFrame(animate);

                // calc elapsed time since last loop

                now = Date.now();
                elapsed = now - then;

                // if enough time has elapsed, draw the next frame

                if (elapsed > fpsInterval) {

                    // Get ready for next frame by setting then=now, but also adjust for your
                    // specified fpsInterval not being a multiple of RAF's interval (16.7ms)
                    then = now - (elapsed % fpsInterval);

                    moveMarker();
                }
            }
        }

        function moveMarker() {
            $rootScope.$emit('markerMove', { loc: ++vm.markerLocation });
            $rootScope.$apply();
        }
    }
})();
