export const drawHeader = (doc, pos, store, height) => {
  const pageSize = doc.internal.pageSize;
  const pageWidth = pageSize.getWidth();

  doc.setFillColor(store.quotes_primary_color);
  doc.rect(pos.x, pos.y, pageWidth, height, "F");

  pos.y += height;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text("PRESUPUESTO", pageWidth / 2, height / 2 + 2.5, {
    align: "center",
  });
};

export const drawUnderlineText = (text, doc, pos, fontSize = 13) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.text(text, pos.x, pos.y);

  const lineWidth = fontSize >= 13 ? 0.3 : 0.25;
  const lineExpandWidth = fontSize >= 13 ? 0.2 : 0.15;
  // Medir el ancho del texto para que la línea tenga el mismo largo
  const textWidth = doc.getTextWidth(text) + lineExpandWidth;

  const yMove = fontSize >= 13 ? 1 : 0.7;
  // Dibujar la línea justo debajo del texto
  const lineY = pos.y + yMove;
  doc.setLineWidth(lineWidth); // Grosor de la línea
  doc.line(pos.x, lineY, pos.x + textWidth, lineY); // (x1, y1, x2, y2)
  doc.setFont("helvetica", "normal");
};

export const getResizedImages = async (doc, company) => {
  const { left, top, width, height } = (await getWhitePaddingTopLeft(
    company.logo_url
  )) as any;
  const leftTrim = left / width;
  const topTrim = top / height;
  const resizedLogo = (await loadAndResizeImage(
    company.logo_url,
    600,
    300
  )) as any;
  const resizedPin = (await loadAndResizeImage(
    "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/quotes/pin-BhUvycu5ikbnYfX4c3GnEwlbk4cz2H.png",
    50,
    50
  )) as any;
  const resizedGaraje = (await loadAndResizeImage(
    "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/quotes/garaje-Jv38XHFgxoaQwNF0FOMlG46i2AG4C4.png",
    50,
    50
  )) as any;
  const resizedWsp = (await loadAndResizeImage(
    "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/whatsapp.png",
    50,
    50
  )) as any;
  const imgProps = doc.getImageProperties(resizedLogo);

  const aspectRatio = imgProps.width / imgProps.height;
  const leftMove = leftTrim * aspectRatio * 20;
  const topMove = topTrim * 20;

  return {
    resizedPin,
    resizedLogo,
    resizedGaraje,
    resizedWsp,
    leftMove,
    topMove,
    aspectRatio,
  };
};

async function loadAndResizeImage(url, maxWidth, maxHeight) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Para evitar problemas con CORS

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Escalar proporcionalmente
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/png")); // Usa "image/jpeg" si no necesitas transparencia
    };

    img.src = url;
  });
}

function getWhitePaddingTopLeft(imageBase64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Para evitar problemas con CORS
    img.src = imageBase64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      let top = 0;
      let left = 0;

      // detectar top
      for (let y = 0; y < img.height; y++) {
        let allWhite = true;
        for (let x = 0; x < img.width; x++) {
          const idx = (y * img.width + x) * 4;
          if (
            !(
              data[idx] > 240 &&
              data[idx + 1] > 240 &&
              data[idx + 2] > 240 &&
              data[idx + 3] > 240
            )
          ) {
            allWhite = false;
            break;
          }
        }
        if (!allWhite) break;
        top++;
      }

      // detectar left
      for (let x = 0; x < img.width; x++) {
        let allWhite = true;
        for (let y = 0; y < img.height; y++) {
          const idx = (y * img.width + x) * 4;
          if (
            !(
              data[idx] > 240 &&
              data[idx + 1] > 240 &&
              data[idx + 2] > 240 &&
              data[idx + 3] > 240
            )
          ) {
            allWhite = false;
            break;
          }
        }
        if (!allWhite) break;
        left++;
      }

      resolve({ top, left, width: img.width, height: img.height });
    };
  });
}
