(function(exports) {
	exports.stateFactory = function(stateName, data, stateMachine, socket) {
		switch(stateName) {
			case "gameList":
				return exports.states.gameList(data, stateMachine, socket);
			case "gameLobby":
				return exports.states.gameLobby(data, stateMachine, socket);
			case "game":
				return exports.states.game(data, stateMachine, socket);
		}
	};
})(window);