(function(exports, doc) {
	var query = function(selector) {
		var els = null;
		if(typeof selector === "string") {
			els = selector[0] == '#' ? [doc.getElementById(selector.substring(1))] : doc.getElementsByClassName(selector.substring(1));
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
				return this;
			},
		    attr: function(name, value) {
		    	if(value == undefined) {
		    		return els.length > 0 ? els[0].getAttribute(name) : '';
		    	}
		    	query.each(els, function(el) {
		    		el.setAttribute(name, value);
		    	});
		    	return this;
		    },
		    html: function(value) {
		    	if(value == undefined) {
		    		return els.length > 0 ? els[0].innerHTML : '';
		    	}
		    	query.each(els, function(el) {
		    		el.innerHTML = value;
		    	});
		    	return this;
		    },
		    context: function() {
		    	return els.length > 0 ? els[0].getContext('2d') : null;
		    },
		    get: function() {
		    	return els.length > 0 ? els[0] : null;
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
	query.rand = function(upperBound) {
		return Math.random() * upperBound;
	};
	query.randI = function(upperBound) {
		return Math.floor(query.rand(upperBound) - 0.5);
	};
	exports.$ = query;
})(window, document);