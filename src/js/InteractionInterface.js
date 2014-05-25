var InteractionInterface = function (ui) {
    
    this.canvasHelper = ui.ch;
    
    // Controllers
	this.kc = new KeyboardController();
	this.tc = new TouchController(ui.canvas);
    
    this.getCurrentPosition = function () {
        return this.canvasHelper.getRealXY(this.tc.touch.x, this.tc.touch.y);
    };
    
    // Compute character target
    this.getCharacterTarget = function (char, controls, distanceMove) {
        var target = { x: char.x, y: char.y};

        if (controls.touch && this.tc.touch.x !== null) {
			var pos = this.getCurrentPosition();
            target.x = pos.x-(char.width/2);
            target.y = pos.y-(char.height/2);
        } else {
            if (controls.up    in this.kc.keysDown) { target.y -= distanceMove; } // Player holding up
            if (controls.down  in this.kc.keysDown) { target.y += distanceMove; } // Player holding down
            if (controls.left  in this.kc.keysDown) { target.x -= distanceMove; } // Player holding left
            if (controls.right in this.kc.keysDown) { target.x += distanceMove; } // Player holding right
        }
        
        return target;
    };
    
    this.inBoundaries = function (boundaries) {
        var pos = this.getCurrentPosition();
        return (pos.x>boundaries.xmin && pos.x<boundaries.xmax && pos.y>boundaries.ymin && pos.y<boundaries.ymax);
    };
};
