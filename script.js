const CANVAS_COLOR = "black";
const PADDLE_COLOR = "blue";
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_COLOR = "white";
const BALL_RADIUS = 10;
const WINNING_SCORE = 3;

var framePerSecond = 30;

var aiMode = false;
var started = false;
var showingWinner = false;

var handler = null;
var statusBtn = null;

var user1score = 0;
var user2score = 0;

var canvas = null;
var canvasContext = null;

var ballX = 50;
var ballY = 50;
var ballSpeedX = 10;
var ballSpeedY = 4;

var paddle1Y = 250;
var paddle2Y = 250;

function colorRect(leftX, topY, width, height, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.fillRect(leftX, topY, width, height);
}

function colorCircle(centerX, centerY, radius, fillColor) {
  canvasContext.fillStyle = fillColor;
  canvasContext.beginPath();
  canvasContext.arc(centerX, centerY, radius, 0, Math.PI*2, true);
  canvasContext.fill();
}

function drawDashline() {
  canvasContext.beginPath();
  canvasContext.setLineDash([10, 5]);
  canvasContext.moveTo(canvas.width/2, 0);
  canvasContext.lineTo(canvas.width/2, canvas.height);
  canvasContext.strokeStyle = "white";
  canvasContext.stroke();
}

function showWinnerScreen() {
  let textX = canvas.width/2-50;
  let textY = canvas.height - 100;
  canvasContext.fillStyle = "white";
  if (user1score > user2score) {
    canvasContext.fillText("Left Player Won!", textX, 100);
  } else if (user1score < user2score) {
    canvasContext.fillText("Right Player Won!", textX, 100);
  } else {
    canvasContext.fillText("Draw!", textX, 100);
  }
  canvasContext.fillText("Click to restart", textX, textY);
  statusBtn.innerText = "GAME OVER !";
}

function drawEverything() {
  colorRect(0, 0, canvas.width, canvas.height, CANVAS_COLOR);
  colorRect(0, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_COLOR);
  colorRect(canvas.width-PADDLE_WIDTH, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_COLOR);
  if (showingWinner) {
    clearHandler();
    showWinnerScreen();
  } else {
    colorCircle(ballX, ballY, BALL_RADIUS, BALL_COLOR);
    drawDashline();
    canvasContext.fillText(user1score, 100, 100);
    canvasContext.fillText(user2score, 500, 100);
  }
}

function moveEverything() {
  if (showingWinner)   return;
  ballX = ballX + ballSpeedX;
  if (ballX < 0) {
    if (ballY < paddle1Y || ballY > paddle1Y + PADDLE_HEIGHT) {
      user2score++;
      ballReset(canvas.width-PADDLE_WIDTH, paddle2Y+PADDLE_HEIGHT/2);
    } else {
      ballSpeedX = -ballSpeedX;
      var deltaY = ballY - (paddle1Y + PADDLE_HEIGHT/2);
      ballSpeedY = deltaY * 0.35;
    }
  }
  if (ballX > canvas.width) {
    if (ballY < paddle2Y || ballY > paddle2Y + PADDLE_HEIGHT) {
      user1score++;
      ballReset(0, paddle1Y+PADDLE_HEIGHT/2);
    } else {
      ballSpeedX = -ballSpeedX;
      var deltaY = ballY - (paddle2Y + PADDLE_HEIGHT/2);
      ballSpeedY = deltaY * 0.35;
    }
  }

  ballY = ballY + ballSpeedY;
  if (ballY < 0 || ballY > canvas.height) {
    ballSpeedY = -ballSpeedY;
  }

  if (aiMode)    aiMovement();
}

function calculateMousePos(evt) {
  let rect = canvas.getBoundingClientRect();
  let root = document.documentElement;
  let mouseX = evt.clientX - rect.left - root.scrollLeft;
  let mouseY = evt.clientY - rect.top - root.scrollTop;
  return {
    x: mouseX,
    y: mouseY
  };
}

function ballReset(startX, startY) {
  ballX = startX;
  ballY = startY;
  if (user1score >= WINNING_SCORE || user2score >= WINNING_SCORE) {
    showingWinner = true;
  }
}

function paddleReset(paddleY) {
  paddle1Y = paddleY;
  paddle2Y = paddleY;
}

function resetScores() {
  user1score = 0;
  user2score = 0;
}

function clearHandler() {
  if (handler)  {
    clearInterval(handler);
    handler = null;
  }
}

function initialGame() {
  started = false;
  showingWinner = false;
  statusBtn.innerText = "START";

  resetScores();
  ballReset(canvas.width/2, canvas.height/2);
  paddleReset((canvas.height - PADDLE_HEIGHT)/2);
  drawEverything();
}

function aiMovement() {
  let paddle1YCenter = paddle1Y + (PADDLE_HEIGHT/2);
  if(paddle1YCenter < ballY - 15) {
    paddle1Y = paddle1Y + 6;
  } else if(paddle1YCenter > ballY + 15) {
    paddle1Y = paddle1Y - 6;
  }
}

function changeGame() {
  if (showingWinner)   initialGame();
  else {
    started = !started;
    if (started) {
      handler = setInterval(function() {
        moveEverything();
        drawEverything();
      }, 1000/framePerSecond);
      statusBtn.innerText = "STOP";
    } else {
      clearHandler();
      initialGame();
    }
  }
}

window.onload = function() {
  statusBtn = document.getElementById("status");
  aiCheckbox = document.getElementById("aicheck");
  canvas = document.getElementById("gameCanvas");
  canvasContext = canvas.getContext("2d");
  canvasContext.font = "20px Arial";

  initialGame();

  aiCheckbox.addEventListener("click", function() {
    aiMode = aiCheckbox.checked;
    console.log(aiMode);
  })

  canvas.addEventListener("mousemove", function(evt) {
    let mousePos = calculateMousePos(evt);
    if (aiMode) {
      paddle2Y = mousePos.y - PADDLE_HEIGHT/2;
    } else {
      if (mousePos.x < canvas.width/2) {
        paddle1Y = mousePos.y - PADDLE_HEIGHT/2;
      } else {
        paddle2Y = mousePos.y - PADDLE_HEIGHT/2;
      }
    }
  });

  statusBtn.addEventListener("click", changeGame);
}