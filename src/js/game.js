var UserInterface = function (div) {
	
	this.start = false;
	
	// Canvas
	this.div = div;
	this.canvas = null;
	this.ctx = null;
	
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
	
	this.init = function() {
		var self = this;
		
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		
		this.canvas.width = 512;
		this.canvas.height = 480;
		this.div.appendChild(this.canvas);
		
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
		
		this.canvas.addEventListener("touchstart", this.tap.bind(this));
		this.canvas.addEventListener("mousedown", this.tap.bind(this));
		
		this.canvas.addEventListener("touchmove", this.tap.bind(this));
		this.canvas.addEventListener("mousemove", this.track.bind(this));
		
		this.canvas.addEventListener("touchend", this.release.bind(this));
		this.canvas.addEventListener("mouseup", this.release.bind(this));
		
		this.canvas.addEventListener("touchleave", this.release.bind(this));
		this.canvas.addEventListener("mouseout", this.release.bind(this));
	};
	
	this.tap = function (e) {
		this.clicked = true;
		this.track(e);
	}
	
	this.track = function (e) {
		
		if (this.clicked) {
			var pos = this.getElementPosition(this.canvas),
				tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
				tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
			
			var currX = (tapX - pos.x);
			var currY = (tapY - pos.y);

			this.touch = { x: currX, y: currY };
			
			if (currX>196 && currX<316 && currY>250 && currY<300) {
				this.start = true;
			}
		}
	};
	
	this.release = function (e) {
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
	
	// Draw everything
	this.render = function (displayMenu, hero, monster, monstersCaught) {
		
		if (this.bgReady) {
			this.ctx.drawImage(this.bgImage, 0, 0);
		}
		
		if (displayMenu) {
			
			// Menu Colors
			this.ctx.fillStyle = "lightgrey";
			this.ctx.lineWidth="6";
			this.ctx.strokeStyle="black";
			
			// Menu
			this.ctx.beginPath();
			this.ctx.rect(56,140,400,200); 
			this.ctx.fill();
			this.ctx.stroke();
			
			// Menu Title colors
			this.ctx.textAlign = "center";
			this.ctx.font = "32px Helvetica";
			this.ctx.textBaseline = "top";
			this.ctx.fillStyle = "black";
			
			// Menu Title
			this.ctx.fillText("Catch the Robot", 256, 180);
			
			// Start button
			this.ctx.beginPath();
			this.ctx.rect(196,250,120,50); 
			this.ctx.fill();
			this.ctx.stroke();
			
			// Start button text
			this.ctx.fillStyle = "white";
			this.ctx.fillText("Start", 256, 256);
			
		} else {
			
			if (this.heroReady) {
				this.ctx.drawImage(this.heroImage, hero.x, hero.y);
			}

			if (this.monsterReady) {
				this.ctx.drawImage(this.monsterImage, monster.x, monster.y);
			}

			// Score
			this.ctx.font = "18px Helvetica";
			this.ctx.fillStyle = "rgb(250, 250, 250)";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
			
			this.ctx.fillText("Catches : " + monstersCaught, 0, 0);
			this.ctx.fillText("Hero :"+hero.x+"/"+hero.y, 0, this.canvas.height-20);
			this.ctx.fillText("Robot : "+monster.x+"/"+monster.y, 0, this.canvas.height-40);
			
			this.ctx.textAlign = "right";
			this.ctx.fillText("Click :"+this.touch.x+"/"+this.touch.y, this.canvas.width, this.canvas.height-20);
		}
	};
	
	// Init the UI
	this.init();
};

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
		
		return {x: Math.round(x), y: Math.round(y), moving: moving};
	};
	
	// Update game objects
	this.update = function (modifier) {
		
		if(this.ui.start) {
			this.start();
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
	
	this.start = function () {
		this.started = true;
		this.ui.start = false;
	};
	
	// The main game loop
	this.run = function () {
		var now = Date.now();
		var delta = now - this.then;

		this.update(delta / 1000);
		ui.render(!this.started, this.hero, this.monster, this.monstersCaught);

		this.then = now;

		// Request to do this again ASAP
		requestAnimationFrame(this.run.bind(this)); //TODO Find how to retrieve game scope
	};
	
	// Init the game
	this.init();
};

//TODO change that
//Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Create the Game
var ui = new UserInterface(document.getElementById("game"));
var game = new Game(ui);
game.run();
