(() => {
	const params = new URLSearchParams(location.search);
	const lessonId = params.get("lesson");
	const lesson = lessonId ? LessonsStore.getById(lessonId) : null;

	const lessonTagEl = document.getElementById("lessonTag");
	const heartsEl = document.getElementById("hearts");
	const questionWrapEl = document.getElementById("questionWrap");
	const feedbackEl = document.getElementById("feedback");
	const optionsWrapEl = document.getElementById("optionsWrap");
	const ratRainEl = document.getElementById("ratRain");

	if (!lesson || lesson.exercises.length === 0) {
		questionWrapEl.innerHTML = `<div class="question-text">Урок не знайдено 🙁</div>`;
		optionsWrapEl.innerHTML = `<a href="index.html" class="csharp-btn" style="background:#888;text-align:center;">← На головну</a>`;
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

	function runLesson(lesson) {
		lessonTagEl.textContent = `Урок: ${lesson.title}`;

		const queue = shuffle(lesson.exercises);
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

		function renderTerm(value) {
			if (LessonsStore.isImage(value)) {
				return `<img class="question-img" src="${value}" alt="" onerror="this.replaceWith(document.createTextNode('🖼️ (не вдалось завантажити)'))">`;
			}
			return `<div class="question-text">${escapeHtml(value)}</div>`;
		}

		function escapeHtml(str) {
			const div = document.createElement("div");
			div.textContent = str;
			return div.innerHTML;
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

		function newExercise() {
			if (queueIndex >= queue.length) {
				// Усі вправи уроку пройдено без втрати всіх життів — завершуємо тут,
				// інакше queueIndex забігав би по колу нескінченно.
				finishLesson();
				return;
			}
			const exercise = queue[queueIndex];
			queueIndex++;

			questionWrapEl.innerHTML = "";
			questionWrapEl.insertAdjacentHTML("beforeend", renderTerm(exercise.question));
			questionWrapEl.appendChild(feedbackEl);
			feedbackEl.classList.remove("show");
			feedbackEl.innerHTML = "";

			const shuffledOptions = shuffle(exercise.options);
			optionsWrapEl.innerHTML = "";
			shuffledOptions.forEach((opt) => {
				const btn = document.createElement("button");
				btn.className = "option-btn";
				btn.innerHTML = renderTerm(opt.value);
				btn.dataset.correct = opt.correct ? "1" : "0";
				btn.addEventListener("click", () => selectOption(btn, shuffledOptions));
				optionsWrapEl.appendChild(btn);
			});
		}

		function selectOption(btn, allOptions) {
			if (locked) return;
			locked = true;

			const isCorrect = btn.dataset.correct === "1";
			const allBtns = Array.from(optionsWrapEl.children);
			allBtns.forEach((b) => b.classList.add("disabled"));

			if (isCorrect) {
				btn.classList.add("correct");
				correctCount++;
				feedbackEl.innerHTML = "✅";
				feedbackEl.classList.add("show");
				spawnRatRain();
			} else {
				btn.classList.add("wrong");
				const correctBtn = allBtns.find((b) => b.dataset.correct === "1");
				if (correctBtn) correctBtn.classList.add("correct");
				lives--;
				wrongCount++;
				renderHearts();
				feedbackEl.innerHTML = "❌";
				feedbackEl.classList.add("show");
			}

			setTimeout(() => {
				locked = false;
				if (lives <= 0) {
					finishLesson();
					return;
				}
				newExercise();
			}, isCorrect ? 500 : 1100);
		}

		renderHearts();
		newExercise();
	}
})();
