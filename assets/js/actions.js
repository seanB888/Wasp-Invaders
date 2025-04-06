// Game variables
let scene, camera, renderer;
let player, playerBullets = [], enemies = [], enemyBullets = [];
let explosionParticles = [];
let powerUps = [];
let shieldActive = false;
let shieldTimer = 0;
let shieldDuration = 10000; // 10 seconds
let lastPowerUpSpawn = 0;
let powerUpSpawnDelay = 15000; // 15 seconds
let score = 0, lives = 5;
let gameActive = false;
let enemyDirection = 1;
let enemySpeed = 0.3;
let lastEnemyMove = 0;
let enemyMoveDelay = 500; // ms
let lastEnemyShot = 0;
let enemyShotDelay = 1000; // ms
let enemiesPerRow = 8;
let enemyRows = 4;
let clock = new THREE.Clock();
let gameWidth = 60;
let gameHeight = 80;
let enemyDescent = 4;
let bulletSpeed = 40;

// DOM elements
let scoreElement, livesElement, gameOverElement, finalScoreElement;
let resetButton, startButton, startScreen, shieldElement;

// Input tracking
const keys = {
  left: false,
  right: false,
  space: false,
  lastShot: 0,
  shotDelay: 500 // ms
};

// Initialize the game when the window is loaded
window.onload = init;

function init() {
  console.log("Initializing game...");

  // Get DOM elements
  scoreElement = document.getElementById("score");
  livesElement = document.getElementById("lives");
  gameOverElement = document.getElementById("gameOver");
  finalScoreElement = document.getElementById("finalScore");
  resetButton = document.getElementById("resetButton");
  startButton = document.getElementById("startButton");
  startScreen = document.getElementById("startScreen");
  shieldElement = document.getElementById('shield');

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050510);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 50;

  // Create renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById("gameContainer").appendChild(renderer.domElement);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 10, 10);
  scene.add(directionalLight);

  // Add event listeners
  window.addEventListener("resize", onWindowResize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  resetButton.addEventListener("click", resetGame);

  // Add start button listener - important fix!
  startButton.addEventListener("click", function () {
    console.log("Start button clicked");
    startGame();
  });

  // Create game boundaries
  createBoundaries();

  // Start the animation loop
  animate();

  console.log("Game initialized successfully");
}

function startGame() {
  console.log("Starting game...");
  if (startScreen) {
    startScreen.style.display = "none";
    resetGame();
  } else {
    console.error("Start screen not found");
  }
}

function createBoundaries() {
  // Create game boundaries
  const boundaryMaterial = new THREE.MeshLambertMaterial({
    color: 0x555555,
    emissive: 0x222222
  });

  // Create ground
  const groundGeometry = new THREE.PlaneGeometry(gameWidth * 2, 5);
  const ground = new THREE.Mesh(groundGeometry, boundaryMaterial);
  ground.position.y = -gameHeight / 2;
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
}

function createPlayer() {
  // Create player (ant)
  const playerGeometry = new THREE.Group();

  // Ant body
  const bodyGeometry = new THREE.SphereGeometry(1.5, 16, 16);
  const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

  // Ant head
  const headGeometry = new THREE.SphereGeometry(1, 16, 16);
  const head = new THREE.Mesh(headGeometry, bodyMaterial);
  head.position.set(0, 1.5, 0);

  // Ant legs
  const legGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2);
  const legMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

  for (let i = 0; i < 6; i++) {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.rotation.z = Math.PI / 2;
    leg.position.x = i < 3 ? -1.5 : 1.5;
    leg.position.y = -0.5 + (i % 3) * 0.7;
    playerGeometry.add(leg);
  }

  // Antennae
  const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5);
  const antenna1 = new THREE.Mesh(antennaGeometry, legMaterial);
  antenna1.position.set(-0.5, 2.3, 0);
  antenna1.rotation.z = -Math.PI / 6;

  const antenna2 = new THREE.Mesh(antennaGeometry, legMaterial);
  antenna2.position.set(0.5, 2.3, 0);
  antenna2.rotation.z = Math.PI / 6;

  playerGeometry.add(body);
  playerGeometry.add(head);
  playerGeometry.add(antenna1);
  playerGeometry.add(antenna2);

  player = playerGeometry;
  player.position.y = -gameHeight / 2 + 5;
  scene.add(player);
}

