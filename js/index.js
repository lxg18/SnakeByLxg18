const gameSpace = document.querySelector(".gameSpace");
const controlPanel = document.querySelector(".controlPanel");
const text = document.querySelector(".text");
const textOfGame = document.querySelector(".textOfGame");
const butLight = document.querySelector(".butLight");
const butPause = document.querySelector(".butPause");
const butUp = document.querySelector(".butUp");
const butDown = document.querySelector(".butDown");
const butLeft = document.querySelector(".butLeft");
const butRight = document.querySelector(".butRight");
const body = document.body;
const textOfGameBackColor = "rgba(19, 48, 65, 0.482)";

const blockCountSqrtDefault = 8;

let score = 0; // общее количество очков
let currentLeverScoreCount = 0; // количество очков на теущем уровне
let blockCountSqrt = blockCountSqrtDefault;
let blockCount = blockCountSqrt * blockCountSqrt;
let game = {isGameOver: false, isNextLevel: false, isEatTail: true, isTeleport: true, fpsFreq: 0};
game.fpsFreq = blockCountSqrt/2.8;
let scoreCoefOfBlockCount = 0.5; // доля собранной еды от размера поля, необходимое для перехода на следующий уровень
let scoreCountToLevelUp = parseInt(scoreCoefOfBlockCount * blockCount) - 1; // пересчет в количество еды

const backColor = "#00000000";
const snakeBodyColor = "#303545";
const snakeHeadColor = "#000";
let indexOfFoodColor = 0;
let foodColor = ["#760d00", "#357600", "#005e76"]; // red, green, blue;

let snakeArr = [1, 0];
let snakeArrOld = [];
let snake = {x:snakeArr[0], y:0};
let foodCoord = randomFoodCoord(0, blockCount - 1); // координата еды
let direction = 0; // 0 - pause, 1 - up, 2 - down, 3 - left, 4 - right
let lastDir = 0;
let inputBuff = [];

let win = {w:0, h:0};
let padding = 4;
let size;

let enableControlPanel;

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
  enableControlPanel = true;
} else enableControlPanel = false;

restart();

function getSizes() {
  win.w = window.innerWidth - padding;
  win.h = window.innerHeight - padding;
  size = win.w < win.h ? win.w / blockCountSqrt : win.h / blockCountSqrt;
}

function restart() {
  if (enableControlPanel) {
    controlPanel.classList.remove("noDisplay");
  }
  else {
    controlPanel.classList.add("noDisplay");
  }
  currentLeverScoreCount = 0;
  if (game.isGameOver) {
    score = 0; 
    blockCountSqrt = blockCountSqrtDefault;
  }
  blockCount = blockCountSqrt * blockCountSqrt;
  scoreCountToLevelUp = parseInt(scoreCoefOfBlockCount * blockCount) - 1;
  game.fpsFreq = blockCountSqrt/2.8;
  snakeArr = [1, 0];
  snakeArrOld = [];
  indexOfFoodColor = 0;
  snake.x = snakeArr[0];
  snake.y = 0;
  direction = 0; // 0 - pause, 1 - up, 2 - down, 3 - left, 4 - right
  lastDir = 0;
  inputBuff = [];
  foodCoord = randomFoodCoord(0, blockCount - 1);
  butPause.textContent = "пауза";
  getSizes();
  createBlocks();
  setButtonPosition();
  if (game.isNextLevel) {
    textOfGame.style.lineHeight = "120%";
    textOfGame.textContent = "Новый уровень!";
    textOfGame.style.background = textOfGameBackColor;
  }
  game.isNextLevel = false;
  game.isGameOver = false;
  game.isEatTail = true;
  game.isTeleport = true;
}

function setButtonPosition() { // позиционирование кнопок в зависимости от ориентации
  const butSizeCoef = 0.25;
  let butSize = win.w < win.h ? win.w * butSizeCoef : win.h * butSizeCoef;
  
  butPause.style.height = butPause.style.width = butUp.style.width = butDown.style.width = butLeft.style.width = butRight.style.width = butUp.style.height = butDown.style.height = butLeft.style.height = butRight.style.height = `${butSize}px`;
  
  butPause.style.fontSize = butUp.style.fontSize = butDown.style.fontSize = butLeft.style.fontSize = butRight.style.fontSize = `${butSize / 4}px`;
  lightSizeCoef = 0.15 * butPause.clientWidth;
  butLight.style.width = butLight.style.height = `${butPause.clientWidth + lightSizeCoef}px`;
  
  let offset = (blockCountSqrt + 1) * size;
  if (win.w < win.h) {
    butPause.style.top = `${offset + butSize}px`;
    butPause.style.left = `${win.w / 2 - butSize * 0.5}px`;
    
    butUp.style.top = `${offset}px`;
    butDown.style.top = `${offset + butSize * 2}px`; 
    butUp.style.left = butDown.style.left = 
    `${win.w / 2 - butSize * 0.5}px`;
    butLeft.style.top = butRight.style.top = `${offset + butSize}px`;
    butLeft.style.left = `${win.w / 2 - butSize * 1.5}px`;
    butRight.style.left = `${win.w / 2 + butSize * 0.5}px`;
    
    butLight.style.left = `${butPause.offsetLeft - lightSizeCoef / 2}px`;
    butLight.style.top = `${butPause.offsetTop - lightSizeCoef / 2}px`;
  }
  
  else {
    butPause.style.left = `${offset + butSize}px`;
    butPause.style.top = `${win.h / 2 - butSize * 0.5}px`;
    
    butUp.style.left = butDown.style.left = `${offset + butSize }px`;
    butUp.style.top = `${win.h / 2 - butSize * 1.5}px`;
    butDown.style.top = `${win.h / 2 + butSize * 0.5}px`;
    
    butLeft.style.top = butRight.style.top = `${win.h / 2 - butSize * 0.5}px`;
    butLeft.style.left = `${offset}px`;
    butRight.style.left = `${offset + butSize * 2}px`;
    
    butLight.style.left = `${butPause.offsetLeft - lightSizeCoef / 2}px`;
    butLight.style.top = `${butPause.offsetTop - lightSizeCoef / 2}px`;
  }
}

