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