function createEnemies() {
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemiesPerRow; col++) {
      const enemy = createWasp();
      const spacing = gameWidth / (enemiesPerRow + 1);
      enemy.position.x = col * spacing - gameWidth / 2 + spacing;
      enemy.position.y = gameHeight / 3 - row * 5;
      scene.add(enemy);
      enemies.push(enemy);
    }
  }
}

function createWasp() {
  const waspGroup = new THREE.Group();

  // Wasp body (two segments)
  const thoraxGeometry = new THREE.SphereGeometry(1, 16, 16);
  const thoraxMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
  const thorax = new THREE.Mesh(thoraxGeometry, thoraxMaterial);

  const abdomenGeometry = new THREE.SphereGeometry(1.2, 16, 16);
  const abdomenMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
  const abdomen = new THREE.Mesh(abdomenGeometry, abdomenMaterial);
  abdomen.position.z = -1.5;

  // Wasp head
  const headGeometry = new THREE.SphereGeometry(0.7, 16, 16);
  const head = new THREE.Mesh(headGeometry, thoraxMaterial);
  head.position.z = 1.2;

  // Wasp wings
  const wingGeometry = new THREE.PlaneGeometry(2, 1);
  const wingMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  });

  const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing.position.set(-1.2, 0.7, 0);
  leftWing.rotation.y = Math.PI / 4;

  const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing.position.set(1.2, 0.7, 0);
  rightWing.rotation.y = -Math.PI / 4;

  // Wasp stripes
  for (let i = 0; i < 3; i++) {
    const stripeGeometry = new THREE.TorusGeometry(
      1.2,
      0.15,
      8,
      16,
      Math.PI / 2
    );
    const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffd700 });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.z = -1.5 - 0.4 * i;
    stripe.rotation.x = Math.PI / 2;
    waspGroup.add(stripe);
  }

  waspGroup.add(thorax);
  waspGroup.add(abdomen);
  waspGroup.add(head);
  waspGroup.add(leftWing);
  waspGroup.add(rightWing);

  return waspGroup;
}

function shootBullet(origin, direction) {
  const bulletGeometry = new THREE.SphereGeometry(0.3, 8, 8);
  let bulletMaterial;

  if (direction > 0) {
    // Player bullet
    bulletMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
  } else {
    // Enemy bullet
    bulletMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
  }

  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(origin);

  scene.add(bullet);

  if (direction > 0) {
    playerBullets.push(bullet);
  } else {
    enemyBullets.push(bullet);
  }
}

function createPowerUp() {
  // Create a shield power-up
  const powerUpGroup = new THREE.Group();
  
  // Base
  const baseGeometry = new THREE.SphereGeometry(1, 16, 16);
  const baseMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x00FFFF,
      emissive: 0x00BFFF,
      emissiveIntensity: 0.5
  });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  
  // Shield icon
  const shieldGeometry = new THREE.CircleGeometry(0.6, 16);
  const shieldMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide
  });
  const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
  shield.position.z = 0.6;
  
  powerUpGroup.add(base);
  powerUpGroup.add(shield);
  
  // Set random position above the play area
  powerUpGroup.position.x = (Math.random() - 0.5) * gameWidth;
  powerUpGroup.position.y = gameHeight / 2;
  
  // Add movement data
  powerUpGroup.userData = {
      type: 'shield',
      velocity: new THREE.Vector3(0, -5, 0), // Move down
      rotationSpeed: Math.random() * 2 + 1
  };
  
  scene.add(powerUpGroup);
  powerUps.push(powerUpGroup);
  
  return powerUpGroup;
}

