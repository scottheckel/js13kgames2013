(function(exports) {
	exports.states = exports.states || {};
	exports.states.g = exports.states.g || {};
	exports.states.g.bg = {
		render: function(context, camera) {
			renderStarfield(context, camera);
		},
	};

	var t = 0,
		delta = 0.01,
		density = 0.0005,
		minL = 200,
		stars,
		star;

	function renderStarfield(context, camera) {
		var index = 0,
			x, y;
		if(!stars) {
			initStarfield(camera);
		}

		for(;index<stars.length;index++) {
			// TODO: SH - I should probably be directly drawing to canvas pixel data
			// TODO: SH - don't move the stars with the camera (it should loop)
			// TODO: SH - should stars be on different plains when we move the camera?
			// TODO: SH - glimmer at different rates

			star = stars[index];
			context.fillStyle = color(star);
			context.fillRect(star.x+camera.x, star.y+camera.y, star.s, star.s);
		}

		t = loop(t + delta, 0, 1);
	}

	function color(star) {
		// TODO: SH - should probably clamp the alpha
		return 'rgba(' + star.l + ',' + star.l + ',' + star.l + ',' + (Math.sin(loop(star.t + t, 0, 1) * Math.PI) + star.r) + ')';
	}

	function initStarfield(camera) {
		var totalStars = Math.ceil(camera.w * camera.h * density),
			index;

		stars = [];
		for(index = 0; index < totalStars; index++) {
			star = {
				l: minL + $.randI(256-minL),// luminosity
				r: $.rand(0.8),				// range (how much it can glimmer lower == more)
				s: $.randI(4),				// size
				t: $.rand(1),				// time in animation
				x: $.rand(camera.w),
				y: $.rand(camera.h),
			};
			stars.push(star);
		}
	}

	// Loops a value so that if it goes over max it goes back to the min
	function loop(value, min, max) {
		return value > max ? min + value - max : value;
	}
})(window);