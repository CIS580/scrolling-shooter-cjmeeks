"use strict";

module.exports = exports = Enemy1;


function Enemy1(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 88;
    this.height = 37;
    this.health = 2;
    this.position = {
        x: x,
        y: y
    };
    this.velocity = {
        x: 2,
        y: 0
    };
    this.img = new Image();
    this.img.src = 'assets/enemies.png';
}

Enemy1.prototype.update = function(time){
    this.position.x += this.velocity.x;
    if(this.position.x > 1500 || this.position.x < 100){
        this.velocity.x  = -1 * this.velocity.x;
    }
}

Enemy1.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 0, 0, 88, 36, 0, 0, this.width, this.height);
    ctx.restore();
}
