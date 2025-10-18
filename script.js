// Variables
var player;
var playerImage;
var fallingObjects = []; // Can be coins or rocks
var enemyImage;
var backgroundImage;
var isGameOver;

// Game state
var score = 0;
var highScore = 0;
var baseSpeed = 3;
var dodgeCount = 0;
var coinsCollected = 0;
var maxObjects = 5;
var spawnTimer = 0;

// Particle system
var particles = [];
var stars = [];

// Canvas size - optimized for viewport
var canvasWidth = 500;
var canvasHeight = 650;

// Preload images
function preload() {
  // Use error handling for images
  playerImage = loadImage(
    'https://cloud-9x4hvopq6-hack-club-bot.vercel.app/0N5uCbDu.png',
    () => {},
    () => { playerImage = null; }
  );
  enemyImage = loadImage(
    'https://cloud-cfakr2ma3-hack-club-bot.vercel.app/0OdL0XPt.png',
    () => {},
    () => { enemyImage = null; }
  );
  backgroundImage = loadImage(
    'https://cloud-kh6ahxow6-hack-club-bot.vercel.app/0aKQOg3G.png',
    () => {},
    () => { backgroundImage = null; }
  );
}

// Setup function - runs once at start
function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-holder');

  isGameOver = false;
  score = 0;
  dodgeCount = 0;
  coinsCollected = 0;
  fallingObjects = [];
  spawnTimer = 0;

  // Create player sprite
  player = createSprite(width / 2, height - 60, 50, 50);

  // Add image if loaded, otherwise use neon shape
  if (playerImage) {
    player.addImage(playerImage);
  } else {
    // Neon spaceship
    player.draw = function() {
      push();
      // Outer cyan glow
      fill(0, 255, 255, 100);
      noStroke();
      triangle(0, -30, -20, 20, 20, 20);

      // Main body
      fill(0, 200, 255);
      stroke(0, 255, 255);
      strokeWeight(3);
      triangle(0, -25, -15, 15, 15, 15);

      // Cockpit
      fill(255, 255, 255, 200);
      ellipse(0, -5, 8, 8);

      // Engine glow
      fill(255, 100, 0, 200);
      ellipse(-8, 15, 5, 5);
      ellipse(8, 15, 5, 5);
      pop();
    };
  }

  // Create initial objects
  createFallingObject();

  // Create twinkling stars
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 4),
      twinkle: random(100, 255),
      speed: random(0.2, 0.8)
    });
  }
}

// Create a new falling object (coin or rock)
function createFallingObject() {
  if (fallingObjects.length < maxObjects) {
    let objectSize = random(30, 50);
    let newObject = createSprite(random(objectSize, width - objectSize), -objectSize, objectSize, objectSize);

    // 60% chance for coin, 40% chance for rock
    let isCoin = random() < 0.6;

    if (isCoin) {
      // Create a coin
      newObject.objectType = 'coin';
      newObject.shapeColor = color(255, 215, 0); // Gold color
      newObject.rotationSpeed = 5;

      // Draw neon coin shape
      newObject.draw = function() {
        push();
        // Outer glow
        fill(255, 215, 0, 100);
        noStroke();
        ellipse(0, 0, this.width + 10, this.height + 10);

        // Main coin
        fill(255, 215, 0);
        stroke(255, 255, 100);
        strokeWeight(4);
        ellipse(0, 0, this.width, this.height);

        // Inner shine
        fill(255, 255, 150, 150);
        ellipse(this.width * 0.2, -this.height * 0.2, this.width * 0.3, this.height * 0.3);

        // $ symbol with glow
        fill(255, 200, 0);
        stroke(255, 255, 0);
        strokeWeight(2);
        textAlign(CENTER, CENTER);
        textSize(this.width * 0.6);
        textStyle(BOLD);
        text('$', 0, 0);
        pop();
      };
    } else {
      // Create a rock
      newObject.objectType = 'rock';
      newObject.shapeColor = color(80, 80, 80); // Gray color
      newObject.rotationSpeed = random(3, 7);

      // Draw cyberpunk rock shape
      if (enemyImage) {
        newObject.addImage(enemyImage);
        newObject.tint = color(255, 100, 0); // Orange tint
      } else {
        newObject.draw = function() {
          push();
          // Outer danger glow
          fill(255, 100, 0, 80);
          noStroke();
          ellipse(0, 0, this.width + 15, this.height + 15);

          // Main rock body
          fill(120, 100, 90);
          stroke(255, 100, 0);
          strokeWeight(3);

          // Draw irregular rock shape
          beginShape();
          for (let i = 0; i < 8; i++) {
            let angle = (TWO_PI / 8) * i;
            let r = this.width/2 * random(0.7, 1.0);
            let x = cos(angle) * r;
            let y = sin(angle) * r;
            vertex(x, y);
          }
          endShape(CLOSE);

          // Add danger stripes
          stroke(255, 50, 0, 150);
          strokeWeight(2);
          line(-this.width/3, 0, this.width/3, 0);
          line(0, -this.height/3, 0, this.height/3);

          pop();
        };
      }
    }

    newObject.velocity.y = baseSpeed + random(1, 3);
    newObject.velocity.x = random(-1, 1);

    fallingObjects.push(newObject);
  }
}

