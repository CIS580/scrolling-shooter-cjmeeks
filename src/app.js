"use strict";

/* Classes and Libraries */
const Game = require('./game');
const Vector = require('./vector');
const Camera = require('./camera');
const Player = require('./player');
const BulletPool = require('./bullet_pool');
const EntityManager = require('./entity-manager.js')


/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);
var em = new EntityManager(canvas);
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
var level = 1;
var gameStart = function(level){
    for(var i = 0; i < 3 + level; i++){em.addEnemy1();}
    for(var i = 0; i < 5 + level; i++){em.addEnemy2();}
    for(var i = 0; i < 3 + level; i++){em.addEnemy3();}
    for(var i = 0; i < 2 + level; i++){em.addEnemy4();}
    for(var i = 0; i < level; i++){em.addEnemy5();}
    player.position.x = 0;
    camera = new Camera(canvas);
    em.addPowerUp();
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
        bullets.add(player.position, {x: 15, y: 0});
        if(player.weapon == 2){
            bullets.add(player.position, {x: 15, y: 7});
            bullets.add(player.position, {x: 15, y: -7});
        }
        if(player.weapon == 3){
            bullets.add(player.position, {x: 15, y: 7});
            bullets.add(player.position, {x: 15, y: -7});
            bullets.add(player.position, {x: 15, y: 3});
            bullets.add(player.position, {x: 15, y: -3});
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
function update(elapsedTime) {

  if(player.position.x > 2600){
    levelEnd = true;
    console.log("level end");
  }
  if(player.health == 0){
      gameEnd = true;
  }

  if(!levelEnd && !gameEnd){
      // update the player
      player.update(elapsedTime, input);

      //update enemies
      em.update(elapsedTime);

      //check collision with player
      if(em.checkCollisionsWithPlayer(player)){
          player.health -= 2;
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

}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
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
    // Render the player
    player.render(elapsedTime, ctx, camera);
    //render enemies
    em.render(elapsedTime, ctx);
}

/**
  * @function renderGUI
  * Renders the game's GUI IN SCREEN COORDINATES
  * @param {DOMHighResTimeStamp} elapsedTime
  * @param {CanvasRenderingContext2D} ctx
  */
function renderGUI(elapsedTime, ctx) {
  // TODO: Render the GUI
}
