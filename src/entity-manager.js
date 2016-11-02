"use strict";

module.exports = exports = EntityManager;

const Enemy1 = require('./enemy1.js');
const Enemy2 = require('./enemy2.js');
const Enemy3 = require('./enemy3.js');


function EntityManager(canvas){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.enemies1 = [];
    this.enemies2 = [];
    this.enemies3 = [];
    this.enemies4 = [];
    this.enemies5 = [];
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
