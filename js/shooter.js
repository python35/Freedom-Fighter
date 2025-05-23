// Game objecten en constructors
function Duck(x, y, direction) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 40;
    this.speed = 2 + Math.random() * 3; // Variabele snelheid
    this.direction = direction; // 'right' of 'left'
    this.alive = true;
    this.falling = false;
    this.fallSpeed = 0;
    this.color = '#8B4513'; // Bruin voor de eend
}

// Game variabelen
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const finalScoreDisplay = document.getElementById('final-score');

let ducks = [];
let score = 0;
let lives = 7;
let gameRunning = false;
let lastDuckSpawn = 0;
let duckSpawnRate = 1500; // milliseconden
let missedShots = 0;
const maxMissedShots = 10; // Na 10 gemiste schoten verlies je een leven

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
canvas.addEventListener('click', shootDuck);

// Game functies
function startGame() {
    // Reset game state
    ducks = [];
    score = 0;
    lives = 7;
    missedShots = 0;
    gameRunning = true;
    
    // Update UI
    updateScore();
    updateLives();
    
    // Verberg start/game over schermen
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Teken achtergrond (lucht en gras)
    drawBackground();
    
    // Spawn eenden
    if (timestamp - lastDuckSpawn > duckSpawnRate) {
        spawnDuck();
        lastDuckSpawn = timestamp;
        // Verhoog moeilijkheidsgraad door spawn rate te verlagen
        duckSpawnRate = Math.max(500, duckSpawnRate - 10);
    }
    
    // Update en teken eenden
    updateDucks();
    drawDucks();
    
    // Volgende frame
    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Teken lucht (bovenste deel)
    ctx.fillStyle = '#87CEEB'; // Lichtblauwe lucht
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    
    // Teken gras (onderste deel)
    ctx.fillStyle = '#3a7e4d'; // Groen gras
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
}

function spawnDuck() {
    // Bepaal of de eend van links of rechts komt
    const direction = Math.random() > 0.5 ? 'right' : 'left';
    let x, y;
    
    if (direction === 'right') {
        // Eend komt van links
        x = -50;
    } else {
        // Eend komt van rechts
        x = canvas.width;
    }
    
    // Eenden vliegen op verschillende hoogtes, maar altijd in de lucht
    y = 50 + Math.random() * (canvas.height * 0.6 - 50);
    
    ducks.push(new Duck(x, y, direction));
}

function updateDucks() {
    for (let i = ducks.length - 1; i >= 0; i--) {
        const duck = ducks[i];
        
        if (duck.alive && !duck.falling) {
            // Beweging van de eend
            if (duck.direction === 'right') {
                duck.x += duck.speed;
            } else {
                duck.x -= duck.speed;
            }
            
            // Verwijder eenden die buiten het scherm gaan
            if ((duck.direction === 'right' && duck.x > canvas.width) || 
                (duck.direction === 'left' && duck.x < -duck.width)) {
                ducks.splice(i, 1);
                // Speler verliest een leven als een eend ontsnapt
                lives--;
                updateLives();
                
                if (lives <= 0) {
                    gameOver();
                }
            }
        } else if (duck.falling) {
            // Vallende eend
            duck.fallSpeed += 0.2; // Versnelling
            duck.y += duck.fallSpeed;
            
            // Verwijder eenden die op de grond vallen
            if (duck.y > canvas.height * 0.7 - duck.height) {
                ducks.splice(i, 1);
            }
        }
    }
}

