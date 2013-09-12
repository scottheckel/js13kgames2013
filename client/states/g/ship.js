(function(exports) {
	

	exports.states = exports.states || {};
	exports.states.g = exports.states.g || {};
	exports.states.g.ship = {
		render: function(context, ship, pos, highlighted, selected, getShip) {
			if(ship.state == 0) {
				return; // Dead
			} else if(ship.state == 1) {
				context.fillStyle = '#ffff00';
				context.beginPath();
				context.arc(pos.x, pos.y, ship.w*(1+pos.t), 0, Math.PI*2, true);
				context.fill();
				return; // Dying
			}

			// Ship
			context.strokeStyle = ship.id == selected ? '#ff0000' : (ship.id == highlighted ? '#ffff00' : ship.color);
			context.beginPath();
			context.arc(pos.x, pos.y, ship.w/2, 0, Math.PI*2, true);
			context.stroke();

			if(ship.px != null && ship.py != null) {
				context.strokeStyle = '#c0c0c0';
				context.beginPath();
				context.moveTo(ship.px, ship.py);
				context.lineTo(pos.x, pos.y);
				context.stroke();
			}

			move = moves[ship.id];
			if(move) {
				exports.states.g.ship.renderArrow(context, pos, move, 'rgba(255,255,255,0.4)');
			}

			if(ship.target) {
				target = getShip(ship.target);
				if(target) {
					context.strokeStyle = ship.color;
					context.beginPath();
					context.moveTo(pos.x, pos.y);
					context.lineTo(target.x, target.y);
					context.stroke();
				}
			}
		},
		renderHp: function(context, ship, pos, active) {
			if(ship.hp <= 0) {
				return;
			}

			var hp = Math.round((ship.hp / ship.mHp) * 100);

			context.beginPath();
			context.fillStyle = 'rgba(0,255,0,'+(active?0.8:0.1)+')';
			context.rect(pos.x - 50, pos.y, hp, 10);
			context.fill();

			context.beginPath();
			context.fillStyle = 'rgba(0,0,0,'+(active?0.8:0.1)+')';
			context.rect(pos.x - 50, pos.y, 100, 10);
			context.stroke();
		},
		renderArrow: function(context, p1, p2, style) {
			// Derived from http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html
			var angle = Math.PI / 8,
				lineangle = Math.atan2(p2.y-p1.y,p2.x-p1.x),
				h = Math.abs(15/Math.cos(angle)),
				angle1 = lineangle + Math.PI + angle,
				topx = p2.x + Math.cos(angle1) * h,
				topy = p2.y + Math.sin(angle1) *h,
				angle2 = lineangle + Math.PI - angle,
				botx = p2.x + Math.cos(angle2) * h,
				boty = p2.y + Math.sin(angle2) * h;

				context.beginPath();
				context.strokeStyle = style;
				context.moveTo(p1.x, p1.y);
				context.lineTo(p2.x, p2.y);
				context.stroke();

				context.beginPath();
				context.moveTo(topx, topy);
				context.lineTo(p2.x, p2.y);
				context.lineTo(botx, boty);
				context.stroke();
		}
	}
})(window);