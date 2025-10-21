document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let stars = [];
  let shootingStars = [];

  function initStars() {
    stars = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        alpha: Math.random(),
        twinkleSpeed: Math.random() * 0.05,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach((star) => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1) {
        star.alpha = 1;
        star.twinkleSpeed *= -1;
      } else if (star.alpha < 0) {
        star.alpha = 0;
        star.twinkleSpeed *= -1;
      }

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fill();
    });
  }

  function createShootingStar() {
    if (Math.random() < 0.02) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 100,
        len: Math.random() * 80 + 10,
        speed: Math.random() * 5 + 5,
        angle: Math.PI / 4,
      });
    }
  }

  function drawShootingStars() {
    shootingStars.forEach((star, index) => {
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(star.x + star.len, star.y + star.len);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      star.x += star.speed;
      star.y += star.speed;

      if (star.x > canvas.width || star.y > canvas.height) {
        shootingStars.splice(index, 1);
      }
    });
  }

  function animate() {
    drawStars();
    createShootingStar();
    drawShootingStars();
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  });

  initStars();
  animate();

  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const playBtn = document.getElementById("play-btn");
  const tubesContainer = document.getElementById("tubes-container");
  const movesCount = document.getElementById("moves-count");
  const levelDisplay = document.getElementById("level-display");
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const hintBtn = document.getElementById("hint-btn");
  const muteBtn = document.getElementById("mute-btn");
  const homeBtn = document.getElementById("home-btn");
  const particleContainer = document.getElementById("particle-container");
  const levelClearMessage = document.getElementById("level-clear-message");
  const moveSound = document.getElementById("move-sound");
  const winSound = document.getElementById("win-sound");
  const bgMusic = document.getElementById("bg-music");

  // Background elements
  const backgroundContainers = [
    document.getElementById("starfield-background"),
    document.getElementById("sunny-background"),
    document.getElementById("dusk-background"),
  ];

  let level = 0;
  let moves = 0;
  let tubes = [];
  let selectedTube = null;
  let history = [];
  let redoStack = [];

  const levelConfigs = [
    { tubes: 5, colors: 3, ballsPerTube: 4 },
    { tubes: 6, colors: 4, ballsPerTube: 4 },
    { tubes: 7, colors: 5, ballsPerTube: 4 },
    { tubes: 8, colors: 6, ballsPerTube: 4 },
    { tubes: 9, colors: 7, ballsPerTube: 4 },
    { tubes: 10, colors: 8, ballsPerTube: 4 },
    { tubes: 11, colors: 9, ballsPerTube: 4 },
    { tubes: 12, colors: 10, ballsPerTube: 4 },
    { tubes: 7, colors: 5, ballsPerTube: 5 },
    { tubes: 8, colors: 6, ballsPerTube: 5 },
    { tubes: 9, colors: 7, ballsPerTube: 5 },
    { tubes: 10, colors: 8, ballsPerTube: 5 },
    { tubes: 11, colors: 9, ballsPerTube: 5 },
    { tubes: 12, colors: 10, ballsPerTube: 5 },
    { tubes: 13, colors: 11, ballsPerTube: 5 },
    { tubes: 14, colors: 12, ballsPerTube: 5 },
    { tubes: 8, colors: 6, ballsPerTube: 6 },
    { tubes: 9, colors: 7, ballsPerTube: 6 },
    { tubes: 10, colors: 8, ballsPerTube: 6 },
    { tubes: 11, colors: 9, ballsPerTube: 6 },
    { tubes: 12, colors: 10, ballsPerTube: 6 },
    { tubes: 13, colors: 11, ballsPerTube: 6 },
    { tubes: 14, colors: 12, ballsPerTube: 6 },
    { tubes: 15, colors: 13, ballsPerTube: 6 },
    { tubes: 16, colors: 14, ballsPerTube: 6 },
  ];

  const ballColors = [
    "#FF6B6B",
    "#FFD166",
    "#06D6A0",
    "#118AB2",
    "#073B4C",
    "#EE92C2",
    "#9A8C98",
    "#F7A072",
    "#E76F51",
    "#F4A261",
    "#E9C46A",
    "#2A9D8F",
    "#264653",
    "#A8DADC",
    "#457B9D",
    "#1D3557",
  ];

  const gameTitle = document.getElementById("game-title");
  const titleText = gameTitle.textContent;
  gameTitle.innerHTML = "";
  for (let i = 0; i < titleText.length; i++) {
    const letter = document.createElement("span");
    letter.textContent = titleText[i];
    letter.style.color = ballColors[i % ballColors.length];
    gameTitle.appendChild(letter);
  }

  homeBtn.addEventListener("click", () => {
    window.location.reload();
  });

  playBtn.addEventListener("click", () => {
    homeScreen.style.display = "none";
    gameScreen.classList.remove("hidden");
    startGame();
    playBackgroundMusic();
  });

  function setBackground(levelIndex) {
    // Remove active class from all backgrounds
    backgroundContainers.forEach((container) => {
      container.classList.remove("active");
    });

    // Choose background based on level (0, 1, 2 for the three backgrounds)
    const backgroundIndex = levelIndex % 3;
    backgroundContainers[backgroundIndex].classList.add("active");
  }

  function startGame() {
    level = 0;
    moves = 0;
    history = [];
    redoStack = [];
    setBackground(level);
    generateLevel(level);
    renderTubes();
    updateGameInfo();
  }

  function generateLevel(levelIndex) {
    const config = levelConfigs[levelIndex % levelConfigs.length];
    const numTubes = config.tubes;
    const numColors = config.colors;
    const ballsPerTube = config.ballsPerTube;

    tubes = Array.from({ length: numTubes }, () => []);
    const colors = ballColors.slice(0, numColors);
    let balls = [];
    for (const color of colors) {
      for (let i = 0; i < ballsPerTube; i++) {
        balls.push(color);
      }
    }

    // Shuffle balls
    balls.sort(() => Math.random() - 0.5);

    // Distribute balls into tubes
    let ballIndex = 0;
    for (let i = 0; i < numTubes - 2; i++) {
      for (let j = 0; j < ballsPerTube; j++) {
        if (ballIndex < balls.length) {
          tubes[i].push(balls[ballIndex++]);
        }
      }
    }
  }

  function renderTubes() {
    tubesContainer.innerHTML = "";
    tubes.forEach((tube, index) => {
      const tubeEl = document.createElement("div");
      tubeEl.classList.add("tube");
      tubeEl.dataset.index = index;

      tube.forEach((color) => {
        const ballEl = document.createElement("div");
        ballEl.classList.add("ball");
        ballEl.style.backgroundColor = color;

        const faceEl = document.createElement("div");
        faceEl.classList.add("face", "smiling");
        
        const mouthEl = document.createElement("span");
        mouthEl.classList.add("mouth");
        faceEl.appendChild(mouthEl);

        ballEl.appendChild(faceEl);

        tubeEl.appendChild(ballEl);
      });

      tubeEl.addEventListener("click", () => onTubeClick(index));
      tubesContainer.appendChild(tubeEl);
    });
  }

  function onTubeClick(index) {
    const clickedTube = tubes[index];

    if (selectedTube === null) {
      if (clickedTube.length > 0) {
        selectedTube = index;
        document
          .querySelector(`[data-index='${index}']`)
          .classList.add("selected");
      }
    } else {
      const sourceTube = tubes[selectedTube];
      const destTube = clickedTube;
      const sourceTubeEl = document.querySelector(
        `[data-index='${selectedTube}']`
      );

      if (selectedTube === index) {
        // Deselect
        selectedTube = null;
        sourceTubeEl.classList.remove("selected");
        return;
      }

      if (isValidMove(sourceTube, destTube)) {
        moveBall(selectedTube, index);
      }

      sourceTubeEl.classList.remove("selected");
      selectedTube = null;
    }
  }

  function isValidMove(sourceTube, destTube) {
    const config = levelConfigs[level % levelConfigs.length];
    if (sourceTube.length === 0) return false;
    if (destTube.length === config.ballsPerTube) return false;
    if (destTube.length === 0) return true;
    return sourceTube[sourceTube.length - 1] === destTube[destTube.length - 1];
  }

  function moveBall(fromIndex, toIndex, isUndo = false, isRedo = false) {
    const sourceTube = tubes[fromIndex];
    const destTube = tubes[toIndex];
    const ballColor = sourceTube[sourceTube.length - 1];

    const fromTubeEl = document.querySelector(`[data-index='${fromIndex}']`);
    const toTubeEl = document.querySelector(`[data-index='${toIndex}']`);
    const ballEl = fromTubeEl.lastChild;

    const faceEl = ballEl.querySelector(".face");
    if (faceEl) {
      faceEl.classList.remove("smiling");
      faceEl.classList.add("sad");
    }

    ballEl.classList.add("lifted");

    setTimeout(() => {
      const ball = sourceTube.pop();
      destTube.push(ball);

      if (!isUndo && !isRedo) {
        playSound(moveSound);
        history.push({ from: fromIndex, to: toIndex, ball: ballColor });
        redoStack = [];
        moves++;
      } else if (isUndo) {
        moves--;
      } else if (isRedo) {
        moves++;
      }

      renderTubes();
      updateGameInfo();
      checkWinCondition();
    }, 300);
  }

  function checkWinCondition() {
    const config = levelConfigs[level % levelConfigs.length];
    const completedTubes = tubes.filter((tube) => {
      return (
        tube.length === 0 ||
        (tube.length === config.ballsPerTube && new Set(tube).size === 1)
      );
    });

    if (completedTubes.length === tubes.length) {
      playSound(winSound);
      showWinParticles();

      // Show trophy message with decorations
      levelClearMessage.innerHTML = `
                <div class="decoration"></div>
                <div class="decoration"></div>
                <div class="decoration"></div>
                <div class="decoration"></div>
                <span class='trophy-text'>Awesome!</span>
            `;
      levelClearMessage.classList.remove("hidden");

      setTimeout(() => {
        levelClearMessage.classList.add("hidden");
        level++;
        if (level >= levelConfigs.length) {
          alert("Congratulations! You've completed all levels!");
          level = 0;
        }
        // Set new background for the next level
        setBackground(level);
        moves = 0;
        history = [];
        redoStack = [];
        generateLevel(level);
        renderTubes();
        updateGameInfo();
      }, 3000);
    }
  }

  function updateGameInfo() {
    const oldMoves = parseInt(movesCount.textContent);
    if (moves > oldMoves) {
      showPlusOne();
    }
    movesCount.textContent = moves;
    levelDisplay.textContent = level + 1;
  }

  function showPlusOne() {
    const plusOne = document.createElement("div");
    plusOne.textContent = "+1";
    plusOne.classList.add("plus-one");
    const movesCountRect = movesCount.getBoundingClientRect();
    plusOne.style.left = `${movesCountRect.left}px`;
    plusOne.style.top = `${movesCountRect.top}px`;
    document.body.appendChild(plusOne);
    setTimeout(() => {
      plusOne.remove();
    }, 1000);
  }

  undoBtn.addEventListener("click", () => {
    if (history.length > 0) {
      const lastMove = history.pop();
      redoStack.push(lastMove);

      const sourceTube = tubes[lastMove.to];
      const destTube = tubes[lastMove.from];
      moveBall(lastMove.to, lastMove.from, true);
    }
  });

  redoBtn.addEventListener("click", () => {
    if (redoStack.length > 0) {
      const nextMove = redoStack.pop();
      history.push(nextMove);

      const sourceTube = tubes[nextMove.from];
      const destTube = tubes[nextMove.to];
      moveBall(nextMove.from, nextMove.to, false, true);
    }
  }); // Fixed: Added missing closing parenthesis and semicolon

  hintBtn.addEventListener("click", () => {
    const move = findValidMove();
    if (move) {
      const { from, to } = move;
      const fromTubeEl = document.querySelector(`[data-index='${from}']`);
      const toTubeEl = document.querySelector(`[data-index='${to}']`);

      fromTubeEl.classList.add("selected");
      toTubeEl.classList.add("selected");

      setTimeout(() => {
        fromTubeEl.classList.remove("selected");
        toTubeEl.classList.remove("selected");
      }, 1000);
    } else {
      // Maybe show a message that no moves are possible
    }
  });

  function findValidMove() {
    for (let i = 0; i < tubes.length; i++) {
      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue;
        const sourceTube = tubes[i];
        const destTube = tubes[j];
        if (isValidMove(sourceTube, destTube)) {
          // This is a potential move, but we need to avoid moving into a completed tube unless necessary
          const topBall = sourceTube[sourceTube.length - 1];
          // Avoid moving a ball to a tube that is already sorted with that color
          if (destTube.every((b) => b === topBall) && destTube.length > 0) {
            continue;
          }
          return { from: i, to: j };
        }
      }
    }
    return null; // No valid move found
  }

  function playSound(soundElement) {
    soundElement.currentTime = 0;
    soundElement
      .play()
      .catch((error) => console.log("Audio play failed:", error));
  }

  function playBackgroundMusic() {
    bgMusic
      .play()
      .catch((error) => console.log("Background music play failed:", error));
  }

  muteBtn.addEventListener("click", () => {
    const isMuted = !bgMusic.muted;
    bgMusic.muted = isMuted;
    moveSound.muted = isMuted;
    winSound.muted = isMuted;
    muteBtn.innerHTML = isMuted
      ? '<i class="fas fa-volume-mute"></i>'
      : '<i class="fas fa-volume-up"></i>';
  });

  function showWinParticles() {
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");
      const x = Math.random() * window.innerWidth - window.innerWidth / 2;
      const y = Math.random() * window.innerHeight - window.innerHeight / 2;
      particle.style.setProperty("--x", `${x}px`);
      particle.style.setProperty("--y", `${y}px`);
      particle.style.backgroundColor =
        ballColors[Math.floor(Math.random() * ballColors.length)];
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particleContainer.appendChild(particle);
      setTimeout(() => {
        particle.remove();
      }, 2000);
    }
  }
});
