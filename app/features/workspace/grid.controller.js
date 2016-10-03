(function() {
    'use strict';

    angular
        .module('app')
        .controller('GridController', GridController);

    GridController.$inject = [];

    /* @ngInject */
    function GridController() {
        var vm = this;
 		
        var trackWidth = 215;
        var markerCenterOffset = 2;
      	var markerHomeLoc = trackWidth - markerCenterOffset;

 		vm.markerLocation = markerHomeLoc;
 		////////////////
 		vm.gridClickEvent = gridClickEvent;
 		////////////////

 		//drawAudioClipAt(0, 200);

 		function drawAudioClipAt(trackNum, gridLocation) {
 			var gridRulerHeightPx = 15;
 			var trackHeightPx = 100;
 			var fromTopPx = gridRulerHeightPx + (trackNum * trackHeightPx);
 			var fromLeftPx = gridLocation;

 			var canvas = document.createElement('canvas');
 			var div = document.createElement('div');
 			var grid = document.getElementById('grid');

 			div.className += " audioClip";

 			div.style.width = 100;
 			div.style.height = trackHeightPx;
 			div.style.position = 'relative';
 			div.style.top = "'" + fromTopPx + "'";
 			div.style.left = fromLeftPx;
 			canvas.className += " clipCanvas"

 			div.appendChild(canvas);
 			grid.appendChild(div);
 		}

 		function gridClickEvent($event) {
 			var x = $event.clientX - 2; 			
 			vm.markerLocation = x;
 		}       
    }
})();