function drawDucks() {
    ducks.forEach(duck => {
        if (duck.alive) {
            // Teken levende eend
            ctx.fillStyle = duck.color;
            
            // Eend lichaam
            ctx.beginPath();
            ctx.ellipse(duck.x + duck.width/2, duck.y + duck.height/2, 
                       duck.width/2, duck.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Eend hoofd
            ctx.fillStyle = '#654321'; // Donkerder bruin voor het hoofd
            ctx.beginPath();
            ctx.arc(duck.direction === 'right' ? duck.x + duck.width * 0.8 : duck.x + duck.width * 0.2, 
                   duck.y + duck.height * 0.3, duck.width * 0.2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eend snavel
            ctx.fillStyle = '#FF8C00'; // Oranje voor de snavel
            ctx.beginPath();
            if (duck.direction === 'right') {
                ctx.moveTo(duck.x + duck.width * 0.9, duck.y + duck.height * 0.3);
                ctx.lineTo(duck.x + duck.width * 1.1, duck.y + duck.height * 0.2);
                ctx.lineTo(duck.x + duck.width * 1.1, duck.y + duck.height * 0.4);
            } else {
                ctx.moveTo(duck.x + duck.width * 0.1, duck.y + duck.height * 0.3);
                ctx.lineTo(duck.x - duck.width * 0.1, duck.y + duck.height * 0.2);
                ctx.lineTo(duck.x - duck.width * 0.1, duck.y + duck.height * 0.4);
            }
            ctx.fill();
            
            // Eend vleugel
            ctx.fillStyle = '#654321'; // Donkerder bruin voor de vleugel
            ctx.beginPath();
            ctx.ellipse(duck.x + duck.width/2, duck.y + duck.height * 0.6, 
                       duck.width * 0.3, duck.height * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Teken neergeschoten eend (ondersteboven)
            ctx.fillStyle = '#654321'; // Donkerder bruin voor dode eend
            
            // Eend lichaam (ondersteboven)
            ctx.beginPath();
            ctx.ellipse(duck.x + duck.width/2, duck.y + duck.height/2, 
                       duck.width/2, duck.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // X-ogen
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            
            // Linker X-oog
            ctx.beginPath();
            ctx.moveTo(duck.x + duck.width * 0.3 - 5, duck.y + duck.height * 0.3 - 5);
            ctx.lineTo(duck.x + duck.width * 0.3 + 5, duck.y + duck.height * 0.3 + 5);
            ctx.moveTo(duck.x + duck.width * 0.3 + 5, duck.y + duck.height * 0.3 - 5);
            ctx.lineTo(duck.x + duck.width * 0.3 - 5, duck.y + duck.height * 0.3 + 5);
            ctx.stroke();
            
            // Rechter X-oog
            ctx.beginPath();
            ctx.moveTo(duck.x + duck.width * 0.7 - 5, duck.y + duck.height * 0.3 - 5);
            ctx.lineTo(duck.x + duck.width * 0.7 + 5, duck.y + duck.height * 0.3 + 5);
            ctx.moveTo(duck.x + duck.width * 0.7 + 5, duck.y + duck.height * 0.3 - 5);
            ctx.lineTo(duck.x + duck.width * 0.7 - 5, duck.y + duck.height * 0.3 + 5);
            ctx.stroke();
        }
    });
}

function shootDuck(event) {
    if (!gameRunning) return;
    
    // Bereken muispositie relatief aan canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    let hit = false;
    
    // Controleer of een eend is geraakt
    for (let i = 0; i < ducks.length; i++) {
        const duck = ducks[i];
        
        if (duck.alive && !duck.falling && 
            mouseX >= duck.x && mouseX <= duck.x + duck.width &&
            mouseY >= duck.y && mouseY <= duck.y + duck.height) {
            
            // Eend geraakt!
            duck.alive = false;
            duck.falling = true;
            duck.fallSpeed = 1;
            score += 10;
            updateScore();
            hit = true;
            
            // Speel geluid af (optioneel)
            // playSound('hit');
            
            break;
        }
    }
    
    if (!hit) {
        // Gemist schot
        missedShots++;
        
        if (missedShots >= maxMissedShots) {
            missedShots = 0;
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            }
        }
        
        // Speel geluid af (optioneel)
        // playSound('miss');
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateLives() {
    livesDisplay.textContent = `Levens: ${lives}`;
}

function gameOver() {
    gameRunning = false;
    finalScoreDisplay.textContent = `Score: ${score}`;
    gameOverScreen.style.display = 'flex';
}