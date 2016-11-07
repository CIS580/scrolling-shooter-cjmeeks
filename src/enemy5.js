"use strict";

module.exports = exports = Enemy5;


function Enemy5(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 200;
    this.height = 200;
    this.health = 2;
    this.position = {
        x: x,
        y: y
    };
    this.velocity = {
        x: 0,
        y: 0
    };
    this.img = new Image();
    this.img.src = 'assets/enemies.png';
}

Enemy5.prototype.update = function(time){
    this.position.y += this.velocity.y;
    if(this.position.y > 375 || this.position.y < 0){
        this.velocity.y  = -1 * this.velocity.y;
    }
}

Enemy5.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 371, 459, 51, 50, 0, 0, this.width, this.height);
    ctx.restore();
}
