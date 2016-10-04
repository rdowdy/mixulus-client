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
        var trackWidth = 215;
        var markerCenterOffset = 2;
        var markerHomeLoc = trackWidth - markerCenterOffset;
        
        vm.markerLocation = markerHomeLoc;

        $rootScope.$broadcast('markerMove', {loc: vm.markerLocation});
        //////

        vm.buffer = null;
        vm.playing = false;

        ////////////////

        $rootScope.$on("gridClick", function(event, args) {
            gridClickEvent(args.$event);
        })

        vm.toggleRecord = toggleRecording;
        vm.togglePlay = togglePlay;

        ////////////////

        function toggleRecording(recordBool, track) {
            if (!recordBool) {
                // stop recording
                var buffer = ContextFactory.stop();
                // initiate waveform draw
                var canvas = document.getElementById('clipCanvas');
                GridFactory.drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffer);
                
                // for testing
                vm.buffer = buffer;
            } else {
                // start recording
                console.log("recording");
                vm.armedTrack = track;
                // if (!audioRecorder)
                //     return;
                // audioRecorder.clear();
                // audioRecorder.record();
                ContextFactory.record();
            }
        }

        function togglePlay() {

        }

        function play() {
            ContextFactory.playAt(vm.buffer, 0);
        }

        function gridClickEvent($event) {
            var x = $event.clientX - 2;             
            vm.markerLocation = x;
            $rootScope.$broadcast('markerMove', {loc: vm.markerLocation});
        }

    }
})();
