(function() {
    'use strict';

    angular
        .module('app')
        .factory('GridFactory', GridFactory);

    GridFactory.$inject = ['$window', '$rootScope'];

    /* @ngInject */
    function GridFactory($window, $rootScope) {
        var gridRulerHeight = 15;
        var topNavHeight = 60;
        var borderHeight = 1;
        var trackHeight = 100;
        var trackListWidth = 215;

        var dragStartX = 0;
        var trackStart = 0;
        var dragEndX = 0;

        document.getElementById('grid').addEventListener('dragover', dragover)
        document.getElementById('grid').addEventListener('drop', drop);

        ///////////

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

            // set up drag and drop
            div.setAttribute('draggable', true);
            div.addEventListener('dragstart', dragstart);
            div.addEventListener('dragend', dragend);

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

        function dragstart(e) {
            dragStartX = e.target.offsetLeft;
            trackStart = getTrackNumFromY(e.target.offsetTop);
            return false;
        }

        function dragover(e) {
            e.preventDefault();
            return false;
        }

        function drop(e) {
            e.stopPropagation();
            return false;
        }

        function dragend(e) {
            ///////////////////////////
            // Move the sound clip 

            ////////
            // x-axis movement
            dragEndX = e.clientX;
            var dragDelta = dragEndX - dragStartX;

            // move the clip in the x direction
            var leftOffset = parseInt(e.target.style.left);
            leftOffset += dragDelta;

            // check left bound
            if(leftOffset < trackListWidth) {
                leftOffset = trackListWidth;
            }

            e.target.style.left = leftOffset + 'px';

            ////////
            // check for y-axis movement
            var dragEndY = e.clientY;
            dragEndY = dragEndY - topNavHeight - gridRulerHeight;

            // calculate track number based on y-axis movement
            var trackNum = Math.floor((dragEndY + (dragEndY % trackHeight)) / trackHeight) - 1;

            if(trackNum < 0) trackNum = 0;

            e.target.style.top = 
            gridRulerHeight + topNavHeight + (trackNum * trackHeight) + 'px';

            ///////////////////////////
            // Save the new position of the sound clip
            $rootScope.$broadcast("sounddrag", {
                newLoc: leftOffset,
                newTrack: trackNum,
                dragStartX: dragStartX,
                trackStart: trackStart
            })
            
            $rootScope.$broadcast("refreshPlay");

            return false;
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