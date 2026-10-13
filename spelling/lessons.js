// Шар роботи з уроками "Встав літеру" в localStorage.
// Окремий ключ від lessons-app, бо інша структура даних (речення + індекси пропусків).
//
// Формат уроку:
// {
//   id: string,
//   title: string,
//   sentences: [
//     {
//       text: "Не має часу",     // повний оригінальний текст речення
//       blanks: [3]              // індекси символів у text, які стають пропусками
//                                  // (учень вводить символ на цій позиції; якщо
//                                  // text[i] для цього індексу — пробіл, правильна
//                                  // відповідь — порожньо/нічого не вводити)
//     },
//     ...
//   ]
// }

const SpellingStore = (() => {
  const STORAGE_KEY = "spelling-app:lessons";

  function genId() {
    return `spelling_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Не вдалося прочитати уроки spelling з localStorage:", err);
      return [];
    }
  }

  function saveAll(lessons) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
      return true;
    } catch (err) {
      console.warn("Не вдалося зберегти уроки spelling в localStorage:", err);
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
    return { id: null, title: "", sentences: [] };
  }

  function createEmptySentence() {
    return { text: "", blanks: [] };
  }

  // Текст речення з пропусками, показаними як підкреслення — для прев'ю
  // в редакторі та на карточці уроку. Пробіл-пропуск показуємо як "␣",
  // щоб було видно, що там саме пропуск, а не просто відступ.
  function previewWithBlanks(sentence) {
    const chars = sentence.text.split("");
    return chars
      .map((ch, i) => {
        if (!sentence.blanks.includes(i)) return ch;
        return ch === " " ? "[␣]" : "_";
      })
      .join("");
  }

  // Перевірка відповіді учня на одну позицію-пропуск.
  // expected — символ з оригінального тексту (sentence.text[index]).
  // input — те, що ввів учень (може бути порожнім рядком, якщо пропуск
  // очікує "нічого не вводити", напр. місце без апострофа).
  // Порівняння регістро-залежне за замовчуванням, бо для орфографії
  // великі/малі літери теж мають значення (напр. початок речення).
  function checkAnswer(expected, input) {
    const expectedNorm = expected === " " ? "" : expected;
    const inputNorm = (input || "").trim() === "" ? "" : input;
    return expectedNorm === inputNorm;
  }

  return {
    getAll,
    getById,
    upsert,
    remove,
    createEmpty,
    createEmptySentence,
    previewWithBlanks,
    checkAnswer,
  };
})();
