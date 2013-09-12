(function(exports) {
	var gameStates = function(factoryCallback, socket) {
		var stack = [],
			paused = false;
		return {
			current: function() {
				return stack.length > 0 ? stack[stack.length - 1] : {};
			},
			pause: function(on) {
				paused = on;
				$.each(stack, function(state) {
					state.onPause(on);
				});
			},
			pop: function() {
				var oldState = null;
				if(stack.length > 0) {
					oldState = stack.pop();
					oldState.onDestroy();
				}
				if(stack.length > 0) {
					stack[stack.length - 1].onActivate();
				}
				return oldState;
			},
			push: function(state, data) {
				if(stack.length > 0) {
					stack[stack.length - 1].onDeactivate();
				}
				var newState = factoryCallback(state, data, this, socket);
				stack.push(newState);
				newState.onActivate();
			},
			swap: function(state) {
				var oldState = this.pop();
				this.push(state);
				return oldState;
			},
			update: function(fps) {
				$.each(stack, function(state, index) {
					state.onUpdate(index == stack.length - 1, fps);
				});
			}
		};
	};

	exports.gameStates = gameStates;
})(window, $);