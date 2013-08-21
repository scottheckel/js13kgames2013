(function() {
	var $ = function(selector) {
		var els = null;
		if(typeof selector === "string") {
			els = selector[0] == '#' ? [document.getElementById(selector.substring(1))] : document.getElementsByClassName(selector);
		} else if(!!selector) {
			els = [selector];
		}
		return {
			on: function(eventName, handler) {
				var index = 0,
					el;
				for(;index < els.length;index++) {
					el = els[index];
					if(el.addEventListener) {
						el.addEventListener(eventName, handler, false);
					} else {
						el.attachEvent('on' + eventName, handler);
					}
				}
			},
		    attr: function(name, value) {
		      var index = 0,
		          el;
		      for(;index<els.length;index++) {
		        els[index].setAttribute(name, value);
		      }
		    }
		};
	};
	$.template = function(template, data) {
      return template.replace(/\{\{(\w*)\}\}/g, function(m,key){return data.hasOwnProperty(key)?data[key]:"";});
    };
	window.$ = $;
})();