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
		}
	}
})(window);