function createBlocks() {
  let x = 0;
  let y = 0;
  gameSpace.style.width = gameSpace.style.height = blockCountSqrt * size + "px";
  text.style.height = text.style.width = blockCountSqrt * size + "px";
  text.style.fontSize = (blockCountSqrt * size) / 1.5 + "px";
  text.style.lineHeight = "150%";
  text.style.color = "gray";
  text.style.zIndex = 0;
  text.style.textShadow = " ";

  textOfGame.style.height = blockCountSqrt * size * 0.5 + "px"
  textOfGame.style.top = blockCountSqrt * size * 0.25 + "px"
  textOfGame.style.width = blockCountSqrt * size + "px";
  textOfGame.style.fontSize = (blockCountSqrt * size) / 5.5 + "px";
  textOfGame.style.lineHeight = "90%";
  textOfGame.style.textShadow = "5px 5px #000";
  textOfGame.style.background = ""; 
  textOfGame.textContent = "";

  gameSpace.style.background = 0;
  gameSpace.innerHTML = " ";
  for (let i = 0; i < blockCount; i++) {
    x = i % blockCountSqrt * size;
    if (i%blockCountSqrt == 0 && i != 0) y += size;
    gameSpace.innerHTML += `<div id = "id${i}" class = "block" style = "left: ${x}px; top: ${y}px; width: ${size}px; height: ${size}px"><div>`;
    curBlockStyle = gameSpace.children[i].style;
    curBlockStyle.background = backColor;
    if (i == foodCoord) curBlockStyle.background = foodColor[indexOfFoodColor];
    for (let j = 0; j < snakeArr.length; j++) {
      if (j == 0 && snakeArr[j] == i) {
        curBlockStyle.background = snakeHeadColor;
      }
      else if (snakeArr[j] == i) {
        curBlockStyle.background = snakeBodyColor;
      }
    }
  }
}


// обработчик кнопок
function getKeyPress(key) { 
  switch (key) {
    case 'pause':
      if (game.isGameOver || game.isNextLevel) restart();
      direction = 0;
      break;
    case 'up':
      if (lastDir != 2) {
        direction = 1;
        inputBuff.unshift(1);
      }
      break;
    case 'down':
      if (lastDir != 1) {
        direction = 2;
        inputBuff.unshift(2);
      }
      break;
    case 'left':
      if (lastDir != 4) {
        direction = 3; 
        inputBuff.unshift(3);
      }
      break;
    case 'right':
      if (lastDir != 3) {
        direction = 4;
        inputBuff.unshift(4);
      }
      break;
  }
  if (inputBuff.length > 0) {
    lastDir = inputBuff[0];
  }
  butPause.style.background = (direction == 0) ? "rgb(0,0,0,0)" : "gray";
  if (direction != 0 && !game.isGameOver) {
    textOfGame.textContent = "";
    textOfGame.style.background = "";
  }
  else if (!game.isGameOver) {
    textOfGame.style.lineHeight = "250%";
    textOfGame.textContent = "ПАУЗА";
    textOfGame.style.background = textOfGameBackColor;
  }
}


