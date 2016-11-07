"use strict";

module.exports = exports = Enemy4;


function Enemy4(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 51;
    this.height = 300;
    this.health = 2;
    this.position = {
        x: x,
        y: y
    };
    this.velocity = {
        x: 0,
        y: 2
    };
    this.img = new Image();
    this.img.src = 'assets/enemies.png';
}

Enemy4.prototype.update = function(time){
    this.position.y += this.velocity.y;
    if(this.position.y > 375 || this.position.y < 0){
        this.velocity.y  = -1 * this.velocity.y;
    }
}

Enemy4.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 425, 0, 51, 146, 0, 0, this.width, this.height);
    ctx.restore();
}
