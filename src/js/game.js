var UserInterface = function (div, width, height) {
	
    // Debug
    this.debug = false;
    
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
	this.bgImage = new UIImage("images/background.png");
	this.heroImage = new UIImage("images/hero.png");
	this.monsterImage = new UIImage("images/monster.png");
	
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
        
		//Keys listeners
		window.addEventListener("keydown", function (e) {
			self.keysDown[e.keyCode] = true;
		}, false);

		window.addEventListener("keyup", function (e) {
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
        
        this.updateUI();
	};
	
    this.updateUI = function () {
        this.screenWidth = window.innerWidth;
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
	};
	
	this.tap = function (e) {
		this.clicked = true;
		this.track(e);
		e.preventDefault();
	};
	
	this.track = function (e) {
		
		e = e || window.event;
		
		if (this.clicked) {
			var pos = this.getElementPosition(this.canvas),
				tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,
				tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
			
			var currX = (tapX - pos.x);
			var currY = (tapY - pos.y);
            
            var realPos = this.getRealXY(currX, currY);

			this.touch = { x: realPos.x, y: realPos.y };
		}
	};
	
	this.release = function (e) {
		e = e || window.event;
		this.clicked = false;
		this.touch = { x: null, y: null };
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
		
		this.bgImage.render(this, 0, 0);
		
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
			
			this.heroImage.render(this, hero.x, hero.y);
            this.monsterImage.render(this, monster.x, monster.y);

			// Score
			this.ctx.font = "18px Helvetica";
			this.ctx.fillStyle = "rgb(250, 250, 250)";
			this.ctx.textAlign = "left";
			this.ctx.textBaseline = "top";
			
			this.drawText("Catches : " + monstersCaught, 0, 0, "white");
		}
        
        this.delta += delta;
        if(this.delta >= 0.2) {
            this.delta = 0.001;
            this.fps = Math.round(1/delta);
        }
        
        if (this.debug === true) {
            this.drawText(this.fps+" FPS", this.width, 0, "white", "right");

            if (this.touch.x !== null) {
                this.drawText("Click :"+Math.round(this.touch.x)+"/"+Math.round(this.touch.y), this.width, this.height-20, "white", "right");
            }
        }
	};
	
	// Init the UI
	this.init();
};

var UIImage = function (src) {
    this.image = new Image();
    this.ready = false;
    this.src = src;
    
    this.init = function (src) {
        var self = this;
        
        this.image.onload = function () {
            self.ready = true;
        };
        this.image.src = this.src;
    };
    
    this.width = function() {
        return this.image.width;
    };
    
    this.height = function() {
        return this.image.height;
    };
    
    this.render = function(ui, x, y) {
        if (this.ready === true) {
            ui.drawImage(this.image, x, y);
        }
    };
    
    this.init(src);
};

var Game = function() {
	
	// Date init
	this.then = Date.now();
	
	// Characters
	this.hero = { name: 'Hero', speed: 384, width: 32, height: 32, moving: false };
	this.monster = { name: 'monster', speed: 384, width: 32, height: 32, moving: false };
	
	// Area
	this.gameArea = { width: 512, height: 480 };
	
	// Game vars
	this.started = false;
	this.monstersCaught = 0;

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
	
	this.move = function(character, target, distanceMove) {
		
		var moving = false;
        
		var distX = character.x-target.x;
		var distY = character.y-target.y;
		
		var distance = Math.sqrt(distX*distX+distY*distY);
		var ratio = distance / distanceMove;
        
        var newX = character.x;
        var newY = character.y;
		
		if(ratio > 1) {
			newX -= distX / ratio;
			newY -= distY / ratio;
		} else {
            newX = target.x;
			newY = target.y;
        }
		
		if(Math.abs(character.x-newX) !== 0 || Math.abs(character.y-newY) !== 0) {
			moving = true;
		}
			
        //prevents from quitting the game area
        if (newX < 32) { newX = 32; }
        else if (newX > this.gameArea.width-32-character.width) {
            newX = this.gameArea.width-32-character.width;
        }

        if (newY < 32) { newY = 32; }
        else if (newY > this.gameArea.height-32-character.height) {
            newY = this.gameArea.height-32-character.height;
        }

        // Update the character position
        character.x      = newX;
        character.y      = newY;
        character.moving = moving;
	};
    
    
	
	// Update game objects
	this.update = function () {
		
		if (!this.started) { return; }
		
		// Are they touching?
		if (this.detectCollision(this.hero, this.monster)) {
			this.monstersCaught++;
			this.reset();
		}
	};
	
	this.detectCollision = function (char1, char2) {
		return (
			char1.x <= (char2.x + char2.width) &&
			char2.x <= (char1.x + char1.width) &&
			char1.y <= (char2.y + char2.height) &&
			char2.y <= (char1.y + char1.height)
		);
	};
	
	// Init the game
	this.init();
};

var MiddleWare = function(ui, game) {
    // 
	this.ui = ui;
    this.game = game;
	
	// Date init
	this.then = Date.now();

	// Character controls
	this.playerOneControls   = { up: 38, down: 40, left: 37, right: 39, touch: false };
	this.playerTwoControls = { up: 90, down: 83, left: 81, right: 68, touch: true };
    
    // Characters config
    this.characters = [
       {character : this.game.hero, controls : this.playerOneControls}, 
       {character : this.game.monster, controls : this.playerTwoControls}
    ];
    
    this.getCharacterTarget = function (char, controls, distanceMove) {
        var target = { x: char.x, y: char.y};

        if (controls.touch && this.ui.touch.x !== null) {
            target.x = this.ui.touch.x-(char.width/2);
            target.y = this.ui.touch.y-(char.height/2);
        } else {
            if (controls.up    in this.ui.keysDown) { target.y -= distanceMove; } // Player holding up
            if (controls.down  in this.ui.keysDown) { target.y += distanceMove; } // Player holding down
            if (controls.left  in this.ui.keysDown) { target.x -= distanceMove; } // Player holding left
            if (controls.right in this.ui.keysDown) { target.x += distanceMove; } // Player holding right
        }
        
        return target;
    };
    
    // The main game loop
	this.run = function () {
		var now = Date.now();
		var deltaMs = now - this.then;
		var delta = deltaMs / 1000;
        
        var self = this;

        if (!this.game.started && this.ui.touch.x>196 && this.ui.touch.x<316 && this.ui.touch.y>250 && this.ui.touch.y<300) {
            this.game.started = true;
        }
        
        this.characters.forEach(function(characterOptions) {
            
            var char = characterOptions.character;
            var controls = characterOptions.controls;
            var distanceMove = char.speed * delta;
            
            game.move(char, self.getCharacterTarget(char, controls, distanceMove), distanceMove);
        });
        
		this.game.update();
		this.ui.render(!this.game.started, this.game.hero, this.game.monster, this.game.monstersCaught, delta);

		this.then = now;

		// Request to do this again ASAP
		requestAnimationFrame(this.run.bind(this));
		
		return delta;
	};
};

// TODO change that
// Cross-browser support for requestAnimationFrame
var w = window;
var requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Create the Game
var ui = new UserInterface(document.getElementById("game"), 512, 480);
ui.debug = true;
var game = new Game();

// Run the game
var mw = new MiddleWare(ui, game);
mw.run();
