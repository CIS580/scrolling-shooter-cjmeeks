"use strict";

module.exports = exports = EntityManager;

const Enemy1 = require('./enemy1.js');
const Enemy2 = require('./enemy2.js');
const Enemy3 = require('./enemy3.js');
const Enemy4 = require('./enemy4.js');
const Enemy5 = require('./enemy5.js');
const Power = require('./power.js');


function EntityManager(canvas){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.enemies1 = [];
    this.enemies2 = [];
    this.enemies3 = [];
    this.enemies4 = [];
    this.enemies5 = [];
    this.power = [];
    this.canvas = canvas;
}

EntityManager.prototype.update = function(time){
    this.enemies1.forEach(function(enemy){
        enemy.update(time);
    });
    this.enemies2.forEach(function(enemy){
        enemy.update(time);
    });
    this.enemies3.forEach(function(enemy){
        enemy.update(time);
    });
    this.enemies4.forEach(function(enemy){
        enemy.update(time);
    });
    this.enemies5.forEach(function(enemy){
        enemy.update(time);
    });

}

EntityManager.prototype.render = function(time, ctx){
    this.enemies1.forEach(function(enemy){
        enemy.render(time, ctx);
    });
    this.enemies2.forEach(function(enemy){
        enemy.render(time, ctx);
    });
    this.enemies3.forEach(function(enemy){
        enemy.render(time, ctx);
    });
    this.enemies4.forEach(function(enemy){
        enemy.render(time, ctx);
    });
    this.enemies5.forEach(function(enemy){
        enemy.render(time, ctx);
    });
    if(this.power.length > 0){
        this.power[0].render(time,ctx);
    }

}

EntityManager.prototype.addPowerUp = function(){
    this.power.push(new Power(Math.random()*2600, Math.random()* (400-100) + 100, Math.ceil(Math.random()*(3-1) +1)));
    console.log(this.power[0].weapon);
}

EntityManager.prototype.addEnemy1 = function(){
    this.enemies1.push(new Enemy1(this.canvas, Math.random() * (1500-100) +101, Math.random() * (600 - 50) + 50));
}
EntityManager.prototype.addEnemy2 = function(){
    this.enemies2.push(new Enemy2(this.canvas, Math.random() * (1500-100) +101, Math.random() * (600 - 50) + 50));
}
EntityManager.prototype.addEnemy3 = function(){
    this.enemies3.push(new Enemy3(this.canvas, Math.random() * (2600-1500) +1501, Math.random() * (600 - 50) + 50));
}
EntityManager.prototype.addEnemy4 = function(){
    this.enemies4.push(new Enemy4(this.canvas, Math.random() * (2400-1500) +1501, Math.random() * (375 - 0) + 0));
}
EntityManager.prototype.addEnemy5 = function(){
    this.enemies5.push(new Enemy5(this.canvas, Math.random() * (2600-2200) +2200, Math.random() * (350 - 0) + 0));
}

EntityManager.prototype.removeEnemy1 = function(index){
    this.enemies1.splice(index,1);
}
EntityManager.prototype.removeEnemy2 = function(index){
    this.enemies2.splice(index,1);
}
EntityManager.prototype.removeEnemy3 = function(index){
    this.enemies3.splice(index,1);
}
EntityManager.prototype.removeEnemy4 = function(index){
    this.enemies4.splice(index,1);
}
EntityManager.prototype.removeEnemy5 = function(index){
    this.enemies5.splice(index,1);
}

EntityManager.prototype.checkCollision = function(a, b) {
  return a.position.x < b.position.x + b.width &&
    a.position.x + a.width > b.position.x &&
    a.position.y < b.position.y + b.height &&
    a.position.y + a.height > b.position.y;
}