// Draw function - runs repeatedly
function draw() {
  if (isGameOver) {
    gameOver();
  } else {
    // Draw cyberpunk background
    if (backgroundImage) {
      tint(100, 200, 255, 150);
      background(backgroundImage);
      noTint();
    } else {
      // Gradient background
      for (let i = 0; i < height; i++) {
        let inter = map(i, 0, height, 0, 1);
        let c = lerpColor(color(0, 10, 20), color(5, 5, 30), inter);
        stroke(c);
        line(0, i, width, i);
      }
    }

    // Add scanline effect
    for (let i = 0; i < height; i += 4) {
      stroke(0, 255, 255, 10);
      line(0, i, width, i);
    }

    // Draw twinkling stars
    drawStars();

    // Increase score over time
    score += 1;

    // Spawn new objects based on timer and difficulty
    spawnTimer++;
    let spawnRate = max(60, 180 - floor(score / 500) * 20);
    if (spawnTimer > spawnRate) {
      createFallingObject();
      spawnTimer = 0;
    }

    // Check for collision with falling objects
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
      let obj = fallingObjects[i];

      if (obj.overlap(player)) {
        if (obj.objectType === 'coin') {
          // Collect coin - add score!
          score += 100;
          coinsCollected++;

          // Create sparkle effect
          createSparkle(obj.position.x, obj.position.y);

          // Play coin sound
          playCoinSound();

          // Remove coin
          obj.remove();
          fallingObjects.splice(i, 1);
        } else if (obj.objectType === 'rock') {
          // Hit rock - game over!
          isGameOver = true;

          // Create explosion particles
          createExplosion(player.position.x, player.position.y);

          // Play crash sound
          playCrashSound();

          // Update high score
          if (score > highScore) {
            highScore = score;
          }
          break;
        }
      }
    }

    // Player movement controls with trail effect
    let playerSpeed = 4;
    let playerHalfWidth = player.width / 2;

    if (keyDown(RIGHT_ARROW) && player.position.x < width - playerHalfWidth) {
      player.position.x += playerSpeed;
      createTrail(player.position.x - 20, player.position.y);
    }

    if (keyDown(LEFT_ARROW) && player.position.x > playerHalfWidth) {
      player.position.x -= playerSpeed;
      createTrail(player.position.x + 20, player.position.y);
    }

    // Difficulty progression - increase max objects
    maxObjects = min(8, 3 + floor(score / 1000));

    // Update falling objects
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
      let obj = fallingObjects[i];

      // Bounce off sides
      if (obj.position.x < 0 || obj.position.x > width) {
        obj.velocity.x *= -1;
      }

      // Remove object when it goes off screen
      if (obj.position.y > height + 50) {
        obj.remove();
        fallingObjects.splice(i, 1);

        // Only count dodged rocks
        if (obj.objectType === 'rock') {
          dodgeCount++;
          // Play dodge sound
          playDodgeSound();
        }
      }
    }

    // Increase speed over time
    baseSpeed = 3 + floor(score / 800) * 0.5;

    // Update and draw particles
    updateParticles();

    // Draw all sprites
    drawSprites();

    // Draw score and info
    drawScore();
  }
}

// Draw twinkling stars
function drawStars() {
  for (let star of stars) {
    // Twinkling effect
    star.twinkle += random(-10, 10);
    star.twinkle = constrain(star.twinkle, 100, 255);

    // Move stars slowly
    star.y += star.speed;
    if (star.y > height) {
      star.y = 0;
      star.x = random(width);
    }

    fill(255, 255, 255, star.twinkle);
    noStroke();
    ellipse(star.x, star.y, star.size);
  }
}

// Create neon trail particles
function createTrail(x, y) {
  if (frameCount % 3 === 0) {
    particles.push({
      x: x,
      y: y,
      vx: random(-1, 1),
      vy: random(-1, 1),
      life: 30,
      size: random(3, 7),
      color: color(0, 255, 255, 200) // Cyan neon
    });
  }
}

// Create neon explosion particles
function createExplosion(x, y) {
  for (let i = 0; i < 60; i++) {
    let angle = random(TWO_PI);
    let speed = random(2, 7);
    let isOrange = random() > 0.5;
    particles.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: 60,
      size: random(4, 12),
      color: isOrange ? color(255, 100, 0, 255) : color(255, 200, 0, 255)
    });
  }
}

// Create golden sparkle particles for coin collection
function createSparkle(x, y) {
  for (let i = 0; i < 30; i++) {
    let angle = random(TWO_PI);
    let speed = random(3, 8);
    let brightness = random(200, 255);
    particles.push({
      x: x,
      y: y,
      vx: cos(angle) * speed,
      vy: sin(angle) * speed,
      life: 50,
      size: random(5, 12),
      color: color(brightness, brightness - 40, 0, 255) // Bright gold
    });
  }
}

