(function() {
    'use strict';

    angular
        .module('app')
        .controller('WorkspaceController', WorkspaceController);

    WorkspaceController.$inject = ['$rootScope', 'localStorageService', 'CollabFactory'];

    /* @ngInject */
    function WorkspaceController($rootScope, localStorageService, CollabFactory) {
        var vm = this;
        vm.recording = false;
        vm.tracks = [];
        vm.armedTrack = 0;
        
        ////////////////
        vm.toggleTrackArmed = toggleTrackArmed;


        ////////////////
        getCollab();

        $rootScope.$on('onended', function() {
            vm.playing = false;
            $rootScope.$apply();
        });

        function getCollab() {
            var collabId = localStorageService.get('collabId');
            
            CollabFactory.getCollabById(collabId).then(function(response) {
                vm.collabMeta = response.data;
                
                var sound;
                for(var i = 0; i < vm.collabMeta.soundIds.length; i++) {
                    sound = vm.collabMeta.soundIds[i];

                    if(vm.tracks[sound.track] == null) {
                        vm.tracks[sound.track] = {};
                        vm.tracks[sound.track].sounds = [];
                    }
                    

                    vm.tracks[sound.track].sounds.push(sound);
                    //TODO: set up blob for tracks coming in from the DB
                }
            });
        }

        function toggleTrackArmed(trackNum) {
            if(vm.armedTrack == trackNum) {
                vm.armedTrack = null;
            } else {
                vm.armedTrack = trackNum;
            }
        }
        
    }
})();