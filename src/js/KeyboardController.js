var KeyboardController = function () {
	
	this.keysDown = {};
	
	this.init = function () {
		
		var self = this;
	
		window.addEventListener("keydown", function (e) {
			self.keysDown[e.keyCode] = true;
		}, false);

		window.addEventListener("keyup", function (e) {
			delete self.keysDown[e.keyCode];
		}, false);
	};
	
	this.init();
};