// Update particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    // Draw particle
    fill(red(p.color), green(p.color), blue(p.color), alpha(p.color) * (p.life / 60));
    noStroke();
    ellipse(p.x, p.y, p.size);

    // Remove dead particles
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// Draw cyberpunk score display
function drawScore() {
  textAlign(LEFT);
  textSize(20);

  // Score with cyan glow
  fill(0, 255, 255);
  stroke(0, 255, 255);
  strokeWeight(2);
  text('SCORE: ' + score, 15, 35);

  // Coins with gold glow
  fill(255, 215, 0);
  stroke(255, 255, 100);
  strokeWeight(2);
  text('💰 ' + coinsCollected, 15, 65);

  // Dodged rocks with orange glow
  fill(255, 100, 0);
  stroke(255, 150, 50);
  strokeWeight(2);
  text('🪨 ' + dodgeCount, 15, 95);

  // Objects count with white
  fill(200, 200, 255);
  stroke(150, 150, 255);
  strokeWeight(2);
  text('OBJ: ' + fallingObjects.length + '/' + maxObjects, 15, 125);

  // Speed with green glow
  fill(0, 255, 150);
  stroke(0, 255, 100);
  strokeWeight(2);
  text('SPD: ' + nf(baseSpeed, 1, 1) + 'x', 15, 155);

  // High score
  if (highScore > 0) {
    textAlign(RIGHT);
    fill(255, 0, 150);
    stroke(255, 100, 200);
    strokeWeight(3);
    textSize(22);
    text('⚡ ' + highScore, width - 15, 35);
  }
}

// Cyberpunk game over screen
function gameOver() {
  // Dark gradient background
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(10, 0, 20), color(0, 0, 0), inter);
    stroke(c);
    line(0, i, width, i);
  }

  // Update and draw particles (explosion continues)
  updateParticles();

  // Keep drawing sprites in background with fade
  push();
  tint(255, 100);
  drawSprites();
  pop();

  // Glitch effect box
  push();
  noFill();
  stroke(255, 0, 100);
  strokeWeight(3);
  rect(width / 2 - 200, height / 2 - 180, 400, 360);
  stroke(0, 255, 255);
  strokeWeight(2);
  rect(width / 2 - 195, height / 2 - 175, 390, 350);
  pop();

  textAlign(CENTER);

  // GAME OVER with neon effect
  textSize(52);
  fill(255, 0, 100);
  stroke(255, 0, 150);
  strokeWeight(6);
  text('GAME OVER', width / 2, height / 2 - 90);

  // Glitch overlay
  if (frameCount % 10 < 2) {
    push();
    fill(0, 255, 255);
    stroke(0, 255, 255);
    strokeWeight(6);
    text('GAME OVER', width / 2 + random(-5, 5), height / 2 - 90 + random(-5, 5));
    pop();
  }

  // Score display
  textSize(28);
  fill(0, 255, 255);
  stroke(0, 200, 255);
  strokeWeight(3);
  text('SCORE: ' + score, width / 2, height / 2 - 30);

  // Coins
  fill(255, 215, 0);
  stroke(255, 255, 100);
  strokeWeight(3);
  text('💰 ' + coinsCollected + ' COINS', width / 2, height / 2 + 10);

  // Dodged
  fill(255, 100, 0);
  stroke(255, 150, 50);
  strokeWeight(3);
  text('🪨 ' + dodgeCount + ' DODGED', width / 2, height / 2 + 45);

  // New high score banner
  if (score === highScore && highScore > 0) {
    push();
    fill(255, 215, 0, sin(frameCount * 0.1) * 50 + 200);
    stroke(255, 255, 0);
    strokeWeight(5);
    textSize(32);
    text('⚡ NEW RECORD! ⚡', width / 2, height / 2 + 90);
    pop();
  }

  // Click to restart
  textSize(18);
  fill(200, 200, 255, sin(frameCount * 0.15) * 100 + 155);
  stroke(150, 150, 255);
  strokeWeight(2);
  text('CLICK TO RESTART', width / 2, height - 60);
}

// Play dodge sound using Web Audio API
function playDodgeSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 440;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.1;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch(e) {
    // Sound not available, continue without it
  }
}

// Play crash sound using Web Audio API
function playCrashSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 100;
    oscillator.type = 'sawtooth';
    gainNode.gain.value = 0.2;

    oscillator.start(audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch(e) {
    // Sound not available, continue without it
  }
}

// Play coin collection sound
function playCoinSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Pleasant rising tone
    oscillator.frequency.value = 600;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.15;

    oscillator.start(audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.stop(audioContext.currentTime + 0.15);
  } catch(e) {
    // Sound not available, continue without it
  }
}

// Mouse click to restart game
function mouseClicked() {
  if (isGameOver) {
    // Reset game state
    isGameOver = false;
    score = 0;
    dodgeCount = 0;
    coinsCollected = 0;
    baseSpeed = 3;
    particles = [];
    spawnTimer = 0;
    maxObjects = 5;

    // Remove all old objects
    for (let obj of fallingObjects) {
      obj.remove();
    }
    fallingObjects = [];

    // Reset player position
    player.position.x = width / 2;
    player.position.y = height - 60;

    // Create initial objects
    createFallingObject();
  }
}
