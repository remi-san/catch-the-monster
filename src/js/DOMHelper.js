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

DOMHelper.sleep = function (milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
};