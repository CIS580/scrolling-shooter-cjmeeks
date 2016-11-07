(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const EntityManager = require('./entity-manager.js');
const Particles = require('./smoke_particles.js');


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var input = {
  up: false,
  down: false,
  left: false,
  right: false
}
var camera = new Camera(canvas);
var bullets = new BulletPool(10);
var missiles = [];
var player = new Player(bullets, missiles);
var em = new EntityManager(canvas, player);
var effect = new Particles(15);
var backgrounds = [
  new Image(),
  new Image(),
  new Image()
];
backgrounds[0].src = 'assets/PARALLAX/foreground.png';
backgrounds[1].src = 'assets/PARALLAX/midground.png';
backgrounds[2].src = 'assets/PARALLAX/background.png';
var gameEnd = false;
var levelEnd = false;
var win = false;
var level = 1;
var gameStart = function(level){
    if(gameEnd){
        em.player.totalKills = 0;
        em.player.health = 10;
        level = 1;
    }
    for(var i = 0; i < 3 + level; i++){em.addEnemy1();}
    for(var i = 0; i < 5 + level; i++){em.addEnemy2();}
    for(var i = 0; i < 3 + level; i++){em.addEnemy3();}
    for(var i = 0; i < 2 + level; i++){em.addEnemy4();}
    for(var i = 0; i < level; i++){em.addEnemy5();}
    player.position.x = 0;
    camera = new Camera(canvas);
    em.addPowerUp();
    win = false;
    em.player.levelKills = 0;
}
gameStart(level);



/**
 * @function onkeydown
 * Handles keydown events
 */
window.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = true;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = true;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = true;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = true;
      event.preventDefault();
      break;
    case " ":
        if(!levelEnd){
            bullets.add(player.position, {x: 15, y: 0});
            if(player.weapon == 2){
                bullets.add(player.position, {x: 15, y: 7});
                bullets.add(player.position, {x: 15, y: -7});
                effect.emit({x: player.position.x+27, y: player.position.y +10.5})
            }
            if(player.weapon == 3){
                bullets.add(player.position, {x: 15, y: 7});
                bullets.add(player.position, {x: 15, y: -7});
                bullets.add(player.position, {x: 15, y: 3});
                bullets.add(player.position, {x: 15, y: -3});
                effect.emit({x: player.position.x+27, y: player.position.y +10.5})
            }
        }
        else if(levelEnd && !gameEnd && !win){
            level++;
            levelEnd = false;
            gameStart(level);
        }
        else if(gameEnd && levelEnd && win){
            level = 1;
            gameEnd = false;
            levelEnd = false;
            gameStart(level);
        }
        event.preventDefault();
        break;

  }
}

/**
 * @function onkeyup
 * Handles keydown events
 */
window.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowUp":
    case "w":
      input.up = false;
      event.preventDefault();
      break;
    case "ArrowDown":
    case "s":
      input.down = false;
      event.preventDefault();
      break;
    case "ArrowLeft":
    case "a":
      input.left = false;
      event.preventDefault();
      break;
    case "ArrowRight":
    case "d":
      input.right = false;
      event.preventDefault();
      break;
  }
}

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}
masterLoop(performance.now());

/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
 var totalTime = 0;
 var dontCheck = false;
