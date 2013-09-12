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
			moves = {},
			toggleHp = true,
			shipLocations = {},
			animationLength = currentGame.turnTime * 500; // Animation is half the current turn
		return {
			onActivate: function() {
				this.resetShips();
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
			onUpdate: function(isTop, delta) {
				var seconds = currentGame.turnTime,
					that = this,
					temp;
				if(counter) {
					seconds = Math.floor((counter - new Date()) / 1000);
					seconds = seconds < 0 ? 0 : seconds;
					$('#gameCounter').html(seconds + " remaining");

					temp = that.findShip(mouse.x + camera.x, mouse.y + camera.y);
					highlighted = temp ? temp.id : null;

					// Animate the ships that are moving
					that.animateShips(delta/animationLength);					
				}
				if(initData.host && seconds <= 0) {
					socket.emit('turnNext', {gameId:currentGame.id, host: initData.host});
				}
				that.redraw(currentGame);
			},
			animateShips: function(delta) {
				$.each(currentGame.ships, function(ship) {
					var pos = shipLocations[ship.id];
					if(pos) {
						pos.t = Math.min(pos.t + delta, 1);
						pos.x = $.lerp(pos.x, ship.x, pos.t);
						pos.y = $.lerp(pos.y, ship.y, pos.t);
					}
				});
			},
			turnComplete: function(data) {
				currentGame.ships = data.ships;

				// Reset
				this.resetCounter();
				this.resetShips();
			},
			resetShips: function() {
				$.each(currentGame.ships, function(ship) {
					var move;

					// Reset Move
					move = moves[ship.id];
					if(move && move.x == ship.x && move.y == ship.y) {
						moves[ship.id] = null;
					}

					// Reset Animated Location
					shipLocations[ship.id] = {
						x: ship.px || ship.x,
						y: ship.py || ship.y,
						t: 0
					}
				});
			},
			redraw: function(game) {
				var that = this,
					graphics = exports.states.g;

				context.save();
				context.translate(-camera.x, -camera.y);
				context.clearRect(camera.x, camera.y, camera.w, camera.h);

				// Draw the background
				graphics.bg.render(context, camera);

				// Draw the ship health bars
				$.each(game.ships, function(entity) {
					var active = entity.id == selected || entity.id == highlighted,
						pos = shipLocations[entity.id];
					if(toggleHp || active) {
						graphics.ship.renderHp(context, entity, pos, active);
					}
				});

				// Draw the ships
				$.each(game.ships, function(ship) {
					graphics.ship.render(context, ship, shipLocations[ship.id], highlighted, selected, that.fingShipById);
				});

				context.restore();
			},
			resetCounter: function() {
				counter = new Date();
				counter.setSeconds(counter.getSeconds() + currentGame.turnTime);
			},
			findShip: function(x, y) {
				var found = null;
				$.each(currentGame.ships, function(entity, index) {
					var halfW = entity.w / 2,
						halfH = halfW,
						pos = shipLocations[entity.id] || entity;
					if(pos.x - halfW <= x && pos.x + halfW >= x && pos.y - halfH <= y && pos.y + halfH >= y) {
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
					case 27: // escape
						selected = null;
						break;
					case 32: // spacebar
						toggleHp = !toggleHp;
						break;
					case 37: // left
						camera.x += 3;
						break;
					case 38: // up
						camera.y += 3;
						break;
					case 39: //right
						camera.x -= 3;
						break;
					case 40: // down
						camera.y -= 3;
						break;
				}
			}
		};
	};
})(window);