EntityManager.prototype.checkBulletCollision = function(enemy, bullets, bulletRadius, index){
    var xDist = Math.abs(bullets.pool[index] - (enemy.position.x + (enemy.width / 2)));
    var yDist = Math.abs(bullets.pool[index+1] - (enemy.position.y + (enemy.height / 2)));
    if(xDist > (enemy.width/2 + bulletRadius)){ return false; }
    if(yDist > (enemy.height/2 + bulletRadius)){ return false; }
    if(xDist <= (enemy.width/2) && yDist <= (enemy.height/2)){return true;}
    var x = xDist - (enemy.width/2);
    var y = yDist - (enemy.height/2);
    return (Math.pow(x, 2) + Math.pow(y, 2) <= Math.pow(bulletRadius, 2));
}

EntityManager.prototype.checkBulletCollisions = function(bullets, bulletRadius,elapsedTime){
    var self = this;
    var remove1 = [];
    var remove2 = [];
    var remove3 = [];
    var remove4 = [];
    var remove5 = [];
    for(var i = 0; i < bullets.pool.length; i += 4){
        this.enemies1.forEach(function(enemy, index){
            if(self.checkBulletCollision(enemy, bullets, bulletRadius, i)){
                bullets.update(elapsedTime, function(bullet){
                    return true;
                });
                remove1.push(index);
            }
        });
        this.enemies2.forEach(function(enemy, index){
            if(self.checkBulletCollision(enemy, bullets, bulletRadius, i)){
                bullets.update(elapsedTime, function(bullet){
                    return true;
                });
                remove2.push(index);
            }
        });
        this.enemies3.forEach(function(enemy, index){
            if(self.checkBulletCollision(enemy, bullets, bulletRadius, i)){
                bullets.update(elapsedTime, function(bullet){
                    return true;
                });
                remove3.push(index);
            }
        });
        this.enemies4.forEach(function(enemy, index){
            if(self.checkBulletCollision(enemy, bullets, bulletRadius, i)){
                bullets.update(elapsedTime, function(bullet){
                    return true;
                });
                remove4.push(index);
            }
        });
        this.enemies5.forEach(function(enemy, index){
            if(self.checkBulletCollision(enemy, bullets, bulletRadius, i)){
                bullets.update(elapsedTime, function(bullet){
                    return true;
                });
                remove5.push(index);
            }
        });
    }
    this.handleBullet1(remove1);
    this.handleBullet2(remove2);
    this.handleBullet3(remove3);
    this.handleBullet4(remove4);
    this.handleBullet5(remove5);
}

EntityManager.prototype.checkCollisionsWithPlayer = function(player){
    var collision = false;
    var self = this;
        this.enemies1.forEach(function(enemy){
            if(self.checkCollision(player,enemy)){
                collision = true;
            }
        });
        this.enemies2.forEach(function(enemy){
            if(self.checkCollision(player,enemy)){
                collision = true;
            }
        });
        this.enemies3.forEach(function(enemy){
            if(self.checkCollision(player,enemy)){
                collision = true;
            }
        });
        this.enemies4.forEach(function(enemy){
            if(self.checkCollision(player,enemy)){
                collision = true;
            }
        });
        this.enemies5.forEach(function(enemy){
            if(self.checkCollision(player,enemy)){
                collision = true;
            }
        });
    return collision;
}

EntityManager.prototype.handleBullet1= function(handle){
    for(var i = 0; i < handle.length; i++){
        this.removeEnemy1(handle[i]);
    }
}
EntityManager.prototype.handleBullet2= function(handle){
    for(var i = 0; i < handle.length; i++){
        this.removeEnemy2(handle[i]);
    }
}
EntityManager.prototype.handleBullet3= function(handle){
    for(var i = 0; i < handle.length; i++){
        this.removeEnemy3(handle[i]);
    }
}
EntityManager.prototype.handleBullet4= function(handle){
    for(var i = 0; i < handle.length; i++){
        this.removeEnemy4(handle[i]);
    }
}
EntityManager.prototype.handleBullet5= function(handle){
    for(var i = 0; i < handle.length; i++){
        this.removeEnemy5(handle[i]);
    }
}

EntityManager.prototype.checkForLevelDone = function(){
    if(this.enemies1.length > 0 && this.enemies2.length > 0 && this.enemies3.length > 0 && this.enemies4.length > 0 && this.enemies5.length > 0){
        return true;
    }
    else{
        return false;
    }
}