function update(elapsedTime) {
    effect.update(elapsedTime);
    if(dontCheck){
        totalTime += elapsedTime;
    }
    if(totalTime > 2000){
        dontCheck = false;
    }

  if(player.position.x > 2600){
    levelEnd = true;
    console.log("level end");
  }
  if(player.health == 0){
      gameEnd = true;
  }

  if(!levelEnd && !gameEnd){
      //update enemies and player
      em.update(elapsedTime, input);

      //check collision with player
      if(!dontCheck){
        if(em.checkCollisionsWithPlayer(player)){
            player.health -= 2;
            dontCheck = true;
            totalTime = 0;
        }
      }

      //check enemy and bullet checkBulletCollisions
      em.checkBulletCollisions(bullets, bullets.bulletRadius, elapsedTime);

      //check collision with powerup
      if(em.power.length > 0){
          if(em.checkCollision(player, em.power[0])){
            player.weapon = em.power[0].weapon;
            em.power = [];
          }
      }

      // update the camera
      camera.update(player);

      // Update bullets
      bullets.update(elapsedTime, function(bullet){
        if(!camera.onScreen(bullet)) return true;
        return false;
      });

      // Update missiles
      var markedForRemoval = [];
      missiles.forEach(function(missile, i){
        missile.update(elapsedTime);
        if(Math.abs(missile.position.x - camera.x) > camera.width * 2)
          markedForRemoval.unshift(i);
      });
      // Remove missiles that have gone off-screen
      markedForRemoval.forEach(function(index){
        missiles.splice(index, 1);
      });
  }
  else{
    if(level == 3){
        win = true;
        gameEnd = true;
        levelEnd = true;
    }
  }

}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
    effect.render(elapsedTime, ctx);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 1024, 786);

  // TODO: Render background
  ctx.save();
  ctx.translate(-camera.x * 0.2, 0);
  ctx.drawImage(backgrounds[2], 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(-camera.x * 0.6, 0);
  ctx.drawImage(backgrounds[1], 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(-camera.x, 0);
  ctx.drawImage(backgrounds[0], 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(-camera.x, 0);
  ctx.drawImage(backgrounds[0], 2600, 0);
  ctx.restore();
  // Transform the coordinate system using
  // the camera position BEFORE rendering
  // objects in the world - that way they
  // can be rendered in WORLD cooridnates
  // but appear in SCREEN coordinates
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  renderWorld(elapsedTime, ctx);
  ctx.restore();

  // Render the GUI without transforming the
  // coordinate system
  renderGUI(elapsedTime, ctx);
}

/**
  * @function renderWorld
  * Renders the entities in the game world
  * IN WORLD COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function renderWorld(elapsedTime, ctx) {
    // Render the bullets
    bullets.render(elapsedTime, ctx);
    //render enemies and player
    em.render(elapsedTime, ctx, camera);
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
  if(gameEnd && !win && !levelEnd){
    ctx.font = "48px serif";
    ctx.fillText("GAME OVER", 400, 250);
    ctx.fillText("Total Kills:" + em.player.totalKills, 400, 300);
    ctx.fillText("Level:" + level, 400, 350);
    ctx.font = "32px serif";
    ctx.fillText("<Press space to restart>", 400, 400);
  }
  else if(levelEnd && win && gameEnd){
      ctx.font = "48px serif";
      ctx.fillText("WINNER", 400, 250);
      ctx.fillText("Total Kills:" + em.player.totalKills, 400, 300);
  }
  else if(levelEnd && !gameEnd && !gameEnd){
      ctx.font = "48px serif";
      ctx.fillText("Level: " + level, 400, 250);
      ctx.fillText("Level Kills:" + em.player.levelKills, 400, 300);
  }

  ctx.font = "48px serif";
  ctx.fillText("Level: " + level, 750, 50);
  ctx.fillText("Level Kills:" + em.player.levelKills, 750, 150);
  ctx.fillText("Health: " + em.player.health, 750, 100);
}

},{"./bullet_pool":2,"./camera":3,"./entity-manager.js":9,"./game":10,"./player":11,"./smoke_particles.js":13,"./vector":14}],2:[function(require,module,exports){
"use strict";

/**
 * @module BulletPool
 * A class for managing bullets in-game
 * We use a Float32Array to hold our bullet info,
 * as this creates a single memory buffer we can
 * iterate over, minimizing cache misses.
 * Values stored are: positionX, positionY, velocityX,
 * velocityY in that order.
 */
module.exports = exports = BulletPool;

/**
 * @constructor BulletPool
 * Creates a BulletPool of the specified size
 * @param {uint} size the maximum number of bullets to exits concurrently
 */
function BulletPool(maxSize) {
  this.pool = new Float32Array(4 * maxSize);
  this.end = 0;
  this.max = maxSize;
  this.bulletRadius = 4;
}

/**
 * @function add
 * Adds a new bullet to the end of the BulletPool.
 * If there is no room left, no bullet is created.
 * @param {Vector} position where the bullet begins
 * @param {Vector} velocity the bullet's velocity
*/
BulletPool.prototype.add = function(position, velocity) {
  if(this.end < this.max) {
    this.pool[4*this.end] = position.x + 27;
    this.pool[4*this.end+1] = position.y + 10.5;
    this.pool[4*this.end+2] = velocity.x;
    this.pool[4*this.end+3] = velocity.y;
    this.end++;
  }
}

/**
 * @function update
 * Updates the bullet using its stored velocity, and
 * calls the callback function passing the transformed
 * bullet.  If the callback returns true, the bullet is
 * removed from the pool.
 * Removed bullets are replaced with the last bullet's values
 * and the size of the bullet array is reduced, keeping
 * all live bullets at the front of the array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {function} callback called with the bullet's position,
 * if the return value is true, the bullet is removed from the pool
 */
BulletPool.prototype.update = function(elapsedTime, callback) {
  for(var i = 0; i < this.end; i++){
    // Move the bullet
    this.pool[4*i] += this.pool[4*i+2];
    this.pool[4*i+1] += this.pool[4*i+3];
    // If a callback was supplied, call it
    if(callback && callback({
      x: this.pool[4*i],
      y: this.pool[4*i+1]
    })) {
      // Swap the current and last bullet if we
      // need to remove the current bullet
      this.pool[4*i] = this.pool[4*(this.end-1)];
      this.pool[4*i+1] = this.pool[4*(this.end-1)+1];
      this.pool[4*i+2] = this.pool[4*(this.end-1)+2];
      this.pool[4*i+3] = this.pool[4*(this.end-1)+3];
      // Reduce the total number of bullets by 1
      this.end--;
      // Reduce our iterator by 1 so that we update the
      // freshly swapped bullet.
      i--;
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
BulletPool.prototype.render = function(elapsedTime, ctx) {
  // Render the bullets as a single path
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "black";
  for(var i = 0; i < this.end; i++) {
    ctx.moveTo(this.pool[4*i], this.pool[4*i+1]);
    ctx.arc(this.pool[4*i], this.pool[4*i+1], this.bulletRadius, 0, 2*Math.PI);
  }
  ctx.fill();
  ctx.restore();
}

},{}],3:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');

/**
 * @module Camera
 * A class representing a simple camera
 */
module.exports = exports = Camera;

/**
 * @constructor Camera
 * Creates a camera
 * @param {Rect} screen the bounds of the screen
 */
function Camera(screen) {
  this.x = 0;
  this.y = 0;
  this.width = screen.width;
  this.height = screen.height;
  this.xMin = 200;
  this.xMax = 1000;
  this.xOff = 500;
}

/**
 * @function update
 * Updates the camera based on the supplied target
 * @param {Vector} target what the camera is looking at
 */
Camera.prototype.update = function(target) {
  // TODO: Align camera with player
  if(target.position.x < 2650){
      this.xOff += target.velocity.x;
      if(this.xOff > this.xMax) {
        this.x += this.xOff - this.xMax;
        this.xOff = this.xMax;
      }
      if(this.xOff < this.xMin) {
        this.x -= this.xMin - this.xOff;
        this.xOff = this.xMin;
      }
      if(this.x < 0) this.x = 0;
  }
}

/**
 * @function onscreen
 * Determines if an object is within the camera's gaze
 * @param {Vector} target a point in the world
 * @return true if target is on-screen, false if not
 */
Camera.prototype.onScreen = function(target) {
  return (
     target.x > this.x &&
     target.x < this.x + this.width &&
     target.y > this.y &&
     target.y < this.y + this.height
   );
}

/**
 * @function toScreenCoordinates
 * Translates world coordinates into screen coordinates
 * @param {Vector} worldCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toScreenCoordinates = function(worldCoordinates) {
  return Vector.subtract(worldCoordinates, this);
}

/**
 * @function toWorldCoordinates
 * Translates screen coordinates into world coordinates
 * @param {Vector} screenCoordinates
 * @return the tranformed coordinates
 */
Camera.prototype.toWorldCoordinates = function(screenCoordinates) {
  return Vector.add(screenCoordinates, this);
}

},{"./vector":14}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

module.exports = exports = Enemy3;


function Enemy3(canvas, x, y){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.width = 56;
    this.height = 47;
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
    this.position.x += this.velocity.x;
    if(this.position.x > 2600 || this.position.x < 1500){
        this.velocity.x  = -1 * this.velocity.x;
    }
}

Enemy3.prototype.render = function(time, ctx){
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.drawImage(this.img, 315, 354, 56, 47, 0, 0, this.width, this.height);
    ctx.restore();
}

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";

module.exports = exports = EntityManager;

const Enemy1 = require('./enemy1.js');
const Enemy2 = require('./enemy2.js');
const Enemy3 = require('./enemy3.js');
const Enemy4 = require('./enemy4.js');
const Enemy5 = require('./enemy5.js');
const Power = require('./power.js');
const Particles = require('./smoke_particles.js');


function EntityManager(canvas, player){
    this.worldWidth = 3000;
    this.worldHeight = 786;
    this.enemies1 = [];
    this.enemies2 = [];
    this.enemies3 = [];
    this.enemies4 = [];
    this.enemies5 = [];
    this.power = [];
    this.canvas = canvas;
    this.player = player;
    this.particles = new Particles(20);
}

EntityManager.prototype.update = function(time, input){
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
    this.player.update(time, input);
    this.particles.update(time);
}

EntityManager.prototype.render = function(time, ctx, camera){
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
    this.player.render(time, ctx, camera);
    this.particles.render(time, ctx);

}

EntityManager.prototype.addPowerUp = function(){
    this.power.push(new Power(Math.random()*2600, Math.random()* (400-100) + 100, Math.ceil(Math.random()*(3-1) +1)));
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
    if(!(index >= this.enemies1.length)){
        this.particles.emit(this.enemies1[index].position);
        this.enemies1.splice(index,1);
        this.player.levelKills++;
        this.player.totalKills++;
    }

}
EntityManager.prototype.removeEnemy2 = function(index){
    if(!(index >= this.enemies2.length)){
        this.particles.emit(this.enemies2[index].position);
        this.enemies2.splice(index,1);
        this.player.levelKills++;
        this.player.totalKills++;
    }

}
EntityManager.prototype.removeEnemy3 = function(index){
    if(!(index >= this.enemies3.length)){
        this.particles.emit(this.enemies3[index].position);
        this.enemies3.splice(index,1);
        this.player.levelKills++;
        this.player.totalKills++;
    }

}
EntityManager.prototype.removeEnemy4 = function(index){
    if(!(index >= this.enemies4.length)){
        this.particles.emit(this.enemies4[index].position);
        this.enemies4.splice(index,1);
        this.player.levelKills++;
        this.player.totalKills++;
    }

}
EntityManager.prototype.removeEnemy5 = function(index){
    if(!(index >= this.enemies5.length)){
        this.particles.emit(this.enemies5[index].position);
        this.enemies5.splice(index,1);
        this.player.levelKills++;
        this.player.totalKills++;
    }

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

},{"./enemy1.js":4,"./enemy2.js":5,"./enemy3.js":6,"./enemy4.js":7,"./enemy5.js":8,"./power.js":12,"./smoke_particles.js":13}],10:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],11:[function(require,module,exports){
"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
//const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(bullets, missiles) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.angle = 0;
  this.weapon = 1;
  this.position = {x: 0, y: 350};
  this.velocity = {x: 0, y: 0};
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.007D3C.png';
  this.weapons = new Image();
  this.weapons.src = 'assets/weapons.png';
  this.width = 35;
  this.height = 25;
  this.health = 10;
  this.totalKills = 0;
  this.levelKills = 0;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {
  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED;
  this.velocity.y = 0;
  if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 2650) this.position.x = 2650;
  //console.log(this.position.x);
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapasedTime, ctx, camera) {
  //var offset = this.angle * 23;


  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, 57, 49, 27, 21, 0, 0, this.width, this.height);
  ctx.restore();
  if(this.weapon == 2){
     ctx.save();
     ctx.translate(this.position.x, this.position.y);
     ctx.drawImage(this.weapons, 96, 173, 24, 16, 21, 3, 24, 16);
     ctx.restore();

  }
  if(this.weapon == 3){
     ctx.save();
     ctx.translate(this.position.x, this.position.y);
     ctx.drawImage(this.weapons, 97, 60, 46, 21, 21, 3, 24, 16);
     ctx.restore();

  }



}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:30, y:30});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}

},{"./vector":14}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
"use strict";

