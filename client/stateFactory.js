(function(exports) {
	exports.stateFactory = function(stateName, data, stateMachine, socket) {
		switch(stateName) {
			case "gameList":
				return exports.gameList(data, stateMachine, socket);
			case "gameLobby":
				return exports.gameLobby(data, stateMachine, socket);
			case "game":
				return {
					onActivate: function() {
						$('#gameWrapper').attr('style', 'display:block');
						$('#headerWrapper').attr('style', 'display:block');
						alert('game started');
					},
					onDeactivate: function () {
						$('#gameWrapper').attr('style', 'display:none');
						$('#headerWrapper').attr('style', 'display:none');
					},
					onDestroy: function() {

					},
					onPause: function(on) {

					},
					onUpdate: function(isTop) {
						
					}
				};
				break;
		}
	};
})(window);