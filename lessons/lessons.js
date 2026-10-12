// Спільний шар роботи з уроками в localStorage.
// Формат уроку:
// {
//   id: string,
//   title: string,
//   exercises: [
//     {
//       question: "cat" | "https://.../cat.jpg",   // текст або URL картинки
//       options: [
//         { value: "кіт" | "https://...jpg", correct: true },
//         { value: "...", correct: false },
//         { value: "...", correct: false }
//       ]
//     }, ...
//   ]
// }

const LessonsStore = (() => {
	const STORAGE_KEY = "lessons-app:lessons";

	function isImage(value) {
		return typeof value === "string" && /^https?:\/\//i.test(value.trim());
	}

	function genId() {
		return `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
	}

	function getAll() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch (err) {
			console.warn("Не вдалося прочитати уроки з localStorage:", err);
			return [];
		}
	}

	function saveAll(lessons) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
			return true;
		} catch (err) {
			console.warn("Не вдалося зберегти уроки в localStorage:", err);
			return false;
		}
	}

	function getById(id) {
		return getAll().find((l) => l.id === id) || null;
	}

	function upsert(lesson) {
		const lessons = getAll();
		if (!lesson.id) {
			lesson.id = genId();
		}
		const idx = lessons.findIndex((l) => l.id === lesson.id);
		if (idx >= 0) {
			lessons[idx] = lesson;
		} else {
			lessons.push(lesson);
		}
		saveAll(lessons);
		return lesson;
	}

	function remove(id) {
		const lessons = getAll().filter((l) => l.id !== id);
		saveAll(lessons);
	}

	function createEmpty() {
		return { id: null, title: "", exercises: [] };
	}

	function createEmptyExercise() {
		return {
			question: "",
			options: [
				{ value: "", correct: true },
				{ value: "", correct: false },
				{ value: "", correct: false },
			],
		};
	}

	return { getAll, getById, upsert, remove, createEmpty, createEmptyExercise, isImage };
})();
