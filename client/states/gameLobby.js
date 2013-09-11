(function(exports) {
	exports.states = exports.states || {};
	exports.states.gameLobby = function(initData, stateMachine, socket) {
		var game = initData.game,
			players = initData.players;
		return {
			onActivate: function() {
				var that = this;
				$('#wrapper').html($.template($('#gameLobbyTemplate').html(), {}));
				this.refreshUserList(players);
				if(initData.host) {
					$('#startGameBtn')
						.attr('style', 'display:block')
						.on('click', this.startGame);
				} else {
					$('#startGameBtn').attr('style', 'display:none');
				}
				socket.on('refreshUsersList', function(p) {
					players = p;
					that.refreshUserList(p);
				});
				socket.on('gameStarted', function(data) {
					stateMachine.push('game', {game:data.game,players:players,host:initData.host});
				});
			},
			onDeactivate: function () {
				$('#wrapper').html('');
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
				if(players.length != 2) {
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