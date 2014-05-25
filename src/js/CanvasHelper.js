var CanvasHelper = function (ctx, ratio, marginLeft, marginTop) {
	
	this.ctx = ctx;
    
    // Scaling info
	this.ratio = ratio || 1;
    this.marginLeft = marginLeft || 0;
    this.marginTop = marginTop || 0;
	
	this.getRealValue = function (value) {
        if (value === undefined) {
            return undefined;
        }
        return Math.round(value / this.ratio);
    };
    
    this.getRealXY = function (x, y) {
        return { x: this.getRealValue(x-this.marginLeft), y: this.getRealValue(y-this.marginTop) };
    };
    
    this.getScreenValue = function (value) {
        if (value === undefined) {
            return undefined;
        }
        return Math.round(value * this.ratio);
    };
    
    this.getScreenXY = function (x, y) {
        return { x: this.getScreenValue(x)+this.marginLeft, y: this.getScreenValue(y)+this.marginTop };
    };
    
    this.drawImage = function (image, x, y, width, height) {
        width = width || image.width;
        height = height || image.height;
        var pos = this.getScreenXY(x, y);
        this.ctx.drawImage(image, 0, 0, image.width, image.height, pos.x, pos.y, this.getScreenValue(width), this.getScreenValue(height));
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
    
    this.clear = function (x, y, width, height) {
        var pos = this.getScreenXY((x || 0), (y || 0));
        var realWidth = this.getScreenValue(width) || this.ctx.canvas.width;
        var realHeight = this.getScreenValue(height) || this.ctx.canvas.height;
        this.ctx.clearRect(pos.x, pos.y, realWidth, realHeight);
    };
};