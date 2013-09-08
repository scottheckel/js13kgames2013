module.exports = {
	guid: function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    		return v.toString(16);
		});
	},
	randomInt: function(max) {
		return Math.floor(max * Math.random());
	},
	lerp: function(a, b, t) {
		return a+(b-a)*t;
	},
	dist: function(a, b) {
		return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));
	},
	clamp: function(num, max, min) {
		return Math.min(Math.max(num, min || 0), max);
	}
};