(function() {
    'use strict';

    angular
        .module('app')
        .controller('ControlsController', ControlsController);

    ControlsController.$inject = ['$window', '$rootScope', 'ContextFactory', 'GridFactory'];

    /* @ngInject */
    function ControlsController($window, $rootScope, ContextFactory, GridFactory) {
        var vm = this;

        //////
        // marker location stuff
        var fps = 35;
        var trackWidth = 215;
        var markerCenterOffset = 1;
        var markerHomeLoc = trackWidth - markerCenterOffset;
        
        vm.markerLocation = markerHomeLoc;

        $rootScope.$broadcast('markerMove', {loc: vm.markerLocation});
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

        ////////////////

        function toggleRecording(recordBool, track) {
            if (!recordBool) {
                // stop recording
                var buffer = ContextFactory.stop();
                var startLoc = vm.recordMeta.startLoc;
                // initiate waveform draw
                //var framesPerSample = (fps * (1 / ContextFactory.getAudioContext().sampleRate))
                //var canvasLen = framesPerSample * buffer.length;
                //canvasLen = Math.round(canvasLen);
                var canvasLen = vm.markerLocation - startLoc;
                var canvas = GridFactory.createCanvas(0, startLoc, canvasLen);
                GridFactory.drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffer);
                
                // for testing
                vm.buffer = buffer;

                clearInterval(vm.intervalId);
            } else {
                // start recording
                console.log("recording");
                
                ContextFactory.record();
                vm.recordMeta.startLoc = vm.markerLocation;
                vm.intervalId = setInterval(moveMarker, 1000 / fps);
            }
        }

        function togglePlay() {
            if(!vm.playing) {
                play();
                vm.intervalId = setInterval(moveMarker, 1000 / fps);
            } else {
                pause();
                clearInterval(vm.intervalId);
            }
        }

        function play() {
            ContextFactory.playAt(vm.buffer, 0);
        }

        function pause() {

        }

        function skipHome() {
            vm.markerLocation = markerHomeLoc;
            $rootScope.$broadcast('markerMove', {loc: vm.markerLocation});
        }

        function skipEnd() {

        }

        function gridClickEvent($event) {
            var x = $event.clientX - markerCenterOffset;             
            vm.markerLocation = x;
            $rootScope.$broadcast('markerMove', {loc: vm.markerLocation});
        }

        function moveMarker() {
            $rootScope.$broadcast('markerMove', {loc: ++vm.markerLocation});
            $rootScope.$apply();
        }

    }
})();
