<script>
        // Audio object
        const SoundManager = {
            backgroundMusic: document.getElementById('background-music'),
            hitSound: new Audio('https://freesound.org/data/previews/131/131657_2398403-lq.mp3'),
            missSound: new Audio('https://freesound.org/data/previews/514/514133_9458518-lq.mp3'),
            musicButton: document.getElementById('music-button'),
            volumeSlider: document.getElementById('volume-slider'),
            
            init: function() {
                this.musicButton.addEventListener('click', this.toggleMusic.bind(this));
                this.volumeSlider.addEventListener('input', this.updateVolume.bind(this));
            },
            
            toggleMusic: function() {
                if (this.backgroundMusic.paused) {
                    this.backgroundMusic.play();
                    this.musicButton.textContent = "Muziek Uit";
                } else {
                    this.backgroundMusic.pause();
                    this.musicButton.textContent = "Muziek Aan";
                }
            },
        },
            updateVolume: function() {
                const volume = parseFloat(this.volumeSlider.value);
                this.backgroundMusic.volume = volume;
                this.hitSound.volume = volume;
                this.missSound.volume = volume;
            },
            
            playHitSound: function() {
                this.hitSound.currentTime = 0;
                this.hitSound.play().catch(error => console.log("Could not play sound"));
            },
            
            playMissSound: function() {
                this.missSound.currentTime = 0;
                this.missSound.play().catch(error => console.log("Could not play sound"));
            }
        };
        
        // Player object
        const Player = {
            gunIdleElement: document.getElementById('gun-idle'),
            gunShootingElement: document.getElementById('gun-shooting'),
            isShooting: false,
            
            shoot: function() {
                if (this.isShooting) return;
                
                this.isShooting = true;
                
                // Show shooting animation
                this.gunIdleElement.style.display = 'none';
                this.gunShootingElement.style.display = 'block';
                
                // Reset the GIF to ensure it plays from the beginning
                this.gunShootingElement.src = this.gunShootingElement.src;
                
                // After animation completes, switch back to idle
                setTimeout(() => {
                    this.gunShootingElement.style.display = 'none';
                    this.gunIdleElement.style.display = 'block';
                    this.isShooting = false;
                }, 500);
            }
        };
        
        // Duck constructor
        function Duck(x, y, direction) {
            this.id = 'duck-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            this.x = x;
            this.y = y;
            this.width = 70;
            this.height = 60;
            this.speed = 2 + Math.random() * 3;
            this.direction = direction;
            this.alive = true;
            this.falling = false;
            this.fallSpeed = 0;
            
            // Create DOM element for the duck
            this.element = document.createElement('div');
            this.element.id = this.id;
            this.element.className = 'duck duck-' + direction;
            this.element.style.left = this.x + 'px';
            this.element.style.top = this.y + 'px';
            document.getElementById('duck-container').appendChild(this.element);
        }
        
        Duck.prototype.update = function() {
            if (this.alive && !this.falling) {
                // Duck movement
                if (this.direction === 'right') {
                    this.x += this.speed;
                } else {
                    this.x -= this.speed;
                }
                
                // Update position
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
            } else if (this.falling) {
                // Falling duck
                this.fallSpeed += 0.2;
                this.y += this.fallSpeed;
                
                // Update position and appearance
                this.element.style.top = this.y + 'px';
                this.element.className = 'duck duck-falling';
            }
        };
        
        Duck.prototype.hit = function() {
            this.alive = false;
            this.falling = true;
            this.fallSpeed = 1;
        };
        
        Duck.prototype.remove = function() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        };
        
        // Game object
        const Game = {
            canvas: document.getElementById('game-canvas'),
            ctx: null,
            startScreen: document.getElementById('start-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            scoreDisplay: document.getElementById('score'),
            livesDisplay: document.getElementById('lives'),
            finalScoreDisplay: document.getElementById('final-score'),
            ducks: [],
            score: 0,
            lives: 5,
            gameRunning: false,
            lastDuckSpawn: 0,
            duckSpawnRate: 1500,
            missedShots: 0,
            maxMissedShots: 10,
            
            init: function() {
                this.ctx = this.canvas.getContext('2d');
                
                // Initialize sound
                SoundManager.init();
                
                // Event listeners
                document.getElementById('start-button').addEventListener('click', () => this.startGame());
                document.getElementById('restart-button').addEventListener('click', () => this.startGame());
                this.canvas.addEventListener('click', (event) => this.shootDuck(event));
            },
            
            startGame: function() {
                // Reset game state
                this.ducks.forEach(duck => duck.remove());
                this.ducks = [];
                this.score = 0;
                this.lives = 5;
                this.missedShots = 0;
                this.gameRunning = true;
                
                // Start background music
                if (SoundManager.backgroundMusic.paused) {
                    SoundManager.backgroundMusic.play().catch(error => {
                        console.error("Kon muziek niet afspelen:", error);
                    });
                    SoundManager.musicButton.textContent = "Muziek Uit";
                }
                
                // Update UI
                this.updateScore();
                this.updateLives();
                
                // Hide start/game over screens
                this.startScreen.style.display = 'none';
                this.gameOverScreen.style.display = 'none';
                
                // Start game loop
                requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
            },
            
            gameLoop: function(timestamp) {
                if (!this.gameRunning) return;
                
                // Spawn ducks
                if (!this.lastDuckSpawn || timestamp - this.lastDuckSpawn > this.duckSpawnRate) {
                    this.spawnDuck();
                    this.lastDuckSpawn = timestamp;
                    // Increase difficulty by decreasing spawn rate
                    this.duckSpawnRate = Math.max(500, this.duckSpawnRate - 10);
                }
                
                // Update ducks
                this.updateDucks();
                
                // Draw background
                this.drawBackground();
                
                // Next frame
                requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
            },
            
            drawBackground: function() {
                // Clear canvas
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                
                // Draw sky (upper part)
                this.ctx.fillStyle = '#87CEEB';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height * 0.7);
                
                // Draw grass (lower part)
                this.ctx.fillStyle = '#3a7e4d';
                this.ctx.fillRect(0, this.canvas.height * 0.7, this.canvas.width, this.canvas.height * 0.3);
                
                // Draw sun
                this.ctx.fillStyle = '#FFFF00';
                this.ctx.beginPath();
                this.ctx.arc(700, 100, 40, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw clouds
                this.ctx.fillStyle = '#FFFFFF';
                this.drawCloud(100, 100, 60);
                this.drawCloud(300, 150, 40);
                this.drawCloud(500, 80, 50);
                
                // Draw trees in background
                this.drawTree(150, this.canvas.height * 0.7, 80, 120);
                this.drawTree(400, this.canvas.height * 0.7, 100, 150);
                this.drawTree(650, this.canvas.height * 0.7, 90, 130);
            },
            
            drawCloud: function(x, y, size) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.arc(x + size * 0.5, y - size * 0.4, size * 0.8, 0, Math.PI * 2);
                this.ctx.arc(x + size, y, size * 0.7, 0, Math.PI * 2);
                this.ctx.arc(x + size * 0.5, y + size * 0.4, size * 0.6, 0, Math.PI * 2);
                this.ctx.fill();
            },
            
            drawTree: function(x, y, width, height) {
                // Trunk
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(x - width/6, y - height/3, width/3, height/3);
                
                // Leaves
                this.ctx.fillStyle = '#006400';
                this.ctx.beginPath();
                this.ctx.moveTo(x - width/2, y - height/3);
                this.ctx.lineTo(x + width/2, y - height/3);
                this.ctx.lineTo(x, y - height);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.moveTo(x - width/2, y - height/2);
                this.ctx.lineTo(x + width/2, y - height/2);
                this.ctx.lineTo(x, y - height * 0.8);
                this.ctx.fill();
            },
            
            spawnDuck: function() {
                // Determine if duck comes from left or right
                const direction = Math.random() > 0.5 ? 'right' : 'left';
                let x, y;
                
                if (direction === 'right') {
                    // Duck comes from left
                    x = -70;
                } else {
                    // Duck comes from right
                    x = this.canvas.width;
                }
                
                // Ducks fly at different heights, but always in the air
                y = 50 + Math.random() * (this.canvas.height * 0.6 - 50);
                
                const duck = new Duck(x, y, direction);
                this.ducks.push(duck);
            },
            
            updateDucks: function() {
                for (let i = this.ducks.length - 1; i >= 0; i--) {
                    const duck = this.ducks[i];
                    
                    duck.update();
                    
                    // Remove ducks that go off screen
                    if ((duck.direction === 'right' && duck.x > this.canvas.width) || 
                        (duck.direction === 'left' && duck.x < -duck.width)) {
                        duck.remove();
                        this.ducks.splice(i, 1);
                        // Player loses a life when a duck escapes
                        this.lives--;
                        this.updateLives();
                        
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                    }
                    
                    // Remove ducks that hit the ground
                    if (duck.falling && duck.y > this.canvas.height * 0.7 - duck.height) {
                        duck.remove();
                        this.ducks.splice(i, 1);
                    }
                }
            },
            
            shootDuck: function(event) {
                if (!this.gameRunning) return;
                
                // Animate gun
                Player.shoot();
                
                // Calculate mouse position relative to canvas
                const rect = this.canvas.getBoundingClientRect();
                const mouseX = event.clientX - rect.left;
                const mouseY = event.clientY - rect.top;
                
                let hit = false;
                
                // Check if a duck was hit
                for (let i = 0; i < this.ducks.length; i++) {
                    const duck = this.ducks[i];
                    
                    if (duck.alive && !duck.falling && 
                        mouseX >= duck.x && mouseX <= duck.x + duck.width &&
                        mouseY >= duck.y && mouseY <= duck.y + duck.height) {
                        
                        // Duck hit!
                        duck.hit();
                        this.score += 10;
                        this.updateScore();
                        hit = true;
                        SoundManager.playHitSound();
                        break;
                    }
                }
                
                if (!hit) {
                    // Missed shot
                    this.missedShots++;
                    
                    // Play miss sound
                    SoundManager.playMissSound();
                    
                    // Draw shot effect
                    this.drawShotEffect(mouseX, mouseY);
                    
                    if (this.missedShots >= this.maxMissedShots) {
                        this.missedShots = 0;
                        this.lives--;
                        this.updateLives();
                        
                        if (this.lives <= 0) {
                            this.gameOver();
                        }
                    }
                }
            },
            
            drawShotEffect: function(x, y) {
                // Draw shot effect (small circle that disappears)
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw cross
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(x - 10, y - 10);
                this.ctx.lineTo(x + 10, y + 10);
                this.ctx.moveTo(x + 10, y - 10);
                this.ctx.lineTo(x - 10, y + 10);
                this.ctx.stroke();
            },
            
            updateScore: function() {
                this.scoreDisplay.textContent = `Score: ${this.score}`;
            },
            
            updateLives: function() {
                this.livesDisplay.textContent = `Levens: ${this.lives}`;
            },
            
            gameOver: function() {
                this.gameRunning = false;
                this.finalScoreDisplay.textContent = `Score: ${this.score}`;
                this.gameOverScreen.style.display = 'flex';
            }
        };
        
        // Initialize the game
        Game.init();
    </script>