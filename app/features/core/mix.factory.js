(function() {
    'use strict';

    angular
        .module('app')
        .factory('MixFactory', MixFactory);

    MixFactory.$inject = [
        '$q', 'localStorageService',
        'CollabFactory', 'ContextFactory',
        'TrackFactory', 'SoundFactory'
    ];

    /* @ngInject */
    function MixFactory($q, localStorageService, CollabFactory, ContextFactory, TrackFactory, SoundFactory) {
        ////////////////
        // Array diff
        Array.prototype.diff = function(a) {
            return this.filter(function(i) {
                return a.indexOf(i) < 0;
            });
        };

        ////////////////
        // variables
        var collabId;
        var tracks = [];
        var soloedTracks = [];

        var dbGainUnity = 100;

        var latestLoc = 0;

        ////////////////
        // functions
        var service = {
            addAudioToTrack: addAudioToTrack,
            addTrack: addTrack,
            getEndMarker: getEndMarker,
            initTracks: initTracks,
            playAt: playAt,
            stopAudio: stopAudio,
            toggleMute: toggleMute,
            toggleSolo: toggleSolo
        }

        return service;
        ////////////////

        // set an internal reference to the tracks
        // if there are no tracks, create one
        function initTracks(collab) {
            collabId = collab._id;

            if (collab.trackIds.length == 0) {
                addTrack();
            } else {
                tracks = collab.trackIds;
            }

            // set up volume gain node
            // and mutesolo gain node
            for (var i = 0; i < tracks.length; i++) {
                TrackFactory.addInitialEffectsChainToTrack(tracks[i]);
            }

            return tracks;
        }

        // add an empty track to the collab
        function addTrack() {
            var track = TrackFactory.createEmptyTrack("Audio Track");

            TrackFactory.addTrack(track).then(function(res) {
                var trackFromDB = res.data;
                CollabFactory.addTrackToCollab(collabId, res.data._id).then(function(res) {
                    TrackFactory.addInitialEffectsChainToTrack(trackFromDB);
                    tracks.push(trackFromDB);
                });
            });
        }

        function toggleMute(trackNum) {
            //console.log("toggle mute");
            var track = tracks[trackNum];
            if (track.mute == true) {
                track.mute = false;
                track.muteSoloGainNode.gain.value = 1.0;
            } else {
                track.mute = true;
                track.muteSoloGainNode.gain.value = 0;
            }
        }

        function toggleSolo(trackNum) {
            var idx = soloedTracks.indexOf(tracks[trackNum]);
            if (idx >= 0) {
                soloedTracks.splice(idx, 1);

                if (soloedTracks.length > 0) {
                    tracks[trackNum].muteSoloGainNode.gain.value = 0;
                } else {
                    console.log('yes');
                    for (var i = 0; i < tracks.length; i++) {
                        if (tracks[i].mute == false) {
                            console.log('unmuting');
                            tracks[i].muteSoloGainNode.gain.value = 1.0;
                        }
                    }
                }
            } else {
                soloedTracks.push(tracks[trackNum]);

                // do we check for a mute here?
                tracks[trackNum].muteSoloGainNode.gain.value = 1.0;

                // mute nonsoled tracks
                var nonSoloed = tracks.diff(soloedTracks);
                for (var i = 0; i < nonSoloed.length; i++) {
                    nonSoloed[i].muteSoloGainNode.gain.value = 0;
                }
            }

        }

        function addAudioToTrack(num, buffer, gridLocation, frameLength) {
            if (tracks[num].soundIds == null) {
                tracks[num].soundIds = [];
            }

            var track = tracks[num];

            // db add sound to track
            // then add returned sound to tracks[num].soundIds
            SoundFactory.addSound();

            track.soundIds.push({
                trackId: track._id,
                gridLocation: gridLocation,
                frameLength: frameLength,
                collabId: collabId,
                buffer: buffer
            })

            // check to see if this is the end of the song
            // for skipEnd functionality
            if (gridLocation + frameLength > latestLoc) {
                latestLoc = gridLocation + frameLength;
            }
        }

        // play all audio tracks from the marker onward
        function playAt(gridBaseOffset, markerOffset, fps) {
            var context = ContextFactory.getAudioContext();

            // if there are tracks on solo
            // then play only those
            var iterateOver = tracks;
            // if(soloedTracks.length > 0) {
            //     iterateOver = soloedTracks;
            // } else {
            //     iterateOver = tracks;
            // }

            for (var trackNum = 0; trackNum < iterateOver.length; trackNum++) {
                var track = iterateOver[trackNum];
                //if(track.mute == true) continue;

                for (var i = 0; i < track.soundIds.length; i++) {
                    var sound = track.soundIds[i];
                    var audioStartLoc = sound.gridLocation;
                    var audioEndLoc = audioStartLoc + sound.frameLength;

                    if (markerOffset >= audioEndLoc) {
                        continue;
                    } else if (markerOffset > audioStartLoc && markerOffset < audioEndLoc) {
                        var frameOffset = markerOffset - audioStartLoc;
                        // sampleOffset = (frames) * (seconds / frame) * (samples / second) = samples
                        var sampleOffset = frameOffset * (1 / fps) * (context.sampleRate);
                        var buffer = sound.buffer.slice(sampleOffset, sound.buffer.length);

                        ContextFactory.playAt(buffer, track.effectsChainStart, 0);
                    } else {
                        var soundStart = sound.gridLocation - markerOffset;
                        soundStart /= fps;

                        var startTime = soundStart + context.currentTime;
                        ContextFactory.playAt(sound.buffer, track.effectsChainStart, startTime);
                    }
                }
            }
        }

        function stopAudio() {
            ContextFactory.stopAudio();
        }

        function getEndMarker() {
            return latestLoc;
        }
    }
})();
