(function() {
    'use strict';

    angular
        .module('app')
        .factory('MixFactory', MixFactory);

    MixFactory.$inject = ['$q', 'localStorageService', 'CollabFactory', 'ContextFactory', 'TrackFactory'];

    /* @ngInject */
    function MixFactory($q, localStorageService, CollabFactory, ContextFactory, TrackFactory) {
        // ////////////////
        // // variables 
        // var tracks = [];
        // var soloedTracks = [];

        // ////////////////
        // // functions
        // var service = {
        //     getTracks: getTracks,
        //     addTrack: addTrack,
        //     addAudioToTrack: addAudioToTrack,
        //     playAt: playAt,
        //     stopAudio: stopAudio,
        //     getEndMarker: getEndMarker,
        //     toggleMute: toggleMute,
        //     toggleSolo: toggleSolo
        // };
        // return service;


        // ////////////////
        // function getTracks() {
        //     if (tracks.length == 0) {
        //         tracks[0] = {
        //             name: "Track 0",
        //             sounds: []
        //         };

        //         tracks[1] = {
        //             name: "Track 1",
        //             sounds: []
        //         }
        //     }
        //     return tracks;
        // }

        // function addTrack() {
        //     var newTrack = {};
        //     newTrack.name = "Track " + tracks.length;
        //     newTrack.sounds = [];
        //     tracks.push(newTrack);
        //     return newTrack;
        // }

        // function addAudioToTrack(num, buffer, gridLocation, frameLength) {
        //     if (tracks[num] == null) {
        //         tracks[num] = {};
        //     }

        //     if (tracks[num].sounds == null) {
        //         tracks[num].sounds = [];
        //     }

        //     var track = tracks[num];
        //     track.sounds.push({
        //         track: num,
        //         gridLocation: gridLocation,
        //         frameLength: frameLength,
        //         collabId: localStorageService.get('collabId'),
        //         buffer: buffer
        //     })

        // }

        // function toggleMute(trackNum) {
        //     if(tracks[trackNum].mute == true) {
        //         tracks[trackNum].mute = false;
        //     } else {
        //         tracks[trackNum].mute = true;
        //     }
        // }

        // function toggleSolo(trackNum) {
        //     var idx = soloedTracks.indexOf(tracks[trackNum]);
        //     if(idx >= 0) {
        //         soloedTracks.splice(idx, 1);
        //     } else {
        //         soloedTracks.push(tracks[trackNum]);
        //     }
        // }

        // function playAt(gridBaseOffset, markerOffset, fps) {
        //     var context = ContextFactory.getAudioContext();
            
        //     // if there are tracks on solo
        //     // then play only those
        //     var iterateOver;
        //     if(soloedTracks.length > 0) {
        //         iterateOver = soloedTracks;
        //     } else {
        //         iterateOver = tracks;
        //     }

        //     for (var trackNum = 0; trackNum < iterateOver.length; trackNum++) {
        //         var track = iterateOver[trackNum];
        //         if(track.mute == true) continue;

        //         for (var i = 0; i < track.sounds.length; i++) {
        //             var sound = track.sounds[i];
        //             var audioStartLoc = sound.gridLocation;
        //             var audioEndLoc = audioStartLoc + sound.frameLength;

        //             if (markerOffset >= audioEndLoc) {
        //                 continue;
        //             } else if (markerOffset > audioStartLoc && markerOffset < audioEndLoc) {
        //                 var frameOffset = markerOffset - audioStartLoc;
        //                 // sampleOffset = (frames) * (seconds / frame) * (samples / second) = samples
        //                 var sampleOffset = frameOffset * (1 / fps) * (context.sampleRate);
        //                 var buffer = sound.buffer.slice(sampleOffset, sound.buffer.length);

        //                 ContextFactory.playAt(buffer, 0);
        //             } else {
        //                 var soundStart = sound.gridLocation - markerOffset;
        //                 soundStart /= fps;

        //                 var startTime = soundStart + context.currentTime;
        //                 ContextFactory.playAt(sound.buffer, startTime);
        //             }
        //         }
        //     }

        // }

        // function stopAudio() {
        //     ContextFactory.stopAudio();
        // }

        // // find the grid location of the end of the last sound
        // function getEndMarker() {
        //     var latestLoc = 0;

        //     for (var i = 0; i < tracks.length; i++) {
        //         var track = tracks[i];
        //         for (var j = 0; j < track.sounds.length; j++) {
        //             var sound = track.sounds[j];
        //             var endOfSound = sound.gridLocation + sound.frameLength;
        //             if (endOfSound > latestLoc) {
        //                 latestLoc = endOfSound;
        //             }
        //         }
        //     }

        //     return latestLoc;
        // }

        ////////////////
        // variables
        var collabId;
        var tracks = [];
        var soloedTracks = [];

        var dbGainUnity = 100;

        ////////////////
        // functions
        var service = {
            initTracks: initTracks,
            addTrack: addTrack
        };

        return service;
        ////////////////

        // set an internal reference to the tracks
        // if there are no tracks, create one
        function initTracks(collab) {
            collabId = collab._id;

            if(collab.trackIds.length == 0) {
                addTrack();
            } else {
                tracks = collab.trackIds;
            }

            return tracks;   
        }

        // add an empty track to the collab
        function addTrack() {
            var track = createEmptyTrack("Audio Track");

            TrackFactory.addTrack(track).then(function(res) {
                var trackFromDB = res.data;
                CollabFactory.addTrackToCollab(collabId, res.data._id).then(function(res) {
                    tracks.push(trackFromDB);
                });
            });
        }

        // generates an empty track with the fundamental
        // gain nodes (one for volume and one for mute/solo)
        function createEmptyTrack(name) {
            // name
            // initial gain of 1.0
            // inital effects chain of
            //   gainNode -> muteSoloGainNode -> destination
            var context = ContextFactory.getAudioContext();
            var volumeGainNode = context.createGain();
            var muteSoloGainNode = context.createGain();
            var initialGain = 100
            volumeGainNode.gain.value = initialGain;
            muteSoloGainNode.gain.value = initialGain / 100;

            volumeGainNode.connect(muteSoloGainNode);
            muteSoloGainNode.connect(context.destination);

            var newTrack = {
                name: name,
                gain: initialGain,
                volumeGainNode: volumeGainNode,
                muteSoloGainNode: muteSoloGainNode,
                effectsChainStart: volumeGainNode
            }

            return newTrack;
        }
    }
})();
