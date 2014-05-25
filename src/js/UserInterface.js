var UserInterface = function (div, width, height) {
    
	// Canvas
	this.div = div;
    this.width = width;
    this.height = height;
	
    this.canvasRatio = width/height;
	this.canvas = document.createElement("canvas");
	this.ctx = null;
    
    // Screen
    this.screenWidth = 512;
    this.screenHeight = 512;
    this.screenRatio = 1;
    
    // Adaptation
	this.ch = new CanvasHelper();
	
	this.init = function() {
		var self = this;
		
		this.ctx = this.canvas.getContext("2d");
		this.ch.ctx = this.ctx;
		this.div.appendChild(this.canvas);
        
		this.canvas.addEventListener("contextmenu", function (e) {
			e = e || window.event;
			if (e.stopPropagation) { e.stopPropagation(); }
			e.cancelBubble = true;
			e.preventDefault();
		});
		
		window.addEventListener("orientationchange", this.updateUI.bind(this));
        window.addEventListener("resize", this.updateUI.bind(this));
        
        this.updateUI();
	};
	
	// Update UI
    this.updateUI = function () {
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.screenRatio = this.screenWidth/this.screenHeight;
        
        if (this.canvasRatio>this.screenRatio) {
            this.ch.ratio = this.screenWidth / this.width;
            this.ch.marginTop = (this.screenHeight-(this.height*this.ch.ratio))/2;
            this.ch.marginLeft = 0;
        } else {
            this.ch.ratio =  this.screenHeight / this.height;
            this.ch.marginTop = 0;
            this.ch.marginLeft = (this.screenWidth-(this.width*this.ch.ratio))/2;
        }
		
        this.canvas.width = this.screenWidth;
        this.canvas.height = this.screenHeight;
    };
	
	// Draw everything
	this.render = function (graphics) {
		
		var self = this;
		
		// Draw graphics
		graphics.forEach( function(element) {
			element.gr.render(self.ch, element.x, element.y);
		});
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
    
    this.render = function(ch, x, y) {
        if (this.ready === true) {
            ch.drawImage(this.image, x, y);
        }
    };
    
    this.init(src);
};

var UIResource = function(render) {
	this.render = render;
};

var UIText = function(text, color, size, font, align, valign) {
	this.text = text;
	this.color = color;
	this.size = size;
	this.font = font;
	this.align = align;
	this.valign = valign;
	
	this.render = function(ch, x, y) {
		ch.drawText(this.text, x, y, this.color, this.align, this.valign, this.size, this.font);
	};
};