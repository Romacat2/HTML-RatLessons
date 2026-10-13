(() => {
  const params = new URLSearchParams(location.search);
  const lessonId = params.get("lesson");
  const lesson = lessonId ? SpellingStore.getById(lessonId) : null;

  const lessonTagEl = document.getElementById("lessonTag");
  const heartsEl = document.getElementById("hearts");
  const sentenceLineEl = document.getElementById("sentenceLine");
  const feedbackEl = document.getElementById("feedback");
  const submitBtn = document.getElementById("submitBtn");
  const ratRainEl = document.getElementById("ratRain");

  if (!lesson || lesson.sentences.length === 0) {
    sentenceLineEl.innerHTML = `<div>Урок не знайдено 🙁</div>`;
    submitBtn.style.display = "none";
    heartsEl.style.display = "none";
    lessonTagEl.textContent = "";
  } else {
    runLesson(lesson);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function runLesson(lesson) {
    lessonTagEl.textContent = `Урок: ${lesson.title}`;

    const queue = shuffle(lesson.sentences);
    let queueIndex = 0;
    let lives = 3;
    let correctCount = 0;
    let wrongCount = 0;
    let locked = false;
    const startTime = Date.now();

    function renderHearts() {
      let html = "";
      for (let i = 0; i < 3; i++) {
        html += i < lives ? "❤️" : '<span class="heart-lost">❤️</span>';
      }
      heartsEl.innerHTML = html;
    }

    function spawnRatRain() {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const rat = document.createElement("span");
        rat.className = "rat-drop";
        rat.textContent = "🐀";
        rat.style.left = `${Math.random() * 96}vw`;
        rat.style.setProperty("--rat-size", `${1.3 + Math.random() * 1.4}rem`);
        rat.style.setProperty(
          "--rat-duration",
          `${1.1 + Math.random() * 0.8}s`,
        );
        rat.style.setProperty("--rat-delay", `${Math.random() * 0.25}s`);
        ratRainEl.appendChild(rat);
        rat.addEventListener("animationend", () => rat.remove());
      }
    }

    function finishLesson() {
      const elapsedMs = Date.now() - startTime;
      const seconds = Math.round(elapsedMs / 1000);
      const totalAnswered = correctCount + wrongCount;
      const resultParams = new URLSearchParams({
        correct: String(correctCount),
        wrong: String(wrongCount),
        total: String(totalAnswered),
        time: String(seconds),
        lesson: lesson.id,
        lessonTitle: lesson.title,
      });
      location.href = `result.html?${resultParams.toString()}`;
    }

    let currentSentence = null;
    let blankInputs = []; // [{ el, index, expected }]

    function newSentence() {
      if (queueIndex >= queue.length) {
        finishLesson();
        return;
      }
      currentSentence = queue[queueIndex];
      queueIndex++;

      feedbackEl.classList.remove("show");
      feedbackEl.innerHTML = "";

      const chars = currentSentence.text.split("");
      blankInputs = [];
      sentenceLineEl.innerHTML = "";

      chars.forEach((ch, i) => {
        if (currentSentence.blanks.includes(i)) {
          const input = document.createElement("input");
          input.type = "text";
          input.className = "blank-input";
          input.maxLength = 1;
          input.autocomplete = "off";
          input.autocapitalize = "off";
          input.spellcheck = false;
          input.dataset.index = String(i);
          sentenceLineEl.appendChild(input);
          blankInputs.push({ el: input, index: i, expected: ch });
        } else {
          const span = document.createElement("span");
          span.className = "sentence-char";
          span.textContent = ch;
          sentenceLineEl.appendChild(span);
        }
      });

      if (blankInputs.length > 0) {
        blankInputs[0].el.focus();
      }
    }

    // Перехід фокуса до наступного порожнього пропуску при вводі символу —
    // щоб не треба було клікати по кожному input вручну.
    sentenceLineEl.addEventListener("input", (e) => {
      const target = e.target;
      if (!target.classList.contains("blank-input")) return;
      if (target.value.length === 0) return;

      const currentIdx = blankInputs.findIndex((b) => b.el === target);
      const next = blankInputs[currentIdx + 1];
      if (next) {
        next.el.focus();
      }
    });

    sentenceLineEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        checkSentence();
      } else if (e.key === "Backspace" && e.target.value === "") {
        const target = e.target;
        const currentIdx = blankInputs.findIndex((b) => b.el === target);
        const prev = blankInputs[currentIdx - 1];
        if (prev) {
          prev.el.focus();
        }
      }
    });

    submitBtn.addEventListener("click", () => checkSentence());

    function checkSentence() {
      if (locked || blankInputs.length === 0) return;
      locked = true;

      let allCorrect = true;
      blankInputs.forEach((b) => {
        const isCorrect = SpellingStore.checkAnswer(b.expected, b.el.value);
        b.el.classList.add(isCorrect ? "correct" : "wrong");
        b.el.disabled = true;
        if (!isCorrect) allCorrect = false;
      });

      if (allCorrect) {
        correctCount++;
        feedbackEl.innerHTML = "✅";
        feedbackEl.classList.add("show");
        spawnRatRain();
      } else {
        lives--;
        wrongCount++;
        renderHearts();
        feedbackEl.innerHTML = "❌";
        feedbackEl.classList.add("show");
      }

      setTimeout(
        () => {
          locked = false;
          if (lives <= 0) {
            finishLesson();
            return;
          }
          newSentence();
        },
        allCorrect ? 700 : 1300,
      );
    }

    renderHearts();
    newSentence();
  }
})();
