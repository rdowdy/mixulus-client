(function() {
    'use strict';

    angular
        .module('app')
        .factory('GridFactory', GridFactory);

    GridFactory.$inject = [];

    /* @ngInject */
    function GridFactory() {
        var service = {
            drawBuffer: drawAudioBuffer,
            createCanvas: createCanvas
        };
        return service;


        ////////////////

        function createCanvas(trackNum, gridLocation, length) {
            var grid = document.getElementById('grid');
            var div = document.createElement('div');
            div.classList += " audioClip";
            div.style.width = length + 'px';
            div.style.left = gridLocation + 'px';

            var canvas = document.createElement('canvas');
            canvas.classList += " clipCanvas";

            div.appendChild(canvas);
            grid.appendChild(div);

            return canvas;
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