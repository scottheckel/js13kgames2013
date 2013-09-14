(function(exports) {
	exports.states = exports.states || {};
	exports.states.gameLobby = function(initData, stateMachine, socket) {
		var game = initData.game,
			players = initData.players,
			totalCost = 1000,
			maxCost = 1000,
			fighterCost = 100,
			corvetteCost = 100,
			battleshipCost = 200,
			qty = {bs:2,cv:4,ft:2};
		return {
			onActivate: function() {
				var that = this;
				$('#wrapper').html($.template($('#gameLobbyTemplate').html(), {}));
				$('#maxCost').html(maxCost);
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
				$('#leaveGameBtn').on('click', function() {
					socket.emit('g/leave', {'gameId':game.id});
					stateMachine.pop();
				});
				$('#bsQty').on('change', function() {
					that.shipQuantities();
				});
				$('#cvQty').on('change', function() {
					that.shipQuantities();
				});
				$('#ftQty').on('change', function() {
					that.shipQuantities();
				});
				socket.on('refreshUsersList', function(p) {
					players = p;
					that.refreshUserList(p);
				});
				socket.on('gameStarted', function(data) {
					stateMachine.push('game', {game:data.game,players:players,host:initData.host});
				});
				socket.on('g/readied', function(data) {
					game.ready = data.ready;
					that.refreshUserList(players);
				});
				socket.on('g/disconnect', function(data) {
					if(data.msg) {
						alert(data.msg);
					}
					if(data.quit) {
						stateMachine.pop();
					} else {
						game = data.game;
						if(data.players) {
							players = data.players;
							that.refreshUserList(players);
						}
					}
				});
			},
			onDeactivate: function () {
				$('#wrapper').html('');
				socket.removeAllListeners('g/readied');
				socket.removeAllListeners('g/disconnect');
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
			shipQuantities: function() {
				var bsQty = parseInt($('#bsQty').value()),
					cvQty = parseInt($('#cvQty').value()),
					ftQty = parseInt($('#ftQty').value());

				if(isNaN(bsQty)) {
					alert('Invalid battleship quantity.');
				}

				if(isNaN(cvQty)) {
					alert('Invalid corvette quantity.');
				}

				if(isNaN(ftQty)) {
					alert('Invalid fighter quantity.');
				}

				// Update the stored quantities
				qty.bs = bsQty;
				qty.cv = cvQty;
				qty.ft = ftQty;

				// Determine totals
				$('#bsTotal').html(bsQty * battleshipCost);
				$('#cvTotal').html(cvQty * corvetteCost);
				$('#ftTotal').html(ftQty * fighterCost);
				totalCost = bsQty * battleshipCost + cvQty * corvetteCost + ftQty * fighterCost;
			},
			startGame: function() {
				if(totalCost > maxCost) {
					alert('Your total cost is '  + totalCost + ' and the limit for this game is ' + maxCost + '. Please reconfigure your fleet.');
				} else if(players.length != 2) {
					alert('Must have two players in game.');
				} else if(players.length != game.ready.length) {
					alert('All players must be ready.');
				} else if(initData.host) {
					$('#startGameBtn').attr('disabled', 'disabled');
					$('#bsQty').attr('disabled', 'disabled');
					$('#cvQty').attr('disabled', 'disabled');
					$('#ftQty').attr('disabled', 'disabled');
					socket.emit('startGame', {gameId:game.id,'fleet':qty}, function() {
						alert('Unable to start the game.');
						$('#startGameBtn').attr('disabled', '');
						$('#bsQty').attr('disabled', '');
						$('#cvQty').attr('disabled', '');
						$('#ftQty').attr('disabled', '');
					});
				} else {
					alert("Only host can start game.");
				}
			},
			setReady: function() {
				if(totalCost > maxCost) {
					alert('Your total cost is '  + totalCost + ' and the limit for this game is ' + maxCost + '. Please reconfigure your fleet.');
				} else {
					$('#startGameBtn').attr('disabled', 'disabled');
					$('#bsQty').attr('disabled', 'disabled');
					$('#cvQty').attr('disabled', 'disabled');
					$('#ftQty').attr('disabled', 'disabled');
					socket.emit('g/ready', {'id':game.id,'ready':true,'fleet':qty}, function(data) {
						if(!data.success) {
							alert('Unable to set ready status.');
							$('#startGameBtn').attr('disabled', '');
							$('#bsQty').attr('disabled', '');
							$('#cvQty').attr('disabled', '');
							$('#ftQty').attr('disabled', '');
						}
					});
				}
			}
		};
	};
})(window);