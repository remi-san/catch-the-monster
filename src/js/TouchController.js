var TouchController = function (element) {

	this.element = element;
	
	this.touch = { x: null, y: null };
	this.clicked = false;
	
	this.init = function() {
		this.element.addEventListener("touchstart", this.tap.bind(this));
		this.element.addEventListener("mousedown", this.click.bind(this));
		
		this.element.addEventListener("touchmove", this.tap.bind(this));
		this.element.addEventListener("mousemove", this.track.bind(this));
		
		this.element.addEventListener("touchend", this.release.bind(this));
		this.element.addEventListener("mouseup", this.release.bind(this));
		
		this.element.addEventListener("touchleave", this.release.bind(this));
		this.element.addEventListener("mouseout", this.release.bind(this));
	};
	
	this.click = function (e) {
		e = e || window.event;
		var button = e.which || e.button;
		
		if(button === 1) {
			this.tap(e);
		}
	};
	
	this.tap = function (e) {
		this.clicked = true;
		this.track(e);
		e.preventDefault();
	};
	
	this.track = function (e) {
		
		e = e || window.event;
		
		if (this.clicked) {
			var offset = DOMHelper.getElementPosition(this.element),
				tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
				tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
			
			var currX = (tapX - offset.x);
			var currY = (tapY - offset.y);

			this.touch = { x: currX, y: currY };
		}
	};
	
	this.release = function () {
		this.clicked = false;
		this.touch = { x: null, y: null };
	};
	
	this.init();
};