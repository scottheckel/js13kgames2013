(function(exports) {
	exports.states = exports.states || {};
	exports.states.game = function(initData, stateMachine, socket) {
		var counter = null,
			me = exports.me,
			$canvas = null,
			canvas = null,
			context = null,
			selected = null,
			highlighted = null,
			currentGame = initData.game,
			currentPlayers = initData.players,
			mouse = {x:0,y:0},
			camera = {x:0,y:0,w:0,h:0}
			moves = {};
		return {
			onActivate: function() {
				this.resetCounter();
				var that = this;
				$('#wrapper').html($.template($('#gameTemplate').html(), {}));

				$canvas = $('#gameCanvas');
				canvas = $canvas.get();
				context = $canvas.context();

				// Focus on canvas
				canvas.tabIndex = 0;
				canvas.focus();

				// Set our camera/canvas width
				camera.w = canvas.width = innerWidth;
				camera.h = canvas.height = innerHeight;

				$canvas.on('keydown', function(e) {
					that.onKeyDown(e);
				});
				$canvas.on('click', function(e) {
					var x = e.pageX + camera.x,
						y = e.pageY + camera.y,
						move,
						found = that.findShip(x, y);
					if(found) {
						if(selected == found.id) {
							// Deselecting
							selected = null;
						} else if(found.player == me.id) {
							// Selecting
							selected = found.id;
						}
					} else if(selected) {
						// Moving somewhere
						move = {
							id: initData.game.id,
							playerId: me.id,
							shipId: selected,
							x: x,
							y: y
						}
						moves[selected] = move;
						socket.emit('g/move', move);
					} else {
						// Deselecting
						selected = null;
					}
				});
				$canvas.on('mousemove', function(e) {
					mouse.x = e.clientX;
					mouse.y = e.clientY;
				});
				socket.on('turnComplete', function(data) {
					that.turnComplete(data);
				});
				that.redraw(currentGame);
			},
			onDeactivate: function () {
				$('#wrapper').html('');
				socket.removeAllListeners('refreshUsersList');
			},
			onDestroy: function() {

			},
			onPause: function(on) {

			},
			onUpdate: function(isTop) {
				var seconds = currentGame.turnTime,
					that = this,
					temp;
				if(counter) {
					seconds = Math.floor((counter - new Date()) / 1000);
					seconds = seconds < 0 ? 0 : seconds;
					$('#gameCounter').html(seconds + " remaining");

					temp = that.findShip(mouse.x + camera.x, mouse.y + camera.y);
					if(temp) {
						highlighted = temp.id;
					}
				}
				if(initData.host && seconds <= 0) {
					socket.emit('turnNext', {gameId:currentGame.id, host: initData.host});
				}
				that.redraw(currentGame);
			},
			turnComplete: function(data) {
				currentGame.ships = data.ships;

				// Reset
				this.resetCounter();
				this.resetMoves();
			},
			resetMoves: function() {
				var move;
				$.each(currentGame.ships, function(ship, index) {
					move = moves[ship.id];
					if(move && move.x == ship.x && move.y == ship.y) {
						moves[ship.id] = null;
					}
				});
			},
			redraw: function(game) {
				var that = this;

				context.save();
				context.translate(-camera.x, -camera.y);
				context.clearRect(camera.x, camera.y, camera.w, camera.h);

				// Draw the background
				exports.states.g.bg.render(context, camera);

				// Draw the mouse
				context.strokeStyle = '#ffff00';
				context.beginPath();
				context.arc(camera.x+mouse.x, camera.y+mouse.y, 5, 0, Math.PI*2, true);
				context.stroke();

				// Draw the ships
				$.each(game.ships, function(entity, index) {
					that.drawShip(entity);
				});

				context.restore();
			},
			drawShip: function(ship) {
				var move, target;

				if(ship.state > 0) {
					// Ship HP
					context.fillStyle = '#000000';
					context.fillText("HP:" + ship.hp, ship.x, ship.y - ship.w);

					// Ship
					context.strokeStyle = ship.id == selected ? '#ff0000' : (ship.id == highlighted ? '#ffff00' : ship.color);
					context.beginPath();
					context.arc(ship.x, ship.y, ship.w/2, 0, Math.PI*2, true);
					context.stroke();

					if(ship.px != null && ship.py != null) {
						context.strokeStyle = '#c0c0c0';
						context.beginPath();
						context.moveTo(ship.px, ship.py);
						context.lineTo(ship.x, ship.y);
						context.stroke();
					}

					move = moves[ship.id];
					if(move) {
						context.strokeStyle = '#ffffff';
						context.beginPath();
						context.moveTo(ship.x, ship.y);
						context.lineTo(move.x, move.y);
						context.stroke();
					}

					if(ship.target) {
						target = this.fingShipById(ship.target);
						if(target) {
							context.strokeStyle = ship.color;
							context.beginPath();
							context.moveTo(ship.x, ship.y);
							context.lineTo(target.x, target.y);
							context.stroke();
						}
					}
				}
			},
			resetCounter: function() {
				counter = new Date();
				counter.setSeconds(counter.getSeconds() + currentGame.turnTime);
			},
			findShip: function(x, y) {
				var found = null;
				$.each(currentGame.ships, function(entity, index) {
					var halfW = entity.w / 2,
						halfH = halfW;
					if(entity.x - halfW <= x && entity.x + halfW >= x && entity.y - halfH <= y && entity.y + halfH >= y) {
						found = entity;
					}
				});
				return found;
			},
			fingShipById: function(shipId) {
				var found = null;
				$.each(currentGame.ships, function(entity, index) {
					if(entity.id == shipId) {
						found = entity;
					}
				});
				return found;
			},
			onKeyDown: function(e) {
				var key = e.keyCode;
				switch(key) {
					case 37: // left
						camera.x++;
						break;
					case 38: // up
						camera.y++;
						break;
					case 39: //right
						camera.x--;
						break;
					case 40: // down
						camera.y--;
						break;
				}
			}
		};
	};
})(window);