var UserInterface = function (div, width, height) {
	
	// Canvas
	this.div = div;
    this.width = width;
    this.height = height;
    this.canvasRatio = width/height;
	this.canvas = null;
	this.ctx = null;
    
    // Screen
    this.screenWidth = 512;
    this.screenHeight = 512;
    this.screenRatio = 1;
    
    // Adaptation
    this.ratio = 1;
    this.marginLeft = 0;
    this.marginTop = 0;
	
	// Images
	this.bgImage = new Image();
	this.heroImage = new Image();
	this.monsterImage = new Image();
	
	// Loading
	this.bgReady = false;
	this.heroReady = false;
	this.monsterReady = false;
	
	// Keyboard controls
	this.keysDown = {};
	this.touch = { x: null, y: null };
	this.clicked = false;
	
    // FPS
	this.delta = 0.2;
	this.fps = 0;
	
	this.init = function() {
		var self = this;
		
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.div.appendChild(this.canvas);
        
        this.updateUI();
		
		// Background image
		this.bgImage.onload = function () {
			self.bgReady = true;
		};
		this.bgImage.src = "images/background.png";

		// Hero image
		this.heroImage.onload = function () {
			self.heroReady = true;
		};
		this.heroImage.src = "images/hero.png";

		// monster image
		this.monsterImage.onload = function () {
			self.monsterReady = true;
		};
		this.monsterImage.src = "images/monster.png";
		
		
		//Keys listeners
		addEventListener("keydown", function (e) {
			self.keysDown[e.keyCode] = true;
		}, false);

		addEventListener("keyup", function (e) {
			delete self.keysDown[e.keyCode];
		}, false);
		
		this.canvas.addEventListener("contextmenu", function (e) {
			e = e || window.event;
			if (e.stopPropagation) { e.stopPropagation(); }
			e.cancelBubble = true;
			e.preventDefault();
		});
		
        window.addEventListener("load", function() { setTimeout(function(){ window.scrollTo(0, 1);}, 0); });
        
		this.canvas.addEventListener("touchstart", this.tap.bind(this));
		this.canvas.addEventListener("mousedown", this.click.bind(this));
		
		this.canvas.addEventListener("touchmove", this.tap.bind(this));
		this.canvas.addEventListener("mousemove", this.track.bind(this));
		
		this.canvas.addEventListener("touchend", this.release.bind(this));
		this.canvas.addEventListener("mouseup", this.release.bind(this));
		
		this.canvas.addEventListener("touchleave", this.release.bind(this));
		this.canvas.addEventListener("mouseout", this.release.bind(this));
        
        window.addEventListener("orientationchange", this.updateUI.bind(this));
        window.addEventListener("resize", this.updateUI.bind(this));
	};
	
    this.updateUI = function () {
        this.screenWidth = window.innerWidth;;
        this.screenHeight = window.innerHeight;
        this.screenRatio = this.screenWidth/this.screenHeight;
        
        if (this.canvasRatio>this.screenRatio) {
            this.ratio = this.screenWidth / this.width;
            this.marginTop = (this.screenHeight-(this.height*this.ratio))/2;
            this.marginLeft = 0;
        } else {
            this.ratio =  this.screenHeight / this.height;
            this.marginTop = 0;
            this.marginLeft = (this.screenWidth-(this.width*this.ratio))/2;
        }
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;
    };
    
	this.click = function (e) {
		e = e || window.event;
		var button = e.which || e.button;
		
		if(button === 1) {
			this.tap(e);
		}
	}
	
	this.tap = function (e) {
		this.clicked = true;
		this.track(e);
		e.preventDefault();
	}
	
	this.track = function (e) {
		
		e = e || window.event;
		
		if (this.clicked) {
			var pos = this.getElementPosition(this.canvas),
				tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
				tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
			
			var currX = (tapX - pos.x);
			var currY = (tapY - pos.y);
            
            var pos = this.getRealXY(currX, currY);

			this.touch = { x: pos.x, y: pos.y };
		}
	};
	
	this.release = function (e) {
		e = e || window.event;
		this.clicked = false;
		this.touch = { x: null, y: null };
	}
	
	this.getElementPosition = function (element) {
	
       var parentOffset,
       	   pos = {
               x: element.offsetLeft,
               y: element.offsetTop 
           };
           
       if (element.offsetParent) {
           parentOffset = this.getElementPosition(element.offsetParent);
           pos.x += parentOffset.x;
           pos.y += parentOffset.y;
       }
       return pos;
    };
    
    this.getRealValue = function (value) {
        return value / this.ratio;
    };
    
    this.getRealXY = function (x, y) {
        return { x: this.getRealValue(x-this.marginLeft), y: this.getRealValue(y-this.marginTop) };
    };
    
    this.getScreenValue = function (value) {
        return value * this.ratio;
    };
    
    this.getScreenXY = function (x, y) {
        return { x: this.getScreenValue(x)+this.marginLeft, y: this.getScreenValue(y)+this.marginTop };
    };
    
    this.drawImage = function (image, x, y, width, height) {
        width = width || image.width;
        height = height || image.height;
        var pos = this.getScreenXY(x, y);
        this.ctx.drawImage(image, 0, 0, width, height, pos.x, pos.y, this.getScreenValue(width), this.getScreenValue(height));
    };
    
    this.drawRectangle = function (x, y, width, height, fillStyle, strokeStyle, lineWidth) {
        // Colors
        this.ctx.fillStyle = fillStyle || "rgb(255, 255, 255)";
        this.ctx.strokeStyle = strokeStyle || "rgb(0, 0,0)";
        this.ctx.lineWidth = lineWidth || 0;
        
        var pos = this.getScreenXY(x, y);

        // Rectangle
        this.ctx.beginPath();
        this.ctx.rect(pos.x, pos.y, this.getScreenValue(width), this.getScreenValue(height)); 
        this.ctx.fill();
        this.ctx.stroke();
    };
    
    this.drawText = function (text, x, y, color, align, vAlign, size, font) {
        
        size = size || 16;
        font = font || "Helvetica";
        
        this.ctx.fillStyle = color || "rgb(0, 0,0)";
        this.ctx.textAlign = align || "left";
        this.ctx.textBaseline = vAlign || "top";
        this.ctx.font = Math.round(size*this.ratio)+"px "+font;
        
        var pos = this.getScreenXY(x, y);
        
        this.ctx.fillText(text, pos.x, pos.y);
    };
    
	
	// Draw everything
	this.render = function (displayMenu, hero, monster, monstersCaught, delta) {
		
        this.delta += delta;
            if(this.delta >= 0.2) {
                this.delta = 0.001;
                this.fps = Math.round(1/delta);
            }
        
		if (this.bgReady) {
            this.drawImage(this.bgImage, 0, 0);
		}
		
		if (displayMenu) {
			
            // Menu
            this.drawRectangle(56, 140, 400, 200, "lightgrey", "black", "6");
			
			// Menu Title
			this.drawText("Catch the Robot", 256, 180, "black", "center", "top", 32);
			
			// Start button
			this.drawRectangle(196, 250, 120, 50, "black"); 
			
			// Start button text
			this.drawText("Start", 256, 256, "white", "center", "top", 32);
			
		} else {
			
			if (this.heroReady) {
				this.drawImage(this.heroImage, hero.x, hero.y);
			}

			if (this.monsterReady) {
				this.drawImage(this.monsterImage, monster.x, monster.y);
			}

			// Score
			this.ctx.font = "18px Helvetica";
			this.ctx.fillStyle = "rgb(250, 250, 250)";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
			
			this.drawText("Catches : " + monstersCaught, 0, 0, "white");
            
			this.drawText(this.fps+" FPS", this.width, 0, "white", "right");
			
			if (this.touch.x !== null) {
                this.drawText("Click :"+Math.round(this.touch.x)+"/"+Math.round(this.touch.y), this.width, this.height-20, "white", "right");
            }
		}
	};
	
	// Init the UI
	this.init();
};

