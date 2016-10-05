(function() {
    'use strict';

    angular
        .module('app')
        .controller('ControlsController', ControlsController);

    ControlsController.$inject = ['$window', '$rootScope', 'ContextFactory', 'GridFactory', 'TrackFactory'];

    /* @ngInject */
    function ControlsController($window, $rootScope, ContextFactory, GridFactory, TrackFactory) {
        var vm = this;

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

        vm.buffer = null;
        vm.playing = false;

        //////
        // recording
        vm.recordMeta = {};

        ////////////////
        // Function defs

        $rootScope.$on("gridClick", function(event, args) {
            gridClickEvent(args.$event);
        })

        vm.toggleRecord = toggleRecording;
        vm.togglePlay = togglePlay;
        vm.skipHome = skipHome;
        vm.skipEnd = skipEnd;

        ////////////////

        function toggleRecording(recordBool, trackNum) {
            if (!recordBool) {
                vm.recording = false;
                // stop recording
                var buffer = ContextFactory.stop();
                var startLoc = vm.recordMeta.startLoc;

                // the visual length of the clip is based on the
                // distance traversed by the marker
                var canvasLen = vm.markerLocation - startLoc;
                var canvas = GridFactory.createCanvas(trackNum, startLoc, canvasLen);
                GridFactory.drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffer);

                clearInterval(vm.intervalId);

                //vm.buffer = buffer;
                TrackFactory.addAudioToTrack(trackNum, buffer, startLoc, canvasLen);

                console.log(TrackFactory.getTracks());
            } else {
                // start recording
                console.log("recording");
                vm.recording = true;

                ContextFactory.record();
                vm.recordMeta.startLoc = vm.markerLocation;

                if(!vm.playing) {
                    vm.intervalId = setInterval(moveMarker, 1000 / fps);
                }
            }
        }

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
            TrackFactory.playAt(markerHomeLoc, vm.markerLocation, fps);
        }

        function pause() {
            TrackFactory.stopAudio();
        }

        function skipHome() {
            var unpause = false;
            if(vm.playing) {
                pause();
                unpause = true;
            }

            vm.markerLocation = markerHomeLoc;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });
        
            if(unpause) {
                play();
            }
        }

        function skipEnd() {
            vm.markerLocation = TrackFactory.getEndMarker();
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });

            if(vm.playing) {
                pause();
                stop = true;
            }
        }

        function gridClickEvent($event) {
            if(vm.recording) {
                return;
            }

            var unpause = false;
            if(vm.playing) {
                pause();
                unpause = true;
            }
            var x = $event.clientX - markerCenterOffset;
            vm.markerLocation = x;
            $rootScope.$broadcast('markerMove', { loc: vm.markerLocation });
            if(unpause) {
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