/**
 * @module SmokeParticles
 * A class for managing a particle engine that
 * emulates a smoke trail
 */
module.exports = exports = SmokeParticles;

/**
 * @constructor SmokeParticles
 * Creates a SmokeParticles engine of the specified size
 * @param {uint} size the maximum number of particles to exist concurrently
 */
function SmokeParticles(maxSize) {
  this.pool = new Float32Array(3 * maxSize);
  this.start = 0;
  this.end = 0;
  this.wrapped = false;
  this.max = maxSize;
}

/**
 * @function emit
 * Adds a new particle at the given position
 * @param {Vector} position
*/
SmokeParticles.prototype.emit = function(position) {
  if(this.end != this.max) {
    this.pool[3*this.end] = position.x;
    this.pool[3*this.end+1] = position.y;
    this.pool[3*this.end+2] = 0.0;
    this.end++;
  } else {
    this.pool[3] = position.x;
    this.pool[4] = position.y;
    this.pool[5] = 0.0;
    this.end = 1;
  }
}

/**
 * @function update
 * Updates the particles
 * @param {DOMHighResTimeStamp} elapsedTime
 */
SmokeParticles.prototype.update = function(elapsedTime) {
  function updateParticle(i) {
    this.pool[3*i+2] += elapsedTime;
    if(this.pool[3*i+2] > 2000) this.start = i;
  }
  var i;
  if(this.wrapped) {
    for(i = 0; i < this.end; i++){
      updateParticle.call(this, i);
    }
    for(i = this.start; i < this.max; i++){
      updateParticle.call(this, i);
    }
  } else {
    for(i = this.start; i < this.end; i++) {
      updateParticle.call(this, i);
    }
  }
}