function activateShield() {
  shieldActive = true;
  shieldTimer = Date.now();
  
  // Create shield visual
  if (player) {
      if (player.userData.shield) {
          // If shield exists, just make it visible
          player.userData.shield.visible = true;
      } else {
          // Create shield mesh
          const shieldGeometry = new THREE.SphereGeometry(3, 32, 32);
          const shieldMaterial = new THREE.MeshBasicMaterial({
              color: 0x00FFFF,
              transparent: true,
              opacity: 0.4,
              side: THREE.DoubleSide
          });
          
          const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
          player.add(shield);
          player.userData.shield = shield;
      }
  }
  
  // Update UI
  if (shieldElement) {
      shieldElement.style.display = 'block';
  }
  
  console.log('Shield activated!');
}

function deactivateShield() {
  shieldActive = false;
  
  if (player && player.userData.shield) {
      player.userData.shield.visible = false;
  }
  
  // Update UI
  if (shieldElement) {
      shieldElement.style.display = 'none';
  }
  
  console.log('Shield deactivated!');
}

function updatePowerUps(deltaTime) {
  const now = Date.now();
  
  // Check if we should spawn a new power-up
  if (now - lastPowerUpSpawn > powerUpSpawnDelay && gameActive) {
      createPowerUp();
      lastPowerUpSpawn = now;
      console.log('Power-up spawned');
  }
  
  // Update power-up positions
  for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];
      
      // Move power-up
      powerUp.position.x += powerUp.userData.velocity.x * deltaTime;
      powerUp.position.y += powerUp.userData.velocity.y * deltaTime;
      
      // Rotate power-up
      powerUp.rotation.y += powerUp.userData.rotationSpeed * deltaTime;
      
      // Remove if off-screen
      if (powerUp.position.y < -gameHeight / 2) {
          scene.remove(powerUp);
          powerUps.splice(i, 1);
          continue;
      }
      
      // Check collision with player
      if (player && powerUp.position.distanceTo(player.position) < 4) {
          // Collect power-up
          if (powerUp.userData.type === 'shield') {
              activateShield();
          }
          
          scene.remove(powerUp);
          powerUps.splice(i, 1);
          
          // Add points
          score += 50;
          scoreElement.textContent = `Score: ${score}`;
      }
  }
  
  // Check shield timer
  if (shieldActive && now - shieldTimer > shieldDuration) {
      deactivateShield();
  }
}

function createExplosion(position, isWasp = true) {
  const particleCount = 30;
  const particles = [];
  const colors = [0xff0000, 0xffffff]; // Red and white

  for (let i = 0; i < particleCount; i++) {
    const size = Math.random() * 0.5 + 0.2;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      emissive: colors[Math.floor(Math.random() * colors.length)],
      emissiveIntensity: 0.5
    });

    const particle = new THREE.Mesh(geometry, material);

    // Set initial position
    particle.position.copy(position);

    // Set random velocity
    const speed = Math.random() * 10 + 5;
    const angle = Math.random() * Math.PI * 2;
    const height = Math.random() * 8 - 4;

    particle.userData = {
      velocity: new THREE.Vector3(
        Math.cos(angle) * speed,
        height,
        Math.sin(angle) * speed
      ),
      created: Date.now(),
      lifetime: isWasp ? 800 : 1200 // Wasp explosions are faster
    };

    scene.add(particle);
    particles.push(particle);
  }

  // Remove particles after animation
  setTimeout(() => {
    for (const particle of particles) {
      scene.remove(particle);
    }
  }, 1500);

  return particles;
}

function onKeyDown(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      keys.left = true;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      keys.right = true;
      break;
    case " ":
      keys.space = true;
      break;
  }
}

function onKeyUp(event) {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      keys.left = false;
      break;
    case "ArrowRight":
    case "d":
    case "D":
      keys.right = false;
      break;
    case " ":
      keys.space = false;
      break;
  }
}

