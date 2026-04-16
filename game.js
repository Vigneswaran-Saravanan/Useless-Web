const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Images

const carImg = new Image(); carImg.src = 'img/car.png';
const starImg = new Image(); starImg.src = 'img/star.png';
const rockImg = new Image(); rockImg.src = 'img/rock.png';
const drumImg = new Image(); drumImg.src = 'img/drum.png';

// Audio

const collectSound = new Audio('sound/collect.mp3');
const crashSound = new Audio('sound/crash.mp3');
const successSound = new Audio('sound/success.wav');
const startSound = new Audio('sound/gamestart.mp3');

// Car

let car = { x:240, y:580, width:48, height:64, angle:0, speed:0 };

let keys = {};
let score = 0;
let startTime;

let reverseSteering = false;
let trackLength = 2500;
let trackSpeed = 4;

let obstacles = [];
let collectibles = [];

let finishLineY = -trackLength;

let gameOver = false;
let gameStarted = false;

// Track

let trackWidth = 320;
let borderWidth = 8;

let trackLeft = (canvas.width-trackWidth)/2;
let trackRight = trackLeft+trackWidth;

// Control Function


function setSpeed(speed){

trackSpeed = speed;

}

function setTrackLength(type){

if(type === 'short') trackLength = 1500;
if(type === 'medium') trackLength = 2500;
if(type === 'long') trackLength = 4000;

finishLineY = -trackLength;

resetGame();

}

function toggleReverse(){

reverseSteering = !reverseSteering;

console.log("Reverse steering:", reverseSteering);

}


// Overlay

function showOverlay(title,message){

document.getElementById('overlayTitle').innerText = title;
document.getElementById('overlayMessage').innerText = message;

document.getElementById('overlay').style.visibility='visible';

gameOver=true;

}

function hideOverlay(){

document.getElementById('overlay').style.visibility='hidden';

resetGame();

}


// Start Game

function startGame(){

startSound.currentTime=0;
startSound.play();

gameStarted=true;

startTime=Date.now();

document.getElementById('startBtn').disabled=true;

}

// Reset Game

function resetGame(){

car.x=canvas.width/2;
car.y=580;
car.angle=0;
car.speed=0;

score=0;

obstacles=[];
collectibles=[];

gameOver=false;
gameStarted=false;

generateObstacles();
generateCollectibles();

document.getElementById('time').innerText="0.00";
document.getElementById('score').innerText="0";

document.getElementById('startBtn').disabled=false;

trackLeft=(canvas.width-trackWidth)/2;
trackRight=trackLeft+trackWidth;

}

// Obstacles

function generateObstacles(){

for(let i=0;i<20;i++){

obstacles.push({

x:Math.random()*(trackRight-trackLeft-32)+trackLeft+16,
y:-Math.random()*trackLength,
size:32,
type:Math.random()>0.5?'rock':'drum'

});

}

}

// Collectibles

function generateCollectibles(){

for(let i=0;i<20;i++){

collectibles.push({

x:Math.random()*(trackRight-trackLeft-24)+trackLeft+12,
y:-Math.random()*trackLength,
size:24,
type:'star'

});

}

}

// Key Input

document.addEventListener('keydown',e=>keys[e.key]=true);
document.addEventListener('keyup',e=>keys[e.key]=false);


// Update Game

function update(){

if(gameOver||!gameStarted) return;

// Turning 
let turnSpeed = 0.03;

if(reverseSteering){

if(keys['ArrowLeft']) car.angle += turnSpeed;
if(keys['ArrowRight']) car.angle -= turnSpeed;

}else{

if(keys['ArrowLeft']) car.angle -= turnSpeed;
if(keys['ArrowRight']) car.angle += turnSpeed;

}


// Speed

if(keys['ArrowUp']) car.speed=trackSpeed;
else if(keys['ArrowDown']) car.speed=-trackSpeed;
else car.speed*=0.9;


// Limit Angle

if(car.angle>0.4) car.angle=0.4;
if(car.angle<-0.4) car.angle=-0.4;


// Move Car

car.x+=Math.sin(car.angle)*car.speed;
car.y-=Math.cos(car.angle)*car.speed;


// Road Boundary

if(car.x<trackLeft+car.width/2) car.x=trackLeft+car.width/2;

if(car.x>trackRight-car.width/2) car.x=trackRight-car.width/2;


// Finish Line

if(car.y<finishLineY){

successSound.play();

showOverlay(

"MISSION COMPLETE",
"SCORE "+score+"\nTIME "+((Date.now()-startTime)/1000).toFixed(2)+"s"

);

return;

}


// Collision

for(let o of obstacles){

if(Math.abs(car.x-o.x)<32 && Math.abs(car.y-o.y)<32){

crashSound.play();

showOverlay(

"GAME OVER",
"YOU HIT "+o.type.toUpperCase()

);

return;

}

}


// Collect Stars

for(let i=0;i<collectibles.length;i++){

let c=collectibles[i];

if(Math.abs(car.x-c.x)<32 && Math.abs(car.y-c.y)<32){

score+=10;

collectSound.play();

collectibles.splice(i,1);

i--;

}

}


document.getElementById('time').innerText=((Date.now()-startTime)/1000).toFixed(2);
document.getElementById('score').innerText=score;

}

// Draw

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);


// Road
ctx.fillStyle='#444';
ctx.fillRect(trackLeft,0,trackWidth,canvas.height);


// Broders

ctx.fillStyle='white';
ctx.fillRect(trackLeft-borderWidth,0,borderWidth,canvas.height);
ctx.fillRect(trackRight,0,borderWidth,canvas.height);


// Finish Line

ctx.fillStyle='yellow';
ctx.fillRect(trackLeft,finishLineY-car.y+580,trackWidth,8);


// Obstacles
for(let o of obstacles){

ctx.drawImage(
o.type==='rock'?rockImg:drumImg,
o.x-o.size/2,
o.y-car.y+580,
o.size,
o.size
);

}



// Collectibles
for(let c of collectibles){

ctx.drawImage(
starImg,
c.x-c.size/2,
c.y-car.y+580,
c.size,
c.size
);

}

// Car
ctx.save();
ctx.translate(car.x,580);
ctx.rotate(car.angle);
ctx.drawImage(carImg,-car.width/2,-car.height/2,car.width,car.height);
ctx.restore();

}


// Game Loop

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);

}

// Init

resetGame();
gameLoop();