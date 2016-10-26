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

        //////////////////////////
        // Functions
        //////////////////////////
        vm.skipEnd = skipEnd;
        vm.skipHome = skipHome;
        vm.togglePlay = togglePlay;
        vm.toggleRecord = toggleRecording;
        
        //////////////////////////
        // Functions
        //////////////////////////
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

        //////
        // recording
        vm.buffer = null;
        vm.recordingSession = {};

        //////
        // playback
        vm.playing = false;

        //////////////////////////
        // Root Scope Listeners
        //////////////////////////
        $rootScope.$on("gridClick", function(event, args) {
            gridClickEvent(args.$event);
        });

        // reset audio buffers to reflect any new changes
        $rootScope.$on("refreshPlay", refreshPlay);

        $rootScope.$on("togglePlay", function() {
            togglePlay();
            vm.playing = !vm.playing;
        });

        // toggle only if already playing
        $rootScope.$on("toggleIfPlaying", function() {
            if(vm.playing) {
                togglePlay();
                vm.playing = false;
            }
        });

        //////////////////////////
        // Function Definitions
        //////////////////////////

        ////////////////
        // Recording
        ////////////////

        // record if recordBool is true, stop recording otherwise
        // NOTE: this is the recording entry point
        function toggleRecording(recordBool, trackNum) {
            if (!recordBool) {
                vm.recording = false;
                vm.recordingSession.endLoc = vm.markerLocation;
                // stop recording
                ContextFactory.stop(doneRecording, trackNum);

            } else {
                // before we start recording, create a new sound entry in the DB
                SoundFactory.addSound({
                    track: trackNum,
                    trackId: MixFactory.getTracks()[trackNum]._id,
                    fps: fps
                }).then(function(res) {
                    // some meta information about the current recording session
                    vm.recordingSession.soundId = res.data._id;
                    vm.recordingSession.soundModel = res.data;
                    // start recording
                    ContextFactory.record(vm.recordingSession.soundId, recordingReadyStart);
                })
            }
        }

        // this function is called when the server is ready to record
        function recordingReadyStart() {
            vm.recording = true;
            vm.recordingSession.startLoc = vm.markerLocation;
            if (!vm.playing) {
                togglePlay();
                vm.playing = true;
            } 
        }

        // callback for when the buffers are retrieved after the recording is done
        // this function will: 
        // 1. create a new canvas element and place it on the grid
        // 2. draw the audio bufer onto that canvas
        // 3. add the sound to the track in the MixFactory 
        function doneRecording(buffer, trackNum) {
            // the visual length of the clip is based on the distance traversed by the marker
            var canvasLen = vm.recordingSession.endLoc - vm.recordingSession.startLoc;

            // create the canvas and draw the audio buffer onto it
            var canvas = GridFactory.createCanvas(trackNum, vm.recordingSession.startLoc, canvasLen);
            GridFactory.drawBuffer(canvas, buffer);

            // add audio buffer to trakc
            MixFactory.addAudioToTrack(trackNum, buffer, vm.recordingSession.startLoc, canvasLen, fps, vm.recordingSession.soundModel);

            // stop playback if playing
            if(vm.playing) {
                togglePlay();
                vm.playing = false;
            }
        }

        ////////////////
        // Playback
        ////////////////

        // play the audio and trigger marker move animation
        function togglePlay() {
            if (!vm.playing) {
                if(!vm.recording && vm.markerLocation >= MixFactory.getEndMarker()) {
                    skipHome();
                }

                play();

                // set up marker animation
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

        function refreshPlay() {
            if(vm.playing) {
                pause();
                play();
            }
        }

        function pause() {
            MixFactory.stopAudio();
        }

        // send the grid marker back to its home position, reset playback to reflect this change
        function skipHome() {
            vm.markerLocation = markerHomeLoc;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });

            refreshPlay();
        }

        // skip the grid marker to the end, and stop playback if playing
        function skipEnd() {
            // MixFactory will provide the end loc based on all the tracks
            vm.markerLocation = MixFactory.getEndMarker();

            // edge case where MixFactory "end" is at 0
            if (vm.markerLocation == 0) {
                vm.markerLocation = markerHomeLoc;
            }

            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });

            if (vm.playing) {
                togglePlay();
                vm.playing = false;
            }
        }

        // move the marker based on grid click location
        function gridClickEvent($event) {
            if (vm.recording) {
                return;
            }

            // don't register a grid click unless its past the track list
            if($event.pageX < 215) {
                return;
            }

            var x = $event.pageX - markerCenterOffset;
            vm.markerLocation = x;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });
            refreshPlay();
        }

        // request animation frame
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

        // move the marker incrementally forward
        function moveMarker() {
            if(vm.markerLocation >= MixFactory.getEndMarker() && !vm.recording) {
                // if we're at the end of the song and we're NOT recording, hit pause
                togglePlay();
                vm.playing = false;
                $rootScope.$apply();
            } else {
                $rootScope.$emit('markerMove', { loc: ++vm.markerLocation });
                $rootScope.$apply();
            }
        }
    }
})();
