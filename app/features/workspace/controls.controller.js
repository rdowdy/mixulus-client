(function() {
    'use strict';

    angular
        .module('app')
        .controller('ControlsController', ControlsController);

    ControlsController.$inject = ['$window', '$rootScope', 'RecorderFactory'];

    /* @ngInject */
    function ControlsController($window, $rootScope, RecorderFactory) {
        var vm = this;

        vm.toggleRecord = toggleRecording;
        vm.toggleBlob = toggleBlob;

        vm.audioBlob = null;

        function setupDownload(blob, filename) {
            console.log("setting up download");
            var url = ($window.URL || $window.webkitURL).createObjectURL(blob);
            vm.audioBlob = {
            	href: url
            };

            var player = new $window.Audio();
            player.src = url;
            var blob = {
                player: player,
                time: 0
            }

            vm.armedTrack.sounds.push({
                startMarker: 0,
                blob: blob
            });
        }

        function toggleBlob(playing, blobject) {
        	if(playing) {
        		pauseBlob(blobject);
        	} else {
        		playBlob(blobject);
        	}
        }

        function playBlob(blobject) {
        	if(blobject.player == null) {
        		var player = new $window.Audio();
	        	player.src = blobject.href;
	        	blobject.player = player;
	        	player.load();
	        	player.play();

	        	player.onended = function() {
	        		$rootScope.$broadcast('onended');
	        	}
        	} else {
        		if(blobject.player.currentTime == blobject.player.seekable.end(0)) {
        			blobject.time = 0;
        		}
    			blobject.player.currentTime = blobject.time;
        		
        		blobject.player.play();
        	}
        	
        }

        function pauseBlob(blobject) {
        	blobject.time = blobject.player.currentTime;
        	blobject.player.pause();
        }

        /* Copyright 2013 Chris Wilson

		   Licensed under the Apache License, Version 2.0 (the "License");
		   you may not use this file except in compliance with the License.
		   You may obtain a copy of the License at

		       http://www.apache.org/licenses/LICENSE-2.0

		   Unless required by applicable law or agreed to in writing, software
		   distributed under the License is distributed on an "AS IS" BASIS,
		   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
		   See the License for the specific language governing permissions and
		   limitations under the License.
		*/

        $window.AudioContext = $window.AudioContext || $window.webkitAudioContext;

        var audioContext = new AudioContext();
        var audioInput = null,
            realAudioInput = null,
            inputPoint = null,
            audioRecorder = null;
        var zeroGain = null
        var rafID = null;
        var analyserContext = null;
        var analyserNode = null;
        var canvasWidth, canvasHeight;
        var recIndex = 0;

        initAudio();

        /* TODO:

        - offer mono option
        - "Monitor input" switch
        */

        function saveAudio() {
            audioRecorder.exportWAV(doneEncoding);
            // could get mono instead by saying
            // audioRecorder.exportMonoWAV( doneEncoding );
        }

        /* CANVAS DRAWING STUFF */
        function drawBuffer( width, height, context, data ) {
            console.log('drawn');
            var step = Math.ceil( data.length / width );
            var amp = (height) / 2;
            context.fillStyle = "white";
            context.clearRect(0,0,width,height);
            for(var i=0; i < width; i++){
                var min = 1.0;
                var max = -1.0;
                for (var j=0; j<step; j++) {
                    var datum = data[(i*step)+j]; 
                    if (datum < min)
                        min = datum;
                    if (datum > max)
                        max = datum;
                }
                context.fillRect(i,(1+min)*amp,1,Math.max(1,(max-min)*amp));
            }
        }

        /************************/

        function gotBuffers(buffers) {
            console.log("gotBuffers");
            var canvas = document.getElementById("clipCanvas");
            //var canvas = document.createElement('canvas');
            //canvas.

            drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);

            // the ONLY time gotBuffers is called is right after a new recording is completed - 
            // so here's where we should set up the download.
            audioRecorder.exportWAV(doneEncoding);
        }

        function doneEncoding(blob) {
            setupDownload(blob, "myRecording" + ((recIndex < 10) ? "0" : "") + recIndex + ".wav");
            recIndex++;
        }

        function toggleRecording(recordBool, track) {
            if (!recordBool) {
                console.log("done recording");
                // stop recording
                audioRecorder.stop();
                audioRecorder.getBuffers(gotBuffers);
            } else {
                // start recording
                console.log("recording");
                vm.armedTrack = track;
                if (!audioRecorder)
                    return;
                audioRecorder.clear();
                audioRecorder.record();
            }
        }

        function convertToMono(input) {
            var splitter = audioContext.createChannelSplitter(2);
            var merger = audioContext.createChannelMerger(2);

            input.connect(splitter);
            splitter.connect(merger, 0, 0);
            splitter.connect(merger, 0, 1);
            return merger;
        }

        function toggleMono() {
            if (audioInput != realAudioInput) {
                audioInput.disconnect();
                realAudioInput.disconnect();
                audioInput = realAudioInput;
            } else {
                realAudioInput.disconnect();
                audioInput = convertToMono(realAudioInput);
            }

            audioInput.connect(inputPoint);
        }

        function gotStream(stream) {
            inputPoint = audioContext.createGain();

            // Create an AudioNode from the stream.
            realAudioInput = audioContext.createMediaStreamSource(stream);
            audioInput = realAudioInput;
            audioInput.connect(inputPoint);

            //    audioInput = convertToMono( input );

            analyserNode = audioContext.createAnalyser();
            analyserNode.fftSize = 2048;
            inputPoint.connect(analyserNode);

            audioRecorder = new RecorderFactory.Recorder(inputPoint);

            zeroGain = audioContext.createGain();
            zeroGain.gain.value = 0.0;
            inputPoint.connect(zeroGain);
            zeroGain.connect(audioContext.destination);
        }

        function initAudio() {
            if (!navigator.getUserMedia)
                navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!navigator.cancelAnimationFrame)
                navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
            if (!navigator.requestAnimationFrame)
                navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

            navigator.getUserMedia({
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }, gotStream, function(e) {
                alert('Error getting audio');
                console.log(e);
            });
        }

    }
})();
