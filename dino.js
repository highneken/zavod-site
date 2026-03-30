(function () {
  var UNLOCK_SCORE = 50;
  var STORAGE_KEY = 'zavod_unlocked';

  // Already unlocked? Skip gate
  if (localStorage.getItem(STORAGE_KEY)) {
    document.getElementById('gate').style.display = 'none';
    document.getElementById('site').classList.remove('site-hidden');
    return;
  }

  var canvas = document.getElementById('dino-canvas');
  var ctx = canvas.getContext('2d');

  // Responsive canvas
  function resizeCanvas() {
    var w = Math.min(600, window.innerWidth - 40);
    canvas.width = w;
    canvas.height = 160;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Game state
  var dino = { x: 40, y: 120, w: 20, h: 24, vy: 0, grounded: true };
  var gravity = 0.6;
  var jumpForce = -11;
  var obstacles = [];
  var speed = 4;
  var score = 0;
  var frameCount = 0;
  var gameOver = false;
  var started = false;
  var groundY = 140;

  function spawnObstacle() {
    var h = 16 + Math.random() * 20;
    obstacles.push({
      x: canvas.width + 10,
      y: groundY - h,
      w: 10 + Math.random() * 10,
      h: h
    });
  }

  function jump() {
    if (dino.grounded) {
      dino.vy = jumpForce;
      dino.grounded = false;
    }
  }

  function reset() {
    dino.y = groundY - dino.h;
    dino.vy = 0;
    dino.grounded = true;
    obstacles = [];
    speed = 4;
    score = 0;
    frameCount = 0;
    gameOver = false;
    started = true;
  }

  function update() {
    if (!started || gameOver) return;

    frameCount++;
    if (frameCount % 10 === 0) score++;
    if (frameCount % 200 === 0) speed += 0.3;

    // Dino physics
    dino.vy += gravity;
    dino.y += dino.vy;
    if (dino.y >= groundY - dino.h) {
      dino.y = groundY - dino.h;
      dino.vy = 0;
      dino.grounded = true;
    }

    // Obstacles
    if (frameCount % Math.floor(60 + Math.random() * 40) === 0) {
      spawnObstacle();
    }

    for (var i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed;
      if (obstacles[i].x + obstacles[i].w < 0) {
        obstacles.splice(i, 1);
        continue;
      }
      // Collision
      if (
        dino.x < obstacles[i].x + obstacles[i].w &&
        dino.x + dino.w > obstacles[i].x &&
        dino.y < obstacles[i].y + obstacles[i].h &&
        dino.y + dino.h > obstacles[i].y
      ) {
        gameOver = true;
      }
    }

    // Unlock check
    if (score >= UNLOCK_SCORE) {
      unlock();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Dino
    ctx.fillStyle = '#666';
    ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(dino.x + 14, dino.y + 4, 3, 3);
    // Leg animation
    var legOffset = frameCount % 10 < 5 ? 0 : 4;
    ctx.fillStyle = '#666';
    ctx.fillRect(dino.x + 3, dino.y + dino.h, 4, 6);
    ctx.fillRect(dino.x + 12 + legOffset, dino.y + dino.h, 4, 6);

    // Obstacles
    ctx.fillStyle = '#555';
    for (var i = 0; i < obstacles.length; i++) {
      ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].w, obstacles[i].h);
    }

    // Score
    ctx.fillStyle = '#444';
    ctx.font = '14px Inter, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(String(score).padStart(5, '0'), canvas.width - 10, 20);

    if (gameOver) {
      ctx.fillStyle = '#666';
      ctx.font = '16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, 80);
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Press Space to retry', canvas.width / 2, 100);
    }

    if (!started) {
      ctx.fillStyle = '#444';
      ctx.font = '13px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Press Space to start', canvas.width / 2, 80);
    }
  }

  function unlock() {
    localStorage.setItem(STORAGE_KEY, '1');
    started = false;

    // Transition
    var gate = document.getElementById('gate');
    var site = document.getElementById('site');

    gate.style.transition = 'opacity 1.5s ease';
    gate.style.opacity = '0';

    setTimeout(function () {
      gate.style.display = 'none';
      site.classList.remove('site-hidden');
      site.style.opacity = '0';
      site.style.transition = 'opacity 1.5s ease';
      requestAnimationFrame(function () {
        site.style.opacity = '1';
      });
    }, 1500);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    e.preventDefault();

    if (!started) {
      reset();
    } else if (gameOver) {
      reset();
    } else {
      jump();
    }
  }

  document.addEventListener('keydown', handleInput);
  canvas.addEventListener('touchstart', handleInput);
  canvas.addEventListener('click', handleInput);

  // Update score display
  setInterval(function () {
    var el = document.getElementById('score-display');
    if (started && !gameOver && score > 0) {
      el.textContent = score + ' / ' + UNLOCK_SCORE;
    } else {
      el.textContent = '';
    }
  }, 200);

  // Init dino position
  dino.y = groundY - dino.h;
  loop();
})();
