var CatchGame = function() {
	
	// State
	this.started = false;
	this.then = Date.now();
	
	// Characters
	this.hero = { name: 'Hero', speed: 384, width: 32, height: 32, moving: false };
	this.monster = { name: 'monster', speed: 384, width: 32, height: 32, moving: false };
	
	// Area
	this.gameArea = { width: 512, height: 480 };
	this.borders = { left : 32, top: 32, right: 480, bottom: 448};
	
	// Game vars
	this.monstersCaught = 0;

	// Init method
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
	
	// Prevents from quitting the game area
	this.keepInBoundaries = function (character) {
		if (character.x < this.borders.left) { character.x = this.borders.left; }
        else if (character.x > this.borders.right-character.width) {
            character.x = this.borders.right-character.width;
        }

        if (character.y < this.borders.top) { character.y = this.borders.top; }
        else if (character.y > this.borders.bottom-character.height) {
            character.y = this.borders.bottom-character.height;
        }
	};
	
	// Detect characters collisions
	this.detectCollision = function (char1, char2) {
		return (
			char1.x <= (char2.x + char2.width) &&
			char2.x <= (char1.x + char1.width) &&
			char1.y <= (char2.y + char2.height) &&
			char2.y <= (char1.y + char1.height)
		);
	};
    
    // Character movement management
	this.move = function(character, target, distanceMove) {
		
        if (!this.started) { return; }
        
		// Distance vars
		var distX = character.x-target.x;
		var distY = character.y-target.y;
		var ratio = Math.sqrt(distX*distX+distY*distY) / distanceMove;
        
		// New coords variables
        var newX = target.x;
        var newY = target.y;
		
		// Computing new position
		if(ratio > 1) {
			newX = character.x - (distX / ratio);
			newY = character.y - (distY / ratio);
		}
		
		// Detect movement
		character.moving = (Math.abs(character.x-newX) !== 0 || Math.abs(character.y-newY) !== 0);
		
        // Update the character position
        character.x      = newX;
        character.y      = newY;
		
		// Keep character in borders
		this.keepInBoundaries(character);
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
	
	// Init the game
	this.init();
};

var GameRunner = function(ui, game, debug) {
    
	// Debug
	this.debug = debug || false;
	
	// Components
	this.ui = ui;
    this.game = game;
	
	// Controllers
	this.kc = new KeyboardController();
	this.tc = new TouchController(this.ui.canvas);

    // FPS
	this.delta = 0.2;
	this.fps = 0;
	
	// Date init
	this.then = Date.now();

	// Graphics
	this.bgImage = new UIImage("images/background.png", this.ui.width, this.ui.height);
	this.heroImage = new UIImage("images/hero.png", this.game.hero.width, this.game.hero.height);
	this.monsterImage = new UIImage("images/monster.png", this.game.monster.width, this.game.monster.height);
    
	this.menu = new UIResource(function (ui, x, y) {
		ui.drawRectangle(x, y, 400, 200, "lightgrey", "black", "6"); // Menu
		ui.drawText("Catch the Robot", 200+x, 40+y, "black", "center", "top", 32); // Menu Title
		ui.drawRectangle(140+x, 110+y, 120, 50, "black"); // Start button
		ui.drawText("Start", 200+x, 116+y, "white", "center", "top", 32); // Start button text
	});
	
	// Character controls
	this.playerOneControls   = { up: 38, down: 40, left: 37, right: 39, touch: false };
	this.playerTwoControls = { up: 90, down: 83, left: 81, right: 68, touch: true };
    
    // Characters config
    this.characters = [
       {character : this.game.hero, controls : this.playerOneControls}, 
       {character : this.game.monster, controls : this.playerTwoControls}
    ];
	
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////// METHODS ///////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
    
	// Compute character target
    this.getCharacterTarget = function (char, controls, distanceMove) {
        var target = { x: char.x, y: char.y};

        if (controls.touch && this.tc.touch.x !== null) {
			var pos = this.ui.ch.getRealXY(this.tc.touch.x, this.tc.touch.y);
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
    
    // The main game loop
	this.run = function () {
		
		var self = this;
		
		var now = Date.now();
		var deltaMs = now - this.then;
		var delta = deltaMs / 1000;
		
		// FPS computing
		this.delta += delta;
        if(this.delta >= 0.2) {
            this.delta = 0.001;
            this.fps = Math.round(1/delta);
        }

		// TODO move menu button detection
		var pos = this.ui.ch.getRealXY(this.tc.touch.x, this.tc.touch.y);
        if (!this.game.started && pos.x>196 && pos.x<316 && pos.y>250 && pos.y<300) {
            this.game.started = true;
            DOMHelper.sleep(200);
        }
        
		// Update characters positions
        this.characters.forEach(function(characterOptions) {
            var char = characterOptions.character;
            var controls = characterOptions.controls;
            var distanceMove = char.speed * delta;
            game.move(char, self.getCharacterTarget(char, controls, distanceMove), distanceMove);
        });
        
		this.game.update();
		
		// Build graphics array
		var graphics = [ { gr: this.bgImage, x: 0, y: 0 } ];
		if (!this.game.started) {
			graphics.push({ gr: this.menu, x: 56, y: 140 });
		} else {
			graphics.push({ gr: this.heroImage, x: this.game.hero.x, y: this.game.hero.y });
			graphics.push({ gr: this.monsterImage, x: this.game.monster.x, y: this.game.monster.y });
			graphics.push({ gr: new UIText("Score : "+this.game.monstersCaught, "white"), x: 5, y: 5 });
		}
		
		// Display debug info
        if (this.debug === true) {
			graphics.push({ gr: new UIText(this.fps+" FPS", "white", 16, "Helvetica", "right"), x: this.ui.width, y: 5 });

            if (this.tc.touch.x !== null) {
				pos = this.ui.ch.getRealXY(this.tc.touch.x, this.tc.touch.y);
				graphics.push({ gr: new UIText("Click :"+Math.round(pos.x)+"/"+Math.round(pos.y), "white", 16, "Helvetica", "right"), x: this.ui.width, y: this.ui.height-20 });
            }
        }
		
		this.ui.render(graphics);
		this.then = now;

		// Request to do this again ASAP
		window.requestAnimationFrame(this.run.bind(this));
		
		return delta;
	};
};
