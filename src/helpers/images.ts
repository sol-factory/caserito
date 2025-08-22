import { CONFIG } from "@/config/constanst";

export async function svgToPngDataUrl(
  primFillColor: string,
  secFillColor: string,
  flip = false
) {
  const svg = `
    <svg width="1200" height="120" viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" >
       ${flip ? `<g transform="scale(-1, -1) translate(-1200, -120)">` : ""}
            <path d="M600,0 C700,15 1000,20 1200,25 L1200,0 L600,0 Z" fill="${secFillColor || lightenHex(primFillColor, 35)}" />
            <path d="M0,38 C200,50 600,0 900,0 L1200,0 L0,0 Z" fill="${primFillColor}" />
       ${flip ? "</g>" : ""}
    </svg>
  `;

  const svgElement = new DOMParser().parseFromString(
    svg,
    "image/svg+xml"
  ).documentElement;
  return svgElement;
}

export function lightenHex(hex, percent) {
  // Remove the "#" if present
  hex = hex.replace("#", "");

  // Convert hex to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Calculate the increase by the percentage
  r = Math.round(r + (255 - r) * (percent / 100));
  g = Math.round(g + (255 - g) * (percent / 100));
  b = Math.round(b + (255 - b) * (percent / 100));

  // Convert back to HEX
  const newHex =
    "#" +
    ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();

  return newHex;
}

export const getFileTypeUrl = (type) => {
  const fileTypeImage = {
    pdf: `${CONFIG.blob_url}/pdf2.png`,
    image: `${CONFIG.blob_url}/image.png`,
    video: `${CONFIG.blob_url}/video.png`,
    audio: `${CONFIG.blob_url}/audio2.png`,
    excel: `${CONFIG.blob_url}/excel.png`,
    word: `${CONFIG.blob_url}/word.png`,
    text: `${CONFIG.blob_url}/text.png`,
    json: `${CONFIG.blob_url}/json.png`,
    other: `${CONFIG.blob_url}/other.png`,
  };

  let url = fileTypeImage.other;

  if (type.includes("pdf")) url = fileTypeImage.pdf;
  else if (type.includes("image")) url = fileTypeImage.image;
  else if (type.includes("video")) url = fileTypeImage.video;
  else if (type.includes("audio")) url = fileTypeImage.audio;
  else if (type.includes("text")) url = fileTypeImage.text;
  else if (type.includes("json")) url = fileTypeImage.json;
  else if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("sheet")
  )
    url = fileTypeImage.excel;
  else if (type.includes("word")) url = fileTypeImage.word;

  return url;
};
export const getFileTypeActionText = (type) => {
  const fileTypeImage = {
    pdf: `Abrir`,
    image: `Abrir`,
    video: `Abrir`,
    audio: `Abrir`,
    excel: `Descargar`,
    word: `Descargar`,
    text: `Abrir`,
    json: `Abrir`,
    other: `Abrir`,
  };

  type = type?.toLowerCase?.() || "";

  let actionText = fileTypeImage.other;

  if (type.includes("pdf")) actionText = fileTypeImage.pdf;
  else if (type.includes("image")) actionText = fileTypeImage.image;
  else if (type.includes("video")) actionText = fileTypeImage.video;
  else if (type.includes("audio")) actionText = fileTypeImage.audio;
  else if (type.includes("text")) actionText = fileTypeImage.text;
  else if (type.includes("json")) actionText = fileTypeImage.json;
  else if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("sheet")
  )
    actionText = fileTypeImage.excel;
  else if (type.includes("word")) actionText = fileTypeImage.word;

  return actionText;
};
