"use strict";

module.exports = exports = Power;


function Power(x, y, num){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 45;
    this.height = 48;
    this.weapon = num;
    this.position = {
        x: x,
        y: y
    };
    this.img = new Image();
    this.img.src = 'assets/powerups.png';
}

Power.prototype.update = function(time){

}

Power.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 49, 115, 45, 48, 0, 0, this.width, this.height);
    ctx.restore();
}
