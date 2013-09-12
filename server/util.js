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
	dist2: function(a, b) {
		var one = a.x - b.x,
			two = a.y - by;
		return one*one+two*two;	
	},
	clamp: function(num, max, min) {
		return Math.min(Math.max(num, min || 0), max);
	},
	remove: function(array, value) {
		var index = array.indexOf(value);
		if(index >= 0) {
			array.splice(index, 1);
		}
	}
};