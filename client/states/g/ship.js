(function(exports) {
	

	exports.states = exports.states || {};
	exports.states.g = exports.states.g || {};
	exports.states.g.ship = {
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