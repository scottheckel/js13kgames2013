(function(exports) {
	exports.states = exports.states || {};
	exports.states.game = function(initData, stateMachine, socket) {
		var counter = null;
		return {
			onActivate: function() {
				this.resetCounter();
				$('#gameWrapper').attr('style', 'display:block');
				$('#headerWrapper').attr('style', 'display:block');
				var that = this;
				socket.on('turnComplete', function(data) {
					that.turnComplete(data);
				});
			},
			onDeactivate: function () {
				$('#gameWrapper').attr('style', 'display:none');
				$('#headerWrapper').attr('style', 'display:none');
				socket.removeAllListeners('refreshUsersList');
			},
			onDestroy: function() {

			},
			onPause: function(on) {

			},
			onUpdate: function(isTop) {
				var seconds = 30;
				if(counter) {
					seconds = Math.floor((counter - new Date()) / 1000);
					seconds = seconds < 0 ? 0 : seconds;
					$('#gameCounter').html(seconds + " remaining");
				}
				if(initData.host && seconds <= 0) {
					socket.emit('turnNext', {gameId:initData.game.id, host: initData.host});
				}
			},
			turnComplete: function(data) {
				this.resetCounter();
				this.redraw(data);
			},
			redraw: function(data) {
				alert('redraw');
			},
			resetCounter: function() {
				counter = new Date();
				counter.setSeconds(counter.getSeconds() + 30);
			}
		};
	};
})(window);