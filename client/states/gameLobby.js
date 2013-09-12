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
						.html('Start Game')
						.on('click', this.startGame);
				} else {
					$('#startGameBtn')
						.html('Ready')
						.on('click', this.setReady);
				}
				socket.on('refreshUsersList', function(p) {
					players = p;
					that.refreshUserList(p);
				});
				socket.on('gameStarted', function(data) {
					stateMachine.push('game', {game:data.game,players:players,host:initData.host});
				});
				socket.on('g/readied', function(data) {
					game.ready.push(data.id);
					that.refreshUserList(players);
				});
			},
			onDeactivate: function () {
				$('#wrapper').html('');
				socket.removeAllListeners('g/readied');
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
					html += $.template($('#templateUsersListItem').html(), {'color':user.color,'name':user.name,'ready':game.ready.indexOf(user.id) >= 0?'(Ready)':''});
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
			},
			setReady: function() {
				$('#startGameBtn').attr('disabled', 'disabled');
				socket.emit('g/ready', {'id':game.id,'ready':true}, function(data) {
					if(!data.success) {
						alert('Unable to set ready status.');
						$('#startGameBtn').attr('disabled', '');
					}
				});
			}
		};
	};
})(window);