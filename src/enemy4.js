"use strict";

module.exports = exports = Enemy3;


function Enemy3(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 22;
    this.height = 146;
    this.health = 2;
    this.position = {
        x: x,
        y: y
    };
    this.velocity = {
        x: 2,
        y: 2
    };
    this.img = new Image();
    this.img.src = 'assets/enemies.png';
}

Enemy3.prototype.update = function(time){
    this.position.y += this.velocity.y;
    if(this.position.y > 600 || this.position.y < 50){
        this.velocity.y  = -1 * this.velocity.y;
    }
}

Enemy3.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 425, 0, 22, 146, 0, 0, this.width, this.height);
    ctx.restore();
}
