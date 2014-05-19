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
	};
	
	this.tap = function (e) {
		var pos = this.getElementPosition(this.canvas),
			tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
			tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
		
		var x = (tapX - pos.x);
		var y = (tapY - pos.y);

		if (x>196 && x<316 && y>250 && y<300) {
			this.start = true;
		}
	};
	
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
				this.ctx.drawImage(this.heroImage, hero.x+32, hero.y+32);
			}

			if (this.monsterReady) {
				this.ctx.drawImage(this.monsterImage, monster.x+32, monster.y+32);
			}

			// Score
			this.ctx.font = "18px Helvetica";
			this.ctx.fillStyle = "rgb(250, 250, 250)";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
			
			this.ctx.fillText("Catches : " + monstersCaught, 0, 0);
			this.ctx.fillText("Hero :"+hero.x+"/"+hero.y, 0, this.canvas.height-20);
			this.ctx.fillText("Robot : "+monster.x+"/"+monster.y, 0, this.canvas.height-40);
			
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
	this.hero = { name: 'Hero', speed: 384, width: 32, height: 32, moving: false };
	this.monster = { name: 'monster', speed: 384, width: 32, height: 32, moving: false };
	
	// Area
	this.gameArea = { width: 512-64, height: 480-64 };

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
		
		if (keys.up    in ui.keysDown) { y -= character.speed * modifier; moving = true; } // Player holding up
		if (keys.down  in ui.keysDown) { y += character.speed * modifier; moving = true; } // Player holding down
		if (keys.left  in ui.keysDown) { x -= character.speed * modifier; moving = true; } // Player holding left
		if (keys.right in ui.keysDown) { x += character.speed * modifier; moving = true; } // Player holding right
		
		//prevents from quitting the game area
		if (x < 0) { x = 0; }
		else if (x > this.gameArea.width-character.width) { x = this.gameArea.width-character.width; }
		
		if (y < 0) { y = 0; }
		else if (y > this.gameArea.height-character.height) { y = this.gameArea.height-character.height; }

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
