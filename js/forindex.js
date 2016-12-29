(function(window, document, undefined) {
	function Jay(selector) {
		this.doms = document.querySelectorAll(selector);
		for(var i = 0; i < this.doms.length; i++) {
			this[i] = this.doms[i];
		}
		this.length = this.doms.length;
	}
	Jay.prototype = {
		each: function(callback) {
			var i = 0,
				length = this.length;
			if(length) {
				for(; i < length; i++) {
					if(callback.call(this[i], i, this[i]) === false) {
						break;
					}
				}
			}
			return this;
		},
		on: function(ev, callback) {
			this.each(function(_, dom) {
				addEventListener.call(dom, ev, callback);
			});
			return this;
		},
		css: function(style, value) {
			this.each(function(_, dom) {
				dom.style[style] = value;
			});
			return this;
		},
		val: function(value) {
			if(value != undefined) {
				this.each(function(_, dom) {
					dom.value = value;
				});
				return this;
			}
			return this[0].value;
		},
		append: function(newNode) {
			this.each(function(_, dom) {
				dom.appendChild(newNode);
			});
			return this;
		},
		html: function(value) {
			if(value != undefined) {
				this.each(function(_, dom) {
					dom.innerHTML = value;
				});
				return this;
			}
			return this[0].innerHTML;
		},
		offset: function() {
			return offset = {
				width: this[0].offsetWidth,
				height: this[0].offsetHeight,
				top: this[0].offsetTop,
				left: this[0].offsetLeft
			}
		},
		trigger:function(ev){
			var even = document.createEvent('HTMLEvents');
			even.initEvent(ev, true, true);
			this[0].dispatchEvent(even);
			return this;
		}
	}

	function $(selector) {
		return new Jay(selector);
	}
	window.$ = $;
})(window, document);