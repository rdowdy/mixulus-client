(function() {
    'use strict';

    angular
        .module('app')
        .factory('TrackFactory', TrackFactory);

    TrackFactory.$inject = ['localStorageService', 'ContextFactory'];

    /* @ngInject */
    function TrackFactory(localStorageService, ContextFactory) {
        ////////////////
        // variables 
        var tracks = [];

        ////////////////
        // functions
        var service = {
            getTracks: getTracks,
            addAudioToTrack: addAudioToTrack,
            playAt: playAt,
            stopAudio: stopAudio,
            getEndMarker: getEndMarker
        };
        return service;


        ////////////////
        function getTracks() {
            if (tracks.length == 0) {
                tracks[0] = {
                    name: "Track 0",
                    sounds: []
                };

                tracks[1] = {
                    name: "Track 1",
                    sounds: []
                }
            }
            return tracks;
        }

        function addAudioToTrack(num, buffer, gridLocation, frameLength) {
            if (tracks[num] == null) {
                tracks[num] = {};
            }

            if (tracks[num].sounds == null) {
                tracks[num].sounds = [];
            }

            var track = tracks[num];
            track.sounds.push({
                track: num,
                gridLocation: gridLocation,
                frameLength: frameLength,
                collabId: localStorageService.get('collabId'),
                buffer: buffer
            })

        }

        function playAt(gridBaseOffset, markerOffset, fps) {
            var context = ContextFactory.getAudioContext();

            for (var trackNum = 0; trackNum < tracks.length; trackNum++) {
                var track = tracks[trackNum];
                for (var i = 0; i < track.sounds.length; i++) {
                    var sound = track.sounds[i];
                    var audioStartLoc = sound.gridLocation;
                    var audioEndLoc = audioStartLoc + sound.frameLength;

                    if (markerOffset >= audioEndLoc) {
                        continue;
                    } else if (markerOffset > audioStartLoc && markerOffset < audioEndLoc) {
                        var frameOffset = markerOffset - audioStartLoc;
                        // sampleOffset = (frames) * (seconds / frame) * (samples / second) = samples
                        var sampleOffset = frameOffset * (1 / fps) * (context.sampleRate);
                        var buffer = sound.buffer.slice(sampleOffset, sound.buffer.length);

                        ContextFactory.playAt(buffer, 0);
                    } else {
                        var soundStart = sound.gridLocation - markerOffset;
                        soundStart /= fps;

                        var startTime = soundStart + context.currentTime;
                        ContextFactory.playAt(sound.buffer, startTime);
                    }
                }
            }

        }

        function stopAudio() {
            ContextFactory.stopAudio();
        }

        // find the grid location of the end of the last sound
        function getEndMarker() {
            var latestLoc = 0;

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];
                for (var j = 0; j < track.sounds.length; j++) {
                    var sound = track.sounds[j];
                    var endOfSound = sound.gridLocation + sound.frameLength;
                    if (endOfSound > latestLoc) {
                        latestLoc = endOfSound;
                    }
                }
            }

            return latestLoc;
        }

    }
})();
