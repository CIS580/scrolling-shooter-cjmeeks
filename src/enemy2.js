"use strict";

module.exports = exports = Enemy2;


function Enemy2(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 61;
    this.height = 60;
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

Enemy2.prototype.update = function(time){
    this.position.y += this.velocity.y;
    if(this.position.y > 600 || this.position.y < 50){
        this.velocity.y  = -1 * this.velocity.y;
    }
}

Enemy2.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 196, 63, 61, 62, 0, 0, this.width, this.height);
    ctx.restore();
}
