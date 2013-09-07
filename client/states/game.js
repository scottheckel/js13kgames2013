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
					var x = e.pageX,
						y = e.pageY,
						move,
						found = that.findEntity(x, y);
					if(found) {
						if(selected == found) {
							// Deselecting
							selected = null;
						} else if(found.player == me.id) {
							// Selecting
							selected = found;
						}
					} else if(selected) {
						// Moving somewhere
						move = {
							id: initData.game.id,
							playerId: me.id,
							shipId: selected.id,
							x: x,
							y: y
						}
						moves[selected.id] = move;
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
				var seconds = 30,
					that = this;
				if(counter) {
					seconds = Math.floor((counter - new Date()) / 1000);
					seconds = seconds < 0 ? 0 : seconds;
					$('#gameCounter').html(seconds + " remaining");

					highlighted = that.findEntity(mouse.x + camera.x, mouse.y + camera.y);
				}
				if(initData.host && seconds <= 0) {
					socket.emit('turnNext', {gameId:initData.game.id, host: initData.host});
				}
				that.redraw(currentGame);
			},
			turnComplete: function(data) {
				currentGame = data.game;

				// Reset
				this.resetCounter();
				moves = {};
			},
			redraw: function(game) {
				var move;

				context.save();
				context.translate(-camera.x, -camera.y);
				context.clearRect(camera.x, camera.y, camera.w, camera.h);

				// Draw the mouse
				context.strokeStyle = '#ffff00';
				context.beginPath();
				context.arc(camera.x+mouse.x, camera.y+mouse.y, 5, 0, Math.PI*2, true);
				context.stroke();

				// Draw the ships
				$.each(game.ships, function(entity, index) {
					// Ship
					context.strokeStyle = entity == selected ? '#ff0000' : (entity == highlighted ? '#ffff00' : entity.color);
					context.beginPath();
					context.arc(entity.x, entity.y, entity.w/2, 0, Math.PI*2, true);
					context.stroke();

					move = moves[entity.id];
					if(move) {
						context.strokeStyle = '#ffffff';
						context.beginPath();
						context.moveTo(entity.x, entity.y);
						context.lineTo(move.x, move.y);
						context.stroke();
					}
				});

				context.restore();
			},
			resetCounter: function() {
				counter = new Date();
				counter.setSeconds(counter.getSeconds() + 30);
			},
			findEntity: function(x, y) {
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