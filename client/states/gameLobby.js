(function(exports) {
	exports.gameLobby = function(initData, stateMachine, socket) {
		var game = initData.game;
		return {
			onActivate: function() {
				$('#gameWrapper').attr('style', 'display:block');
				$('#headerWrapper').attr('style', 'display:block');
				this.refreshUserList(game.players);
				if(initData.host) {
					$('#startGameBtn')
						.attr('style', 'display:block')
						.on('click', this.startGame);
				}
				socket.on('refreshUsersList', function(data) {
					game = data.game;
					this.refreshUserList(game.players);
				});
				socket.on('gameStarted', function(data) {
					stateMachine.on('game', data);
				});
			},
			onDeactivate: function () {
				$('#gameWrapper').attr('style', 'display:none');
				$('#headerWrapper').attr('style', 'display:none');
				socket.removeAllListeners('refreshUsersList');
				socket.removeAllListeners('gameStarted');
			},
			onDestroy: function() {

			},
			onPause: function(on) {

			},
			onUpdate: function(isTop) {
				
			},
		 	refreshUserList: function(users) {
				var html = '';
				users.forEach(function(user) {
					html += $.template(templateUsersListItem.innerHTML, user);
				});
				$('#usersList').html(html);
			},
			startGame: function() {
				if(game.players.length != 2) {
					alert('Must have two players in game.');
				} else if(initData.host) {
					$('#startGameBtn').attr('disabled', 'disabled');
					socket.emit('startGame', {gameId:game.id});
				} else {
					alert("Only host can start game.");
				}
			}
		};
	};
})(window);