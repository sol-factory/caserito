import { notify } from "./notify";

export const cleanRegExp = (text: string) => {
  return new RegExp(escapeRegExp(cleanText(text)), "gi");
};

export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const titleCase = (str) => {
  // Step 1. Lowercase the string
  str = str.toLowerCase();
  // str = "I'm a little tea pot".toLowerCase();
  // str = "i'm a little tea pot";

  // Step 2. Split the string into an array of strings
  str = str.split(" ");
  // str = "i'm a little tea pot".split(' ');
  // str = ["i'm", "a", "little", "tea", "pot"];

  // Step 3. Create the FOR loop
  for (let i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }

  // Step 4. Return the output
  return str.join(" "); // ["I'm", "A", "Little", "Tea", "Pot"].join(' ') => "I'm A Little Tea Pot"
};

export const cleanText = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};

export const toSlug = (text: string) => {
  if (!text) return "";
  return text.toLowerCase().replaceAll(" ", "-");
};

export const getRandomId = () => Math.random().toString(36).substring(2, 15);

export const getFirstLetters = (texts: any[]) => {
  const textsWithContent = texts.filter((t) => !!t);

  if (textsWithContent.length === 0) return;

  const firstText = textsWithContent[0];
  if (textsWithContent.length === 1) {
    return firstText.slice(0, 2).toUpperCase();
  } else {
    const firstLetter = firstText.slice(0, 1).toUpperCase();
    const secondLetter = textsWithContent[1].slice(1, 2).toUpperCase();
    return firstLetter + secondLetter;
  }
};

export const pluralize = (word, number, ending = "s") => {
  if (number === 1) {
    return word;
  }
  return word + ending;
};

export const toProperCase = (name: string) => {
  if (!name) return ""; // Maneja nombres vacíos o null
  return name
    .toLowerCase() // Convierte todo a minúsculas primero
    .split(" ") // Divide por espacios
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Primera letra en mayúscula
    .join(" "); // Une las palabras de nuevo
};

export const capitalizeFirstLetter = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const copy = (text, entity) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      notify({ ok: true, message: `${entity} copiado` });
    })
    .catch((err) => {
      console.error("Error al copiar: ", err);
    });
};
