import * as Audio from "./audio.js";
import * as Elements from "./elements.js";
import * as Game from "./game.js";

let running = false;
let xVelocity = Game.UNITSIZE;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let defaultTickSpeed=150;
let tickSpeed;
let ticker;

let paused=false;
let pausedTextIsVisible=false;

let snake = [
    {x:Game.UNITSIZE * 4, y:0},
    {x:Game.UNITSIZE * 3, y:0},
    {x:Game.UNITSIZE * 2, y:0},
    {x:Game.UNITSIZE, y:0},
    {x:0, y:0}
];

document.addEventListener("visibilitychange", () => {
    if(document.hidden){
        paused = true;
    }  
});

document.getElementById("unmuteBtn").addEventListener("click", function() {
    Audio.playClickSound();
    if(!running || paused){
        return;
    }
    if (Audio.BGMUSIC.muted) {
        this.textContent = "🔊"; // Unmute icon
        Audio.BGMUSIC.muted = false;
        Audio.BGMUSIC.play();
    } else {
        this.textContent = "🔇"; // Mute icon
        Audio.BGMUSIC.muted = true;
        Audio.BGMUSIC.pause();
    }
});

window.addEventListener("keydown", changeDirection);

document.getElementById("upBtn").addEventListener("touchstart", () => touchMove("ArrowUp"));
document.getElementById("downBtn").addEventListener("touchstart", () => touchMove("ArrowDown"));
document.getElementById("leftBtn").addEventListener("touchstart", () => touchMove("ArrowLeft"));
document.getElementById("rightBtn").addEventListener("touchstart", () => touchMove("ArrowRight"));
document.getElementById("gameBoard").addEventListener("touchstart", () => touchMove("SPACE"));

document.getElementById("resetBtn").addEventListener("click", resetGame);

gameStart();

function gameStart(){
    tickSpeed = defaultTickSpeed;
    running= true;
    scoreText.textContent = score;
    createFood();
    drawFood();
    nextTick();
}

async function nextTick(){
    if(running){

        ticker = setTimeout(()=>{
            if(!paused){
                clearBoard();
                drawFood();
                moveDrawCheck();
            }
            checkPaused();
            Audio.check(paused, running);
            nextTick();
        }, tickSpeed);
    
    }
    else{
        displayGameOver();
    }
}


function clearBoard(){
    Elements.CTX.fillStyle = Game.BOARDBACKGROUND;
    Elements.CTX.fillRect(0, 0, Game.GAMEWIDTH, Game.GAMEHEIGHT);
}

function createFood(){
    function randomFood(min, max){
        return Math.round((Math.random() * (max - min) + min) / Game.UNITSIZE) * Game.UNITSIZE;
    }

    let validPosition = false;

    while (!validPosition) {
        foodX = randomFood(0, Game.GAMEWIDTH - Game.UNITSIZE);
        foodY = randomFood(0, Game.GAMEHEIGHT - Game.UNITSIZE);

        // Check if the food position overlaps with the snake's body
        validPosition = !snake.some(segment => segment.x === foodX && segment.y === foodY);
    }
}

function drawFood(){
    Elements.CTX.fillStyle = "#32CD32"; // Lime green for food
    Elements.CTX.shadowBlur = 10; // Glow effect
    Elements.CTX.shadowColor = "#32CD32";
    Elements.CTX.fillRect(foodX, foodY, Game.UNITSIZE, Game.UNITSIZE);
    Elements.CTX.shadowBlur = 0; // Reset shadow
}

function moveSnake(){
    const head = {
        x: snake[0].x + xVelocity,
        y: snake[0].y + yVelocity
    };
    snake.unshift(head);
    //if food is eaten
    if(snake[0].x == foodX && snake[0].y == foodY){
        score+=1;
        scoreText.textContent = score;
        Audio.playEatSound();
        createFood();
        tickSpeed = tickSpeed - 1;
    }
    else{
        snake.pop();
    }     
}

function drawSnake(){
    Elements.CTX.fillStyle = "#1E90FF"; // Dodger blue for snake
    Elements.CTX.strokeStyle = "#00008B"; // Dark blue border
    Elements.CTX.shadowBlur = 10; // Glow effect
    Elements.CTX.shadowColor = "#1E90FF";
    snake.forEach(snakePart => {
        Elements.CTX.fillRect(snakePart.x, snakePart.y, Game.UNITSIZE, Game.UNITSIZE);
        Elements.CTX.strokeRect(snakePart.x, snakePart.y, Game.UNITSIZE, Game.UNITSIZE);
    });
    Elements.CTX.shadowBlur = 0; // Reset shadow
}

