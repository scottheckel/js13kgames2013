(function(exports, doc) {
	var query = function(selector) {
		var els = null;
		if(typeof selector === "string") {
			els = selector[0] == '#' ? [doc.getElementById(selector.substring(1))] : doc.getElementsByClassName(selector);
		} else if(!!selector) {
			els = [selector];
		}
		return {
			on: function(eventName, handler) {
				query.each(els, function(el) {
					if(el.addEventListener) {
						el.addEventListener(eventName, handler, false);
					} else {
						el.attachEvent('on' + eventName, handler);
					}
				});
			},
		    attr: function(name, value) {
		    	query.each(els, function(el) {
		    		el.setAttribute(name, value);
		    	});
		    }
		};
	};
	query.template = function(template, data) {
		return template.replace(/\{\{(\w*)\}\}/g, function(m,key){return data.hasOwnProperty(key)?data[key]:"";});
	};
	query.each = function(array, callback) {
		var index = 0;
		for(;index<array.length;index++) {
			callback(array[index], index);
		}
	};
	exports.$ = query;
})(window, document);