function updatePlayer(deltaTime) {
  if (!player) return;

  const playerSpeed = 20;

  if (keys.left) {
    player.position.x -= playerSpeed * deltaTime;
  }
  if (keys.right) {
    player.position.x += playerSpeed * deltaTime;
  }

  // Limit player to screen bounds
  if (player.position.x < -gameWidth / 2 + 3) {
    player.position.x = -gameWidth / 2 + 3;
  }
  if (player.position.x > gameWidth / 2 - 3) {
    player.position.x = gameWidth / 2 - 3;
  }

  // Player shooting
  const now = Date.now();
  if (keys.space && now - keys.lastShot > keys.shotDelay) {
    shootBullet(
      new THREE.Vector3(player.position.x, player.position.y + 2, 0),
      1
    );
    keys.lastShot = now;
  }
}

function updateEnemies(deltaTime) {
  const now = Date.now();
  let changeDirection = false;

  // Move enemies
  if (now - lastEnemyMove > enemyMoveDelay) {
    lastEnemyMove = now;

    for (let enemy of enemies) {
      enemy.position.x += enemyDirection * enemySpeed;

      // Check if any enemy is at the edge
      if (
        enemy.position.x > gameWidth / 2 - 3 ||
        enemy.position.x < -gameWidth / 2 + 3
      ) {
        changeDirection = true;
      }

      // Check if enemies reached the bottom
      if (player && enemy.position.y < player.position.y + 5) {
        endGame();
      }
    }

    if (changeDirection) {
      enemyDirection *= -1;

      // Move enemies down
      for (let enemy of enemies) {
        enemy.position.y -= enemyDescent;
      }
    }
  }

  // Random enemy shooting
  if (enemies.length > 0 && now - lastEnemyShot > enemyShotDelay) {
    lastEnemyShot = now;

    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    shootBullet(
      new THREE.Vector3(randomEnemy.position.x, randomEnemy.position.y - 2, 0),
      -1
    );

    // Adjust difficulty based on remaining enemies
    enemyShotDelay = Math.max(500, 1000 - (32 - enemies.length) * 15);
    enemyMoveDelay = Math.max(200, 500 - (32 - enemies.length) * 9);
  }
}

function updateExplosions(deltaTime) {
  const now = Date.now();
  const gravity = 9.8 * deltaTime;

  for (let i = explosionParticles.length - 1; i >= 0; i--) {
    const particle = explosionParticles[i];

    // Update velocity and position
    particle.userData.velocity.y -= gravity;
    particle.position.x += particle.userData.velocity.x * deltaTime;
    particle.position.y += particle.userData.velocity.y * deltaTime;
    particle.position.z += particle.userData.velocity.z * deltaTime;

    // Rotate particle
    particle.rotation.x += deltaTime * 5;
    particle.rotation.y += deltaTime * 5;

    // Fade out
    const age = now - particle.userData.created;
    const normalizedAge = age / particle.userData.lifetime;

    if (normalizedAge >= 1) {
      // Remove expired particles
      scene.remove(particle);
      explosionParticles.splice(i, 1);
    } else {
      // Fade out
      if (particle.material.opacity) {
        particle.material.opacity = 1 - normalizedAge;
      }
      // Shrink slightly
      const scale = 1 - normalizedAge * 0.5;
      particle.scale.set(scale, scale, scale);
    }
  }
}