var UIElement = function (render) {
    this.render = render;
}

var Game = function(ui) {
	
	// UI
	this.ui = ui;
	
	// Date init
	this.then = Date.now();
	
	// Characters
	this.hero = { name: 'Hero', speed: 384, width: 32, height: 32, moving: false, touch: true };
	this.monster = { name: 'monster', speed: 384, width: 32, height: 32, moving: false, touch: false };
	
	// Area
	this.gameArea = { width: 512, height: 480 };

	// Character controls
	this.heroControls   = { up: 38, down: 40, left: 37, right: 39 };
	this.monsterControls = { up: 90, down: 83, left: 81, right: 68 };
	
	// Game vars
	this.started = false;
	this.monstersCaught = 0;
	this.characters = [
       {character : this.hero, controls : this.heroControls}, 
       {character : this.monster, controls : this.monsterControls}
    ];

	this.init = function () {
		this.reset();
	};
	
	// Reset the game when the player catches a monster
	this.reset = function () {
		// Reset the hero position
		this.hero.x = Math.round((this.gameArea.width-this.hero.width)/2);
		this.hero.y = Math.round((this.gameArea.height-this.hero.width)/2);
		
		// Throw the monster somewhere on the screen randomly
		this.monster.x = Math.round((Math.random() * (this.gameArea.width-this.monster.width)));
		this.monster.y = Math.round((Math.random() * (this.gameArea.height-this.monster.height)));
		
		this.started = false;
	};
	
	this.move = function(character, keys, modifier) {
		
		var moving = false;
		
		var x = character.x;
		var y = character.y;
		
		var touchX = x;
		var touchY = y;
		
		var distanceMove = character.speed * modifier;
		
		if (character.touch && ui.touch.x !== null) {
			touchX = ui.touch.x-(character.width/2);
			touchY = ui.touch.y-(character.height/2);
		} else {
			if (keys.up    in ui.keysDown) { touchY -= distanceMove; } // Player holding up
			if (keys.down  in ui.keysDown) { touchY += distanceMove; } // Player holding down
			if (keys.left  in ui.keysDown) { touchX -= distanceMove; } // Player holding left
			if (keys.right in ui.keysDown) { touchX += distanceMove; } // Player holding right
		}
		
		var distX = character.x-touchX;
		var distY = character.y-touchY;
		
		var distance = Math.sqrt(distX*distX+distY*distY);
		var ratio = distance / distanceMove;
		
		if(ratio <= 1) {
			x = touchX;
			y = touchY;
		} else {
			x -= distX / ratio;
			y -= distY / ratio;
		}
		
		if(Math.abs(character.x-x) !== 0 || Math.abs(character.y-y) !== 0) {
			moving = true;
		}
		
		return {x: x, y: y, moving: moving};
	};
	
	// Update game objects
	this.update = function (modifier) {
		
		if (this.ui.touch.x>196 && this.ui.touch.x<316 && this.ui.touch.y>250 && this.ui.touch.y<300) {
            this.started = true;
            return;
        }
		
		if (!this.started) { return; }
		
		var self = this;
		
		this.characters.forEach(function(characterOptions) {
			var newCharacterPosition = self.move(characterOptions.character, characterOptions.controls, modifier);
			
			//prevents from quitting the game area
			if (newCharacterPosition.x < 32) { newCharacterPosition.x = 32; }
			else if (newCharacterPosition.x > self.gameArea.width-32-characterOptions.character.width) {
				newCharacterPosition.x = self.gameArea.width-32-characterOptions.character.width;
			}
			
			if (newCharacterPosition.y < 32) { newCharacterPosition.y = 32; }
			else if (newCharacterPosition.y > self.gameArea.height-32-characterOptions.character.height) {
				newCharacterPosition.y = self.gameArea.height-32-characterOptions.character.height;
			}
			
			characterOptions.character.x      = newCharacterPosition.x;
			characterOptions.character.y      = newCharacterPosition.y;
			characterOptions.character.moving = newCharacterPosition.moving;
		});
		
		// Are they touching?
		if (this.detectCollision(this.hero, this.monster)) {
			this.monstersCaught++;
			this.reset();
		}
	};
	
	this.detectCollision = function (char1, char2) {
		return (
			char1.x <= (char2.x + char2.width)
			&& char2.x <= (char1.x + char1.width)
			&& char1.y <= (char2.y + char2.height)
			&& char2.y <= (char1.y + char1.height)
		);
	};
	
	// The main game loop
	this.run = function () {
		var now = Date.now();
		var deltaMs = now - this.then;
		var delta = deltaMs / 1000;

		this.update(delta);
		ui.render(!this.started, this.hero, this.monster, this.monstersCaught, delta);

		this.then = now;

		// Request to do this again ASAP
		requestAnimationFrame(this.run.bind(this)); //TODO Find how to retrieve game scope
		
		return delta;
	};
	
	// Init the game
	this.init();
};

//TODO change that
//Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Create the Game
var ui = new UserInterface(document.getElementById("game"), 512, 480);
var game = new Game(ui);
game.run();