function randomInteger(min, max) { 
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

function randomFoodCoord(min, max) { 
  let trig = true;
  let value;
  while(trig) {
    value = Math.floor(Math.random() * (max + 1 - min) + min);
    trig = false;
    for (let i = 0; i < snakeArr.length; i++) {
      if (value == snakeArr[i]) trig = true;
    }
  }
  return value;
}

let stop = false;
let frameCount = 0;
let fps, fpsInterval, startTime, now, then, elapsed;

start(game.fpsFreq); // запуск главного цикла с определенной частотой кадров

function start(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    mainloop();
}


function mainloop() {
  requestAnimationFrame(mainloop);
  now = Date.now();
  elapsed = now - then;
  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);
    
    if (!game.isGameOver) {
      for (let i = 0; i < snakeArr.length; i++) {
        snakeArrOld[i] = snakeArr[i];
      }
      
      changeDirection = false;
      if (direction > 0) {
        if (inputBuff.length > 0) {
          direction = inputBuff[inputBuff.length - 1];
        }
        switch (direction) {
          case 1: // вверх
            if (game.isTeleport) {
              if (--snake.y < 0) {
                snake.y = blockCountSqrt-1;
              }
            }
            else {
              if (--snake.y < 0) {
                snake.y = 0;
                direction = 0;
                gameOver();
              }
            }
            break;
          case 2: // вниз
            if (game.isTeleport) {
              if (++snake.y >= blockCountSqrt) {
                snake.y = 0;
              }
            }
            else {
              if (++snake.y >= blockCountSqrt) {
                snake.y = blockCountSqrt-1;
                direction = 0;
                gameOver();
              }
            }
            break;
          case 3: // влево
            if (game.isTeleport) {
              if (--snake.x < 0) {
                snake.x = blockCountSqrt-1;
              }
            }
            else {
              if (--snake.x < 0) {
                snake.x = 0;
                direction = 0;
                gameOver();
              }
            }
            break;
          case 4: // вправо
            if (game.isTeleport) {
              if (++snake.x >= blockCountSqrt) {
                snake.x = 0;
              }
            }
            else {
              if (++snake.x >= blockCountSqrt) {
                snake.x = blockCountSqrt-1;
                direction = 0;
                gameOver();
              }
            }
            break;
        }
        inputBuff.pop();
      }
      changeDirection = true;
      
      snakeArr[0] = snake.x + snake.y * blockCountSqrt;
      
      if (snakeArr[0] != snakeArrOld[0]) {
        for (let i = 1; i < snakeArr.length; i++) {
          snakeArr[i] = snakeArrOld[i - 1];
        }
      }
      if (!game.isGameOver) renderBlocks();
      
      // пересеклись с хвостом
      for (let i = 2; i < snakeArr.length; i++) {
        if (snakeArr[0] == snakeArr[i]) {
          if (game.isEatTail) {
            let tempArr = [];
            for (let k = 0; k < i; k++) {
              tempArr[k] = snakeArr[k];
            }
            snakeArr = tempArr; //snakeArr.splice(0, i);
          }
          else {
            direction = 0;
            gameOver();
          }
          break;
        }
      }
      
      // пересеклись с едой
      if (snakeArr[0] == foodCoord) { 
        score++;
        currentLeverScoreCount ++;
        setBonus(indexOfFoodColor); // применяем эффект от еды
        foodCoord = randomFoodCoord(0, blockCount-1);
        
        if (currentLeverScoreCount > scoreCountToLevelUp) {
          blockCountSqrt++;
          game.isNextLevel = true; 
          restart();
        }
        indexOfFoodColor = randomInteger(0, foodColor.length - 1);
        snakeArr.push(snakeArrOld[snakeArrOld.length - 1]);
      }
    }
  }
}

function setBonus(index) {
  col = foodColor[indexOfFoodColor];
  //console.log('index: ', index, " ", col, " - ", col == "#005e76" ? "blue" : col == "#357600" ? "green" : "red");
  switch(index) {
    case 0: // красная еда - сброс эффектов
      game.isEatTail = false;
      game.isTeleport = false;
    break;
    case 1: // зелёная еда - возможность съесть хвост
      game.isEatTail = true;
      game.isTeleport = false;
    break;
    case 2: // синяя еда - телепорт
      game.isEatTail = false;
      game.isTeleport = true;
    break;
  }

}


function renderBlocks() {
  for (let i = 0; i < blockCount; i++) {
    curBlockStyle = gameSpace.children[i].style;
    curBlockStyle.background = backColor+" ";
    if (i == foodCoord) curBlockStyle.background = foodColor[indexOfFoodColor];
    for (let j = 1; j < snakeArr.length; j++) {
      if (snakeArr[j] == i) {
        curBlockStyle.background = snakeBodyColor;
      }
    }
  }
  gameSpace.children[snakeArr[0]].style.background = snakeHeadColor;
  // вывод надписи
  text.textContent = `${score}`;
}

function gameOver() {
  butPause.textContent = "рестарт";
  game.isGameOver = true;
  textOfGame.style.lineHeight = "90%";
  textOfGame.style.background = textOfGameBackColor;
  textOfGame.innerHTML = `<span class="colorTextRed">Игра\nокончена!</span>\n Ваш счёт: ${score}`;
  text.textContent = "";
}

document.body.addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp") butUp.click();
  if (e.key == "ArrowDown") butDown.click();
  if (e.key == "ArrowLeft") butLeft.click();
  if (e.key == "ArrowRight") butRight.click();
  if (e.key == " " || e.key == "Enter") butPause.click();
}, false);

window.addEventListener("resize", () => {
  getSizes();
  createBlocks();
  setButtonPosition();
}, false);