function updateBullets(deltaTime) {
  // Update player bullets
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const bullet = playerBullets[i];
    bullet.position.y += bulletSpeed * deltaTime;

    // Remove bullets that go off screen
    if (bullet.position.y > gameHeight / 2) {
      scene.remove(bullet);
      playerBullets.splice(i, 1);
      continue;
    }

    // Check for collisions with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      if (bullet.position.distanceTo(enemy.position) < 2) {
        // Create explosion at wasp position
        const newParticles = createExplosion(enemy.position.clone(), true);
        explosionParticles = explosionParticles.concat(newParticles);

        // Remove bullet and enemy
        scene.remove(bullet);
        scene.remove(enemy);
        playerBullets.splice(i, 1);
        enemies.splice(j, 1);

        // Update score
        score += 10;
        scoreElement.textContent = `Score: ${score}`;

        break;
      }
    }
  }

  // Update enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.position.y -= bulletSpeed * deltaTime;

    // Remove bullets that go off screen
    if (bullet.position.y < -gameHeight / 2) {
      scene.remove(bullet);
      enemyBullets.splice(i, 1);
      continue;
    }

    // Check for collision with player
    if (player && bullet.position.distanceTo(player.position) < 2) {
      // If shield is active, destroy the bullet without damage
      if (shieldActive) {
        // Create shield impact effect
        const shieldImpactParticles = createExplosion(bullet.position.clone(), false);
        // Make particles cyan to match shield
        for (const particle of shieldImpactParticles) {
          if (particle.material) {
            particle.material.color.set(0x00FFFF);
            if (particle.material.emissive) {
              particle.material.emissive.set(0x00BFFF);
            }
          }
        }
        explosionParticles = explosionParticles.concat(shieldImpactParticles);
        
        // Remove bullet
        scene.remove(bullet);
        enemyBullets.splice(i, 1);
        continue;
      }
      
      // Create explosion for the hit (but don't remove player unless lives = 0)
      const newParticles = createExplosion(player.position.clone(), false);
      explosionParticles = explosionParticles.concat(newParticles);

      // Remove bullet
      scene.remove(bullet);
      enemyBullets.splice(i, 1);

      // Decrease lives
      lives--;
      livesElement.textContent = `Lives: ${lives}`;

      // Briefly make player flash for feedback
      player.visible = false;
      setTimeout(() => {
        if (player && player.visible !== undefined) {
          player.visible = true;
        }
      }, 150);

      if (lives <= 0) {
        // Create bigger final explosion when player is destroyed
        const finalParticles = createExplosion(player.position.clone(), false);
        const moreFinalParticles = createExplosion(
          new THREE.Vector3(
            player.position.x + 1,
            player.position.y,
            player.position.z
          ),
          false
        );
        explosionParticles = explosionParticles.concat(
          finalParticles,
          moreFinalParticles
        );
        
        // End game
        endGame();
      }
    }
  }
}

function endGame() {
  gameActive = false;
  finalScoreElement.textContent = score;
  gameOverElement.style.display = "block";
}

function resetGame() {
  console.log("Resetting game...");

  // Reset game state
  score = 0;
  lives = 5;
  enemyDirection = 1;
  enemySpeed = 0.3;
  enemyMoveDelay = 500;
  enemyShotDelay = 1000;
  shieldActive = false;
  shieldTimer = 0;
  lastPowerUpSpawn = Date.now();

  // Clear existing elements
  clearScene();

  // Create new elements
  createPlayer();
  createEnemies();

  // Update UI
  scoreElement.textContent = `Score: ${score}`;
  livesElement.textContent = `Lives: ${lives}`;
  gameOverElement.style.display = "none";

  // Start game
  gameActive = true;

  console.log("Game reset complete");
}

function clearScene() {
  // Clear all game objects
  if (player) scene.remove(player);
  player = null;

  for (let bullet of playerBullets) {
    scene.remove(bullet);
  }

  for (let bullet of enemyBullets) {
    scene.remove(bullet);
  }

  for (let enemy of enemies) {
    scene.remove(enemy);
  }

  for (let particle of explosionParticles) {
    scene.remove(particle);
  }
  
  for (let powerUp of powerUps) {
    scene.remove(powerUp);
  }

  playerBullets = [];
  enemyBullets = [];
  enemies = [];
  explosionParticles = [];
  powerUps = [];
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (gameActive) {
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateBullets(deltaTime);
    updateExplosions(deltaTime);
    updatePowerUps(deltaTime);

    // Check for victory
    if (enemies.length === 0 && gameActive) {
      console.log("All enemies defeated, creating new wave");
      createEnemies();
      enemySpeed += 0.1;
    }
  }

  renderer.render(scene, camera);
}