function moveDrawCheck(){
    moveSnake();
    drawSnake();
    checkGameOver();
}
function changeDirection(event){
    if ( ( !running && event.keyCode != Game.KEY_ENTER )|| (paused && event.keyCode != Game.SPACE) ) return; // Prevent direction change if the game is not running

    const keyPressed = event.keyCode;
    //console.log(event.key);
    const goingUp = (yVelocity == -Game.UNITSIZE && xVelocity == 0);
    const goingDown = (yVelocity == Game.UNITSIZE && xVelocity == 0);
    const goingRight = (xVelocity == Game.UNITSIZE && yVelocity == 0);
    const goingLeft = (xVelocity == -Game.UNITSIZE && yVelocity == 0);


    switch(true){
        case(!goingRight && (keyPressed == Game.LEFT || keyPressed == Game.KEY_A || event.key == "ArrowLeft")):
            xVelocity = -Game.UNITSIZE;
            yVelocity = 0;
            moveDrawCheck();
            break;
        case(!goingDown && (keyPressed == Game.UP || keyPressed == Game.KEY_W || event.key == "ArrowUp")):
            xVelocity = 0;
            yVelocity = -Game.UNITSIZE;
            moveDrawCheck();
            break;
        case(!goingLeft &&(keyPressed ==  Game.RIGHT || keyPressed == Game.KEY_D || event.key == "ArrowRight")):
            xVelocity = Game.UNITSIZE;
            yVelocity = 0;
            moveDrawCheck();
            break;
        case(!goingUp && (keyPressed == Game.DOWN || keyPressed == Game.KEY_S || event.key == "ArrowDown")):
            xVelocity = 0;
            yVelocity = Game.UNITSIZE;
            moveDrawCheck();
            break;
        case (keyPressed == Game.KEY_ENTER):
            resetGame();
            break;
        case (keyPressed == Game.SPACE || event.key == "SPACE"):
            if(!running){
                resetGame();
                return;
            }
            Audio.playClickSound();
            pausedTextIsVisible = false;
            paused = !paused;
            break;
        default:
            break;
    }
    //console.log(keyPressed);
}

function checkPaused(){
    if(paused && running && !pausedTextIsVisible){
        Elements.CTX.fillStyle = "rgba(0, 0, 0, 0.7)"; // Darker overlay
        Elements.CTX.fillRect(0, 0, Game.GAMEWIDTH, Game.GAMEHEIGHT);
        Elements.CTX.font = "bold 60px 'Poppins', sans-serif"; // Modern font
        Elements.CTX.fillStyle = "#FFD700"; // Gold color for text
        Elements.CTX.textAlign = "center";
        Elements.CTX.fillText("PAUSED", Game.GAMEWIDTH / 2, Game.GAMEHEIGHT / 2);
        pausedTextIsVisible = true;
    }
}
function checkGameOver(){
    switch(true){
        case (snake[0].x < 0):
            snake[0].x = Game.GAMEWIDTH;
            break;
        case (snake[0].x >= Game.GAMEWIDTH):
            snake[0].x = 0;
            break;
        case (snake[0].y < 0):
            snake[0].y = Game.GAMEHEIGHT;
            break;
        case (snake[0].y >= Game.GAMEHEIGHT):
            snake[0].y = 0;
            break;
    }
    for(let i = 1; i < snake.length; i+=1){
        if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
            running = false;
        }
    }
}

function displayGameOver(){
    Elements.CTX.font = "bold 60px 'Poppins', sans-serif"; // Modern font
    Elements.CTX.fillStyle = "#FF4500"; // Bright red for game over
    Elements.CTX.textAlign = "center";
    Elements.CTX.fillText("GAME OVER!", Game.GAMEWIDTH / 2, Game.GAMEHEIGHT / 2);
    running = false;
}

function resetGame(){
    Audio.playClickSound();
    tickSpeed = defaultTickSpeed;
    paused = false;
    clearTimeout(ticker);
    score = 0;
    xVelocity = Game.UNITSIZE;
    yVelocity = 0;
    snake = [
        {x:Game.UNITSIZE * 4, y:0},
        {x:Game.UNITSIZE * 3, y:0},
        {x:Game.UNITSIZE * 2, y:0},
        {x:Game.UNITSIZE, y:0},
        {x:0, y:0}
    ];
    gameStart();
    
}


function touchMove(direction) {
    const event = new KeyboardEvent("keydown", { key: direction });
    //console.log(event);
    window.dispatchEvent(event);
}

