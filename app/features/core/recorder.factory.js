(function() {
    'use strict';

    angular
        .module('app')
        .factory('RecorderFactory', RecorderFactory);

    RecorderFactory.$inject = [];

    /* @ngInject */
    function RecorderFactory() {
        return {
            Recorder: Recorder
        }

        function Recorder(source, cfg) {
            var config = cfg || {};
            var bufferLen = config.bufferLen || 4096;
            console.log(source);
            this.context = source.context;
            if (!this.context.createScriptProcessor) {
                this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
            } else {
                this.node = this.context.createScriptProcessor(bufferLen, 2, 2);
            }
            
            var WORKER_PATH = 'features/workspace/recorder/recorderWorker.js';
            var worker = new Worker(config.workerPath || WORKER_PATH);

            worker.postMessage({
                command: 'init',
                config: {
                    sampleRate: this.context.sampleRate
                }
            });
            var recording = false,
                currCallback;

            worker.onmessage = function(e) {
            	console.log("worker callback")
                var blob = e.data;
                currCallback(blob);
            }

            this.node.onaudioprocess = function(e) {
                if (!recording) return;
                worker.postMessage({
                    command: 'record',
                    buffer: [
                        e.inputBuffer.getChannelData(0),
                        e.inputBuffer.getChannelData(1)
                    ]
                });
            }

            this.configure = function(cfg) {
                for (var prop in cfg) {
                    if (cfg.hasOwnProperty(prop)) {
                        config[prop] = cfg[prop];
                    }
                }
            }

            this.record = function() {
                console.log("inner recording");
                recording = true;
            }

            this.stop = function() {
                console.log("inner stop");
                recording = false;
            }

            this.clear = function() {
                worker.postMessage({ command: 'clear' });
            }

            this.getBuffers = function(cb) {
                console.log("getting buffers");
                console.log(worker);
                currCallback = cb || config.callback;
                worker.postMessage({ command: 'getBuffers' })
            }

            this.exportWAV = function(cb, type) {
            	console.log('exportWAV');
                currCallback = cb || config.callback;
                type = type || config.type || 'audio/wav';
                if (!currCallback) throw new Error('Callback not set');
                worker.postMessage({
                    command: 'exportWAV',
                    type: type
                });
            }

            this.exportMonoWAV = function(cb, type) {
                currCallback = cb || config.callback;
                type = type || config.type || 'audio/wav';
                if (!currCallback) throw new Error('Callback not set');
                worker.postMessage({
                    command: 'exportMonoWAV',
                    type: type
                });
            }

            source.connect(this.node);
            this.node.connect(this.context.destination); // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
        };
    }
})();
