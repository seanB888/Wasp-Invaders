#!/bin/bash

# Script to set up the modular structure for Wasp-Invaders game

# Define base directory
BASE_DIR="./assets/js"

# Create main directories
mkdir -p $BASE_DIR/core
mkdir -p $BASE_DIR/entities
mkdir -p $BASE_DIR/managers
mkdir -p $BASE_DIR/utils

# Create core files
touch $BASE_DIR/core/Game.js
touch $BASE_DIR/core/Renderer.js
touch $BASE_DIR/core/Input.js
touch $BASE_DIR/core/EventBus.js

# Create entity files
touch $BASE_DIR/entities/Entity.js
touch $BASE_DIR/entities/Player.js
touch $BASE_DIR/entities/Enemy.js
touch $BASE_DIR/entities/Bullet.js
touch $BASE_DIR/entities/PowerUp.js
touch $BASE_DIR/entities/Particle.js

# Create manager files
touch $BASE_DIR/managers/EntityManager.js
touch $BASE_DIR/managers/CollisionManager.js
touch $BASE_DIR/managers/ScoreManager.js
touch $BASE_DIR/managers/PowerUpManager.js
touch $BASE_DIR/managers/LevelManager.js

# Create utility files
touch $BASE_DIR/utils/Constants.js
touch $BASE_DIR/utils/MathUtils.js
touch $BASE_DIR/utils/ModelFactory.js

# Create main entry point
touch $BASE_DIR/main.js

echo "Directory structure and empty files created successfully!"
echo "Structure created at: $BASE_DIR"
echo "Created modules:"
find $BASE_DIR -type f | sort

