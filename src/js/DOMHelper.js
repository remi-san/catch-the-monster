var DOMHelper = function() {} ;

DOMHelper.getElementPosition = function (element) {
    var parentOffset,
        pos = {
            x: element.offsetLeft,
            y: element.offsetTop 
        };
    
    if (element.offsetParent) {
        parentOffset = DOMHelper.getElementPosition(element.offsetParent);
        pos.x += parentOffset.x;
        pos.y += parentOffset.y;
   }
   return pos;
};