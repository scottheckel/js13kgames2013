(function(exports) {
	exports.gameList = function(initData, stateMachine, socket) {
		var me = initData.me;
		return {
			onActivate: function() {
				var that = this;
				$('#body').attr('class', 'gameList')
				$('#welcomeWrapper').attr('style', 'display:block');
				$('#headerWrapper').html($.template($('#templateWelcome').html(), me));
				$('#headerWrapper').attr('style', 'display:block');
				socket.on('refreshGames', function(games) {
					that.refreshGames(games);
				});
				$('#createGameBtn').on('click', this.createGame);
			},
			onDeactivate: function () {
				$('#welcomeWrapper').attr('style', 'display:none');
				$('#headerWrapper').attr('style', 'display:none');
				socket.removeAllListeners('refreshGames');
			},
			onDestroy: function() {

			},
			onPause: function(on) {

			},
			onUpdate: function(isTop) {

			},
			createGame: function() {
				socket.emit('createGame', {'user':me}, this.gameCreated);
			},
			gameCreated: function(data) {
				if(data.success) {
		          stateMachine.push("gameLobby", { game: data.game, host: true });
		        } else {
		          /* TODO: SH - Can't create */
		          alert('unable to create game');
		        }
			},
			gameJoined: function(data) {
				if(data.success) {
					stateMachine.push('gameLobby', { game: data.game, host: false });
				} else {
					alert('Unable to join the game.');
				}
			},
			refreshGames: function(games) {
				var html = '',
			        index = 0,
		        	that = this;
			    for(;index<games.length;index++) {
			      html += $.template($('#templateGamesListItem').html(), {id: games[index].id, host: games[index].host.id, count: games[index].count});
			    }
			    $('#gamesList').html(html);
			    $('.game-item').on('click', function() {
			    	socket.emit('joinGame', {'gameId':this.getAttribute('data-id'),'user':me}, that.gameJoined);
			    });
			}
		};
	};
})(window);