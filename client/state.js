(function(exports) {
	var gameStates = function(current, factoryCallback) {
		var stack = [],
			paused = false;
		return {
			pause: function(on) {
				paused = on;
				$.each(stack, function(state) {
					state.onPause(on);
				});
			},
			pop: function() {
				var oldState = stack.pop();
				oldState.onDestroy();
				stack[stack.length - 1].onActivate();
				return oldState;
			},
			push: function(state) {
				stack[stack.length - 1].onDeactivate();
				var newState = factoryCallback(state, this);
				stack.push(newState);
				newState.onActivate();
			},
			swap: function(state) {
				var oldState = this.pop();
				this.push(state);
				return oldState;
			},
			update: function() {
				$.each(stack, function(state, index) {
					state.onUpdate(index == stack.length - 1);
				});
			}
		};
	};

	exports.gameStates = gameStates;
})(window, $);