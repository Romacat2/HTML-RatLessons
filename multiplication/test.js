(() => {
  const LEVELS = {
    easy: { min: 2, max: 4, label: "Легкий" },
    medium: { min: 3, max: 7, label: "Середній" },
    hard: { min: 6, max: 9, label: "Важкий" },
  };

  const params = new URLSearchParams(location.search);
  const levelKey = LEVELS[params.get("level")] ? params.get("level") : "medium";
  const level = LEVELS[levelKey];

  const heartsEl = document.getElementById("hearts");
  const levelTagEl = document.getElementById("levelTag");
  const factorAEl = document.getElementById("factorA");
  const factorBEl = document.getElementById("factorB");
  const answerInputEl = document.getElementById("answerInput");
  const feedbackEl = document.getElementById("feedback");
  const keypadEl = document.getElementById("keypad");
  const ratRainEl = document.getElementById("ratRain");
  const timerEl = document.getElementById("timer");

  levelTagEl.textContent = `Рівень: ${level.label}`;

  let lives = 3;
  let correctCount = 0;
  let timeLeft = 60;
  let timerInterval = null;
  let currentAnswer = 0;
  let typed = "";
  let locked = false; // блокує ввід під час показу фідбеку
  const startTime = Date.now();

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function startTimer() {
    timerEl.textContent = `${timeLeft} с`;
    timerInterval = setInterval(() => {
      timeLeft--;
      timerEl.textContent = `${timeLeft}с`;
      if (timeLeft <= 10) {
        timerEl.classList.add("low");
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        finishGame();
      }
    }, 1000);
  }

  function renderHearts() {
    let html = "";
    for (let i = 0; i < 3; i++) {
      html += i < lives ? "❤️" : '<span class="heart-lost">❤️</span>';
    }
    heartsEl.innerHTML = html;
  }

  function newProblem() {
    const a = randInt(level.min, level.max);
    const b = randInt(level.min, level.max);
    currentAnswer = a * b;
    factorAEl.textContent = a;
    factorBEl.textContent = b;
    typed = "";
    answerInputEl.value = "";
    feedbackEl.classList.remove("show");
    feedbackEl.innerHTML = "";
  }

  function updateInputDisplay() {
    answerInputEl.value = typed;
  }

  function finishGame() {
    clearInterval(timerInterval);
    const elapsedMs = Date.now() - startTime;
    const seconds = Math.round(elapsedMs / 1000);
    const resultParams = new URLSearchParams({
      correct: String(correctCount),
      time: String(seconds),
      level: levelKey,
    });
    location.href = `result.html?${resultParams.toString()}`;
  }

  function spawnRatRain() {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const rat = document.createElement("span");
      rat.className = "rat-drop";
      rat.textContent = "🐀";
      rat.style.left = `${Math.random() * 96}vw`;
      rat.style.setProperty("--rat-size", `${1.3 + Math.random() * 1.4}rem`);
      rat.style.setProperty("--rat-duration", `${1.1 + Math.random() * 0.8}s`);
      rat.style.setProperty("--rat-delay", `${Math.random() * 0.25}s`);
      ratRainEl.appendChild(rat);
      rat.addEventListener("animationend", () => rat.remove());
    }
  }

  function showFeedback(isCorrect) {
    locked = true;
    if (isCorrect) {
      feedbackEl.innerHTML = `✅`;
      spawnRatRain();
    } else {
      feedbackEl.innerHTML = `❌ <span class="wrong-answer">правильно: ${currentAnswer}</span>`;
    }
    feedbackEl.classList.add("show");

    setTimeout(
      () => {
        locked = false;
        if (lives <= 0) {
          finishGame();
          return;
        }
        newProblem();
      },
      isCorrect ? 500 : 1100,
    );
  }

  function submitAnswer() {
    if (locked || typed === "") return;
    const value = parseInt(typed, 10);
    const isCorrect = value === currentAnswer;
    if (isCorrect) {
      correctCount++;
    } else {
      lives--;
      renderHearts();
    }
    showFeedback(isCorrect);
  }

  function pressDigit(d) {
    if (locked) return;
    if (typed.length >= 4) return;
    typed += d;
    updateInputDisplay();
  }

  function pressClear() {
    if (locked) return;
    typed = typed.slice(0, -1);
    updateInputDisplay();
  }

  // --- Екранна клавіатура ---
  keypadEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".key");
    if (!btn) return;
    const key = btn.dataset.key;
    if (key === "clear") {
      pressClear();
    } else if (key === "enter") {
      submitAnswer();
    } else {
      pressDigit(key);
    }
  });

  // --- Фізична клавіатура ---
  document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
      pressDigit(e.key);
    } else if (e.key === "Backspace") {
      pressClear();
    } else if (e.key === "Enter") {
      submitAnswer();
    }
  });

  renderHearts();
  newProblem();
  startTimer();
})();
