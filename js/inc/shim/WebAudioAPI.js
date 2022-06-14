/**
 * @license -------------------------------------------------------------------
 *   module: WebAudioShim - Fix naming issues for WebAudioAPI supports
 *      src: https://github.com/Dinahmoe/webaudioshim
 * -------------------------------------------------------------------
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext || null;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext || null;

(function (Context) {
	var isFunction = function (f) {
		return Object.prototype.toString.call(f) === "[object Function]" ||
			Object.prototype.toString.call(f) === "[object AudioContextConstructor]";
	};
	var contextMethods = [
		["createGainNode", "createGain"],
		["createDelayNode", "createDelay"],
		["createJavaScriptNode", "createScriptProcessor"]
	];
	///
	var proto;
	var instance;
	var sourceProto;
	///
	if (!isFunction(Context)) {
		return;
	}
	instance = new Context();
	if (!instance.destination || !instance.sampleRate) {
		return;
	}
	proto = Context.prototype;
	sourceProto = Object.getPrototypeOf(instance.createBufferSource());

	if (!isFunction(sourceProto.start)) {
		if (isFunction(sourceProto.noteOn)) {
			sourceProto.start = function (when, offset, duration) {
				switch (arguments.length) {
					case 0:
						throw new Error("Not enough arguments.");
					case 1:
						this.noteOn(when);
						break;
					case 2:
						if (this.buffer) {
							this.noteGrainOn(when, offset, this.buffer.duration - offset);
						} else {
							throw new Error("Missing AudioBuffer");
						}
						break;
					case 3:
						this.noteGrainOn(when, offset, duration);
				}
			};
		}
	}

	if (!isFunction(sourceProto.noteOn)) {
		sourceProto.noteOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.noteGrainOn)) {
		sourceProto.noteGrainOn = sourceProto.start;
	}

	if (!isFunction(sourceProto.stop)) {
		sourceProto.stop = sourceProto.noteOff;
	}

	if (!isFunction(sourceProto.noteOff)) {
		sourceProto.noteOff = sourceProto.stop;
	}

	contextMethods.forEach(function (names) {
		var name1;
		var name2;
		while (names.length) {
			name1 = names.pop();
			if (isFunction(this[name1])) {
				this[names.pop()] = this[name1];
			} else {
				name2 = names.pop();
				this[name1] = this[name2];
			}
		}
	}, proto);
})(window.AudioContext);
