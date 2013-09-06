(function(exports) {
	exports.gameLobby = function(initData, stateMachine, socket) {
		var game = initData.game;
		return {
			onActivate: function() {
				var that = this;
				$('#gameWrapper').attr('style', 'display:block');
				$('#headerWrapper').attr('style', 'display:block');
				this.refreshUserList(game.players);
				if(initData.host) {
					$('#startGameBtn')
						.attr('style', 'display:block')
						.on('click', this.startGame);
				} else {
					$('#startGameBtn').attr('style', 'display:none');
				}
				socket.on('refreshUsersList', function(players) {
					game.players = players;
					that.refreshUserList(players);
				});
				socket.on('gameStarted', function(data) {
					stateMachine.push('game', data.game);
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
					socket.emit('startGame', {gameId:game.id}, function(data) {
						if(data.success) {
							stateMachine.push('game', data.game);
						} else {
							alert('Unable to start the game.');
							$('#startGameBtn').attr('disabled', '');
						}
					});
				} else {
					alert("Only host can start game.");
				}
			}
		};
	};
})(window);