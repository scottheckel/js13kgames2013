(function(exports) {
	exports.states = exports.states || {};
	exports.states.gameList = function(initData, stateMachine, socket) {
		var me = exports.me;
		return {
			onActivate: function() {
				var that = this;
				$('#wrapper').html($.template($('#gameListTemplate').html(), {}));
				$('#headerWrapper').html($.template($('#templateWelcome').html(), me));
				socket.on('refreshGames', function(games) {
					that.refreshGames(games);
				});
				$('#createGameBtn').on('click', function() {
					$('#createGameBtn').attr('disabled', 'disabled');
					socket.emit('createGame', {}, that.gameCreated);
				});
				$('#refreshGamesBtn').on('click', function() {
					socket.emit('requestGames', {}, function(data) {
						that.refreshGames(data);
					});
				});
			},
			onDeactivate: function () {
				$('#wrapper').html('');
				socket.removeAllListeners('refreshGames');
			},
			onDestroy: function() {

			},
			onPause: function(on) {

			},
			onUpdate: function(isTop) {

			},
			gameCreated: function(data) {
				if(data.success) {
		          stateMachine.push("gameLobby", { game: data.game, players: data.players, host: true });
		        } else {
		        	alert('Unable to create game.');
		        	$('#createGameBtn').attr('disabled', '');
		        }
			},
			gameJoined: function(data) {
				if(data.success) {
					stateMachine.push('gameLobby', { game: data.game, players: data.players, host: false });
				} else {
					alert('Unable to join the game.');
				}
			},
			refreshGames: function(games) {
				var html = '',
			        index = 0,
		        	that = this;
			    for(;index<games.length;index++) {
			      html += $.template($('#templateGamesListItem').html(), {id: games[index].id, host: games[index].host.name, count: games[index].count});
			    }
			    $('#gamesList').html(html);
			    $('.game-item').on('click', function() {
			    	socket.emit('joinGame', {'gameId':this.getAttribute('data-id')}, that.gameJoined);
			    });
			    if(games.length==0) {
				    $('#noGamesAvailable').attr('style', 'display:block');
				    $('#gamesListTable').attr('style', 'display:none');
				} else {
				    $('#noGamesAvailable').attr('style', 'display:none');
				    $('#gamesListTable').attr('style', 'display:block');
				}
			}
		};
	};
})(window);