/**
 * @function render
 * Renders all bullets in our array.
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
SmokeParticles.prototype.render = function(elapsedTime, ctx) {
  function renderParticle(i){
    var alpha = 1 - (this.pool[3*i+2] / 1000);
    var radius = 0.1 * this.pool[3*i+2];
    ctx.beginPath();
    ctx.arc(
      this.pool[3*i],   // X position
      this.pool[3*i+1], // y position
      radius, // radius
      0,
      2*Math.PI
    );
    ctx.fillStyle = 'rgba(160, 160, 160,' + alpha + ')';
    ctx.fill();
  }

  // Render the particles individually
  var i;
  if(this.wrapped) {
    for(i = 0; i < this.end; i++){
      renderParticle.call(this, i);
    }
    for(i = this.start; i < this.max; i++){
      renderParticle.call(this, i);
    }
  } else {
    for(i = this.start; i < this.end; i++) {
      renderParticle.call(this, i);
    }
  }
}

},{}],14:[function(require,module,exports){
"use strict";

/**
 * @module Vector
 * A library of vector functions.
 */
module.exports = exports = {
  add: add,
  subtract: subtract,
  scale: scale,
  rotate: rotate,
  dotProduct: dotProduct,
  magnitude: magnitude,
  normalize: normalize
}


