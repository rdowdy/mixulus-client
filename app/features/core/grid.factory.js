(function() {
    'use strict';

    angular
        .module('app')
        .factory('GridFactory', GridFactory);

    GridFactory.$inject = [];

    /* @ngInject */
    function GridFactory() {
        var gridRulerHeight = 15;
        var topNavHeight = 60;
        var borderHeight = 1;
        var trackHeight = 100;

        var service = {
            getTrackNumFromY: getTrackNumFromY,
            drawBuffer: drawAudioBuffer,
            createCanvas: createCanvas,
            removeSound: removeSound
        };
        return service;


        ////////////////

        // based on a y location in the grid
        // return the track number this location is correlates to
        function getTrackNumFromY(y) {
            y = y - gridRulerHeight - topNavHeight;
            y /= trackHeight;
            return Math.floor(y);
        }

        function createCanvas(trackNum, gridLocation, length) {
            var grid = document.getElementById('grid');
            var div = document.createElement('div');

            div.classList += " audioClip";
            div.style.width = length + 'px';
            div.style.left = gridLocation + 'px';
            
            div.style.top = gridRulerHeight + topNavHeight + (trackNum * trackHeight) + 'px';

            var canvas = document.createElement('canvas');
            canvas.classList += " clipCanvas";

            div.appendChild(canvas);
            grid.appendChild(div);

            return canvas;
        }

        function removeSound(canvas) {
            var div = canvas.parentNode;
            var grid = div.parentNode;

            grid.removeChild(div);
        }

        /* CANVAS DRAWING STUFF */
        function drawAudioBuffer( width, height, context, data ) {
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
    }
})();