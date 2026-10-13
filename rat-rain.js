// Спільна анімація "дощу з пацюків" при правильній відповіді.
// Очікує в DOM контейнер <div class="rat-rain" id="ratRain"></div>
// (position: fixed, inset: 0 — див. style.css), куди додаються .rat-drop
// елементи, що самі себе прибирають по завершенню animationend.
//
// Підключати після style.css, перед test.js:
//   <div class="rat-rain" id="ratRain"></div>
//   ...
//   <script src="../rat-rain.js"></script>
//   <script src="test.js"></script>
//
// У test.js викликати: spawnRatRain(document.getElementById("ratRain"))

function spawnRatRain(container, count = 10) {
	if (!container) return;
	for (let i = 0; i < count; i++) {
		const rat = document.createElement("span");
		rat.className = "rat-drop";
		rat.textContent = "🐀";
		rat.style.left = `${Math.random() * 96}vw`;
		rat.style.setProperty("--rat-size", `${1.3 + Math.random() * 1.4}rem`);
		rat.style.setProperty("--rat-duration", `${1.1 + Math.random() * 0.8}s`);
		rat.style.setProperty("--rat-delay", `${Math.random() * 0.25}s`);
		container.appendChild(rat);
		rat.addEventListener("animationend", () => rat.remove());
	}
}