/**
 * @function rotate
 * Scales a vector
 * @param {Vector} a - the vector to scale
 * @param {float} scale - the scalar to multiply the vector by
 * @returns a new vector representing the scaled original
 */
function scale(a, scale) {
 return {x: a.x * scale, y: a.y * scale};
}

/**
 * @function add
 * Computes the sum of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed sum
*/
function add(a, b) {
 return {x: a.x + b.x, y: a.y + b.y};
}

/**
 * @function subtract
 * Computes the difference of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed difference
 */
function subtract(a, b) {
  return {x: a.x - b.x, y: a.y - b.y};
}

/**
 * @function rotate
 * Rotates a vector about the Z-axis
 * @param {Vector} a - the vector to rotate
 * @param {float} angle - the angle to roatate by (in radians)
 * @returns a new vector representing the rotated original
 */
function rotate(a, angle) {
  return {
    x: a.x * Math.cos(angle) - a.y * Math.sin(angle),
    y: a.x * Math.sin(angle) + a.y * Math.cos(angle)
  }
}

/**
 * @function dotProduct
 * Computes the dot product of two vectors
 * @param {Vector} a the first vector
 * @param {Vector} b the second vector
 * @return the computed dot product
 */
function dotProduct(a, b) {
  return a.x * b.x + a.y * b.y
}

/**
 * @function magnitude
 * Computes the magnitude of a vector
 * @param {Vector} a the vector
 * @returns the calculated magnitude
 */
function magnitude(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

/**
 * @function normalize
 * Normalizes the vector
 * @param {Vector} a the vector to normalize
 * @returns a new vector that is the normalized original
 */
function normalize(a) {
  var mag = magnitude(a);
  return {x: a.x / mag, y: a.y / mag};
}

},{}]},{},[1]);
