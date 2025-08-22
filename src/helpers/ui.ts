import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toMoney } from "./fmt";
import {
  addDays,
  differenceInDays,
  format,
  isFuture,
  isPast,
  isToday,
  isTomorrow,
  isYesterday,
} from "date-fns";
import { es } from "date-fns/locale";
import { getWeekOfYear } from "./date";
import { capitalizeFirstLetter, toSlug } from "./text";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getResizedImages } from "./pdf";
import { svgToPngDataUrl } from "./images";
import { svg2pdf } from "svg2pdf.js";
import { COUNTRIES } from "@/config/constanst";
import { splitByCurrency } from "./arrays";

// import roboto from "../../fonts/roboto-regular-normal.js";
// import robotoBold from "../../fonts/roboto-bold-normal.js";

const focus = (id: string) => {
  const element = document.getElementById(id);

  element?.focus();
};

const click = (id: string) => {
  document.getElementById(id)?.click();
};

export const focusAfter = (
  id: string,
  miliseconds: number = 50,
  open: boolean = false
) => {
  if (miliseconds === 0) {
    focus(id);
    if (open) click(id);
  } else {
    setTimeout(() => {
      focus(id);
      if (open) click(id);
    }, miliseconds);
  }
};

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const userPressed = (key: "Enter" | "Tab", code: string) => {
  if (key === "Enter") {
    return (
      code === "Enter" ||
      code === "NumpadEnter" ||
      code === "Go" ||
      code === "Done" ||
      code === "Send" ||
      code === "Search" ||
      code === "Next"
    );
  }

  return code === "Tab";
};

export const getFontSize = () => {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
};

export const insertHtmlAtCursorPosition = (element, html) => {
  // Obtener la selección actual
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    // Obtener el rango actual
    const range = selection.getRangeAt(0);

    // Verificar si el rango está dentro del div editable
    if (element.contains(range.commonAncestorContainer)) {
      // Eliminar el contenido del rango seleccionado
      range.deleteContents();

      // Crear un fragmento de documento para insertar el HTML
      const fragment = document.createRange().createContextualFragment(html);

      // Insertar el fragmento en el rango
      range.insertNode(fragment);

      // Colocar el cursor al final del contenido insertado
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
};
export type TPossibleTemplatesNames =
  | "Nombre del cliente"
  | "Nombre del integrante"
  | "Datos del vehículo"
  | "Fecha de la venta"
  | "Fecha y hora de retiro"
  | "Nombre de la empresa"
  | "Nombre de la sucursal"
  | "Dirección sucursal"
  | "Detalle de la venta"
  | "Código de retiro"
  | "Link para ingresar";

export type TPossibleTemplates = {
  name: TPossibleTemplatesNames;
  text: string;
  allowedScreens: string[];
};

export const getWalletUrl = (wallet) => {
  return wallet.name === "Efectivo"
    ? "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/billetes.png"
    : wallet.url || wallet.logo_url;
};

export const genTemplatePlaceholder = (name: TPossibleTemplatesNames) => {
  return `<span class="bg-blue-100 select-none cursor-pointer rounded py-[2px] px-1.5 text-sm" contenteditable="false">${name}</span>`;
};

export const parseWhatsappMessage = (
  content: string,
  {
    clientName,
    companyName,
    storeName,
    storeAddress,
    services,
    vehicle,
    sale_date,
    pick_up_date,
    discounts,
    gatheredAmount = 0,
    saleAmount = 0,
    usdGatheredAmount,
    usdSaleAmount,
    flag = "🇦🇷",
    saleId,
    isOwner = false,
  }: {
    clientName: string;
    companyName: string;
    vehicle: any;
    sale_date: any;
    services: any[];
    discounts: any[];
    storeAddress: string;
    storeName?: string;
    pick_up_date?: any;
    gatheredAmount?: number;
    saleAmount?: number;
    usdGatheredAmount?: number;
    usdSaleAmount?: number;
    discountsAmount?: number;
    flag?: string;
    saleId?: string;
    isOwner?: boolean;
  }
) => {
  let parsedContent = content.replaceAll(
    genTemplatePlaceholder("Nombre del cliente"),
    capitalizeFirstLetter(clientName)
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Nombre del integrante"),
    capitalizeFirstLetter(clientName)
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Nombre de la sucursal"),
    capitalizeFirstLetter(storeName)
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Dirección sucursal"),
    capitalizeFirstLetter(storeAddress)
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Nombre de la empresa"),
    companyName
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Datos del vehículo"),
    genVehicleData(vehicle)
  );

  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Fecha de la venta"),
    genDateMessage(sale_date)
  );
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Fecha y hora de retiro"),
    genPickUpDateMessage(pick_up_date)
  );

  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Código de retiro"),
    `${saleId?.slice(-8, -1).toUpperCase()}`
  );

  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Link para ingresar"),
    `https://www.aquapp.lat/${isOwner ? "" : "login"}`
  );

  let ticketList = "";
  const discountsAmount = discounts.reduce(
    (prev, curr) => prev + curr.amount,
    0
  );

  const [baseCurrencyServices, usdServices] = splitByCurrency(services);
  const [baseCurrencyDiscounts, usdDiscounts] = splitByCurrency(discounts);

  const baseCurrencyDiscountsAmount = baseCurrencyDiscounts.reduce(
    (prev, curr) => prev + curr.amount,
    0
  );
  const usdDiscountsAmount = usdDiscounts.reduce(
    (prev, curr) => prev + curr.amount,
    0
  );
  const pendingAmount = Math.max(
    saleAmount - baseCurrencyDiscountsAmount - gatheredAmount,
    0
  );
  const pendingAmountUSD = Math.max(
    usdSaleAmount - usdDiscountsAmount - (usdGatheredAmount || 0),
    0
  );

  const wspLines = [
    ...baseCurrencyServices.map((s) => ({
      ...s,
      amount: (s["value"] || s["price"]) * s.quantity,
      quantity: s.allow_quantity ? s.quantity : null,
      icon: "🛎️",
    })),
    ...baseCurrencyDiscounts.map((d) => ({
      ...d,
      name: d.name === "De monto variable" ? "Descuento" : d.name,
      icon: "🔥",
      coef: -1,
    })),
    { name: "Ya pagaste", icon: "💰", amount: gatheredAmount, coef: -1 },
    { name: "_" },
    {
      name: "Restan pagar",
      flag,
      icon: "💰",
      amount: pendingAmount,
      coef: pendingAmount === 0 ? 1 : 0,
    },
  ];
  ticketList += genWhatsappMonospaceLines(wspLines);
  if (usdServices.length > 0) {
    const wspLinesUSD = [
      ...usdServices.map((s) => ({
        ...s,
        amount: (s["value"] || s["price"]) * s.quantity,
        quantity: s.allow_quantity ? s.quantity : null,
        icon: "🛎️",
      })),
      ...usdDiscounts.map((d) => ({
        ...d,
        name: d.name === "De monto variable" ? "Descuento" : d.name,
        icon: "🔥",
        coef: -1,
      })),
      {
        name: "Ya pagaste",
        icon: "💰",
        amount: usdGatheredAmount || 0,
        coef: -1,
      },
      { name: "_" },
      {
        name: "Restan pagar",
        flag: "🇺🇸",
        icon: "💰",
        amount: pendingAmountUSD || 0,
        coef: pendingAmountUSD === 0 ? 1 : 0,
      },
    ];
    ticketList += "\n\n" + genWhatsappMonospaceLines(wspLinesUSD, "u$s", true);
  }
  parsedContent = parsedContent.replaceAll(
    genTemplatePlaceholder("Detalle de la venta"),
    `${ticketList}\n`
  );
  parsedContent = parsedContent
    .replace(/<br\s*\/?>/gi, "\n") // Reemplaza los <br> por saltos de línea
    .replace(/<\/p>\s*<p>/gi, "\n") // Reemplaza el cierre de párrafos con dobles saltos de línea
    .replace(/<[^>]+>/g, "");

  return parsedContent.replaceAll("&nbsp;", " ");
};

const genWhatsappMonospaceLines = (
  array,
  currencySign = "$",
  spaceAfterSign = false
) => {
  let text = "";
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    const quantity = item.quantity ? ` (${item.quantity})` : " ";
    const quantityLength = item.quantity ? quantity.length - 1 : 0;
    const maxNameLength = 19 - quantityLength;
    if (item.name === "_") {
      text += `\`\`\`${"_".repeat(maxNameLength + 3)}\`\`\`\n`;
      continue;
    }
    const itemNameLines = breakLine(item.name, maxNameLength);

    const moneyAmount = toMoney(
      (item.coef || 1) * item.amount,
      false,
      spaceAfterSign,
      currencySign
    );
    const amountCharsCount = 10 - moneyAmount.length;

    const flag = item.flag ? ` ${item.flag}` : "";
    const flagCount = !!flag ? 3 : 0;

    const charsCount =
      maxNameLength - itemNameLines[0].length + amountCharsCount - flagCount;

    text += `\`\`\`${item.icon} ${capitalizeFirstLetter(itemNameLines[0])}${flag}${quantity}${" ".repeat(Math.max(0, charsCount))} ${moneyAmount} \`\`\`\n`;
    // Si hay líneas adicionales, añadirlas
    for (let i = 1; i < itemNameLines.length; i++) {
      text += `\`\`\`   ${itemNameLines[i].trim()}\`\`\`\n`;
    }
  }
  return text;
};

const genVehicleData = (vehicle) => {
  if (!vehicle) return "";
  const { brand, model, patent } = vehicle;
  return `*${brand}*${model ? ` ${model}` : ""}${!!patent ? ` (patente *${patent.toUpperCase()}*)` : ""}`;
};

export const showIfHourAhead = (targetDate, hours: number) => {
  const now = new Date();
  const hoursLater = new Date(now.getTime() + 60 * 60 * 1000 * hours);
  return targetDate > hoursLater;
};

const genDateMessage = (date) => {
  if (!date) return "";
  const today = new Date();

  const hourPart = format(date, "🕒 H:mm", { locale: es });
  if (isYesterday(date)) {
    return `*ayer* ${hourPart}`;
  } else if (isTomorrow(date)) {
    return `*mañana* ${hourPart}`;
  } else if (isToday(date)) {
    return `*hoy* ${hourPart}`;
  }

  const dayDifference = differenceInDays(date, today);
  const todayWeek = getWeekOfYear(new Date());
  const saleWeek = getWeekOfYear(date);
  const weekDifference = saleWeek - todayWeek;

  if (dayDifference > 1) {
    return `${weekDifference === 1 ? "el próximo" : weekDifference === 0 ? "este" : "el"} *${format(date, "EEEE d MMM H:mm", { locale: es })}* hs`;
  } else if (dayDifference < -1) {
    return `hace ${Math.abs(dayDifference)} días`;
  }

  return "*" + format(date, "PPPP '🕒' HH:mm", { locale: es }) + "*";
};
const genPickUpDateMessage = (date) => {
  if (!date) return "";
  const today = new Date();

  const hourPart = format(date, "🕒 H:mm", { locale: es });

  let message = `\n🗓️ *Fecha y hora de retiro*:\n`;

  if (isTomorrow(date)) {
    message += `Mañana ${hourPart}`;
  } else if (isToday(date)) {
    message += `Hoy ${hourPart}`;
  } else {
    const dayDifference = differenceInDays(date, today);
    const todayWeek = getWeekOfYear(new Date());
    const saleWeek = getWeekOfYear(date);
    const weekDifference = saleWeek - todayWeek;

    if (dayDifference > 1) {
      message += `${weekDifference === 1 ? "Próximo" : weekDifference === 0 ? "Este" : "El"} ${format(date, "EEEE d MMM H:mm", { locale: es })} hs`;
    } else {
      message += `${format(date, "PPPP '🕒' HH:mm", { locale: es })}`;
    }
  }

  return message;
};

const breakLine = (text, maxLength) => {
  // Divide el texto por palabras
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    if ((line + word).length <= maxLength) {
      line += (line ? " " : "") + word;
    } else {
      lines.push(line);
      line = word; // Empezamos una nueva línea
    }
  }
  if (line) lines.push(line); // Añadimos la última línea
  return lines;
};

const hexToRgb = (hex) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
};

const loadImageFromUrl = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // necesario si es una URL externa
    img.src = url;
    img.onload = () => {
      // Crear canvas temporal para convertir a base64
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL("image/png");
      resolve({ base64, width: img.width, height: img.height });
    };
    img.onerror = reject;
  });
};

export const createQuote = async (quote, company, store) => {
  try {
    const doc = new jsPDF();
    const darkMode = quote.dark_mode || false;
    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.getWidth();
    const pageHeight = pageSize.getHeight();
    const pos = { x: 0, y: 0 };
    const paddingX = 14;
    const startX = paddingX;
    const endX = pageWidth - paddingX;

    const bgColor: [number, number, number] = darkMode
      ? [45, 45, 45]
      : [255, 255, 255]; // fondo tabla

    // Dibujar fondo
    doc.setFillColor(...bgColor);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    const altBgColor: [number, number, number] = darkMode
      ? [35, 35, 35]
      : [245, 245, 245]; // fondo tabla filas impares
    const textColor: [number, number, number] = darkMode
      ? [255, 255, 255]
      : [10, 10, 10]; // texto general
    const tableHeadBg: any = hexToRgb(
      quote.primary_color || (darkMode ? "#ffffff" : "#292d30")
    ); // encabezado tabla
    const tableHeadText: any = [255, 255, 255]; // texto encabezado

    const header = await svgToPngDataUrl(
      quote.primary_color,
      quote.secondary_color
    );
    const footer = await svgToPngDataUrl(
      quote.primary_color,
      quote.secondary_color,
      true
    );
    const height = 35;
    await svg2pdf(header, doc, {
      x: 0,
      y: 0,
      width: 210, // ancho A4 en mm
      height, // altura relativa
    });

    pos.y += 15;

    doc.setFont("helvetica", "normal");
    const quoteDate = format(quote?.date || new Date(), "EEEE dd/MM/yyyy", {
      locale: es,
    });
    const expirationDate = format(
      addDays(quote?.date || new Date(), quote.valid_days),
      "EEEE dd/MM/yyyy",
      {
        locale: es,
      }
    );
    doc.setTextColor(...textColor);

    const { resizedWsp, resizedPin, resizedGaraje, leftMove, topMove } =
      await getResizedImages(doc, company);

    const logo: any = await loadImageFromUrl(company.logo_url);

    const maxLogoWidth = pageWidth * 0.45;
    const maxLogoHeight = 25;

    const logoRatio = logo.height / logo.width;

    let displayWidth = Math.min(maxLogoWidth, logo.width * 0.264583);
    let displayHeight = displayWidth * logoRatio;

    if (displayHeight > maxLogoHeight) {
      displayHeight = maxLogoHeight;
      displayWidth = displayHeight / logoRatio;
    }

    pos.y += 15;
    const logoHeight = 24;
    const logoY = pos.y + topMove - 15;
    doc.addImage(
      company.logo_url,
      "PNG",
      13.5 - leftMove,
      logoY,
      displayWidth,
      displayHeight
    );

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("COTIZACIÓN", endX, logoY + 10, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(quote.primary_color);
    doc.text(quote.identifier, endX - 1, logoY + 16.5, { align: "right" });

    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    pos.y += logoHeight + 5;
    // --- Datos del Cliente y Vendedor ---
    pos.x = 105;
    doc.setFont("helvetica", "bold");
    doc.text("DATOS DEL CLIENTE", 14, pos.y);
    doc.text("Fecha de emisión", endX - 90, pos.y);
    doc.setFont("helvetica", "normal");
    doc.text(`${quoteDate}`, endX, pos.y, { align: "right" });
    pos.y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Válida hasta", endX - 90, pos.y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    const { client, vehicle } = quote;
    const clientDenom = `${capitalizeFirstLetter(client.firstname)}${client.lastname ? ` ${capitalizeFirstLetter(client.lastname)}` : ""}`;
    const vehicleInfo = `${vehicle.brand}${vehicle.model ? ` ${capitalizeFirstLetter(vehicle.model)}` : ""}${vehicle.patent ? ` (${vehicle.patent.toUpperCase()})` : ""}`;

    doc.text(`${expirationDate}`, endX, pos.y, { align: "right" });

    doc.text(clientDenom, 14, pos.y);
    pos.y += 7;
    doc.text(vehicleInfo, 14, pos.y);

    const servicesSummary = quote.services.reduce(
      (sum, item) => {
        const amount = item.value * item.quantity;
        if (item.currency === "usd") {
          return {
            ...sum,
            usd_total_amount: sum.usd_total_amount + amount,
          };
        }
        return {
          ...sum,
          total_amount: sum.total_amount + amount,
        };
      },
      { usd_total_amount: 0, total_amount: 0 }
    );
    const discountsSummary = quote.discounts.reduce(
      (sum, item) => {
        if (item.currency === "usd") {
          return {
            ...sum,
            usd_total_amount: sum.usd_total_amount + item.amount,
          };
        }
        return {
          ...sum,
          total_amount: sum.total_amount + item.amount,
        };
      },
      { usd_total_amount: 0, total_amount: 0 }
    );

    let finalY = 0;
    let finalPage = 1;

    // Configuración de la tabla
    autoTable(doc, {
      startY: pos.y + 15,
      head: [[" ", "Descripción", "Cant.", "Precio", "Total"]],
      alternateRowStyles: {
        fillColor: altBgColor,
      },
      bodyStyles: {
        fillColor: bgColor,
        textColor: textColor,
      },
      headStyles: {
        fillColor: tableHeadBg,
        textColor: tableHeadText,
        fontStyle: "bold", // Opcional
        // Alineación horizontal
      },
      body: [
        ...quote.services
          .sort((a, b) => a.currency.localeCompare(b.currency))
          .map((item) => [
            {
              content: "", // lo dejamos vacío y lo manejamos nosotros
              raw: {
                title: item.name,
                note: item.quotes_description || "",
                type: "service",
              },
            },
            {
              content: "", // lo dejamos vacío y lo manejamos nosotros
              raw: {
                title: item.name,
                note: item.quotes_description || "",
              },
            },
            { content: "", raw: { title: `${item.quantity}` } },
            {
              content: "",
              raw: {
                title: `${toMoney(item.value, false, true, item.currency === "usd" ? "u$s" : "$")}`,
              },
            },
            {
              content: "",
              raw: {
                title: `${toMoney(item.value * item.quantity, false, true, item.currency === "usd" ? "u$s" : "$")}`,
              },
            },
          ]),
        ...quote.discounts
          .sort((a, b) => a.currency.localeCompare(b.currency))
          .map((item) => [
            {
              content: "", // lo dejamos vacío y lo manejamos nosotros
              raw: {
                type: "discount",
              },
            },
            {
              content: "", // lo dejamos vacío y lo manejamos nosotros
              raw: {
                title: item.name,
              },
            },
            { content: "", raw: { title: `${item.value}%` } },
            "",
            {
              content: "", // lo dejamos vacío y lo manejamos nosotros
              raw: {
                title: toMoney(
                  item.amount * -1,
                  false,
                  true,
                  item.currency === "usd" ? "u$s" : "$"
                ),
                type: "discount",
              },
            },
          ]),
      ],
      willDrawCell: function (data) {
        const { title, note, type } = (data.cell.raw as any)?.raw || {};

        if (type === "discount") {
          doc.setTextColor(0, 153, 0); // Verde
        }

        if (data.section === "body" && data.column.index === 0) {
          const maxWidth = 90; // Le restamos un poco por el padding que vos tenés

          let totalLines = 0;

          const titleLines = doc.splitTextToSize(title, maxWidth);
          totalLines += titleLines.length;

          const noteLines = doc.splitTextToSize(note, maxWidth);
          totalLines += noteLines.length;

          const lineHeight = 2.5; // Ajustalo según el tamaño de fuente y espaciado que uses
          const extraPadding = 13;

          const estimatedHeight = totalLines * lineHeight + extraPadding;

          // Fondo blanco (o el color que quieras)
          if (data.row.index % 2 !== 0) {
            doc.setFillColor(...bgColor); // o cualquier color
          } else {
            doc.setFillColor(...altBgColor); // o cualquier color
          }

          doc.rect(14, data.cell.y, 182, estimatedHeight, "F");
        }
      },
      didDrawCell: function (data) {
        const { title, note, type } = (data.cell.raw as any)?.raw || {};

        const { x, y, width } = data.cell;

        if (data.section === "body" && data.column.index === 0) {
          const imageUrl =
            type === "service"
              ? "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/quotes/campana-del-hotel%20%282%29-MmllYJAu3ih1uqQsrFAcpo33mxUSag.png"
              : "https://7jwlofbzaq4pzktn.public.blob.vercel-storage.com/quotes/gran-venta-Fo1JCrZ5ayZNxRv8egT93ASXYPvJX1.png";

          doc.addImage(
            imageUrl,
            "PNG",
            data.cell.x + 3,
            data.cell.y + 1.5,
            4,
            4
          );
        }
        if (data.section === "body" && data.column.index > 0) {
          const padding = 1;

          if (title) {
            const aligns = {
              1: "left",
              2: "center",
              3: "center",
              4: "right",
            };
            // Línea principal => bold
            const align = aligns[data.column.index];
            let textX = x + padding;

            if (align === "center") {
              textX = x + width / 2;
            } else if (align === "right") {
              textX = x + width - padding - 1.5;
            }
            if (data.column.index === 1) {
              doc.setFont("helvetica", "bold");
              textX += 2;
            }
            doc.text(title, textX, y + padding + 4.1, {
              maxWidth: width - 6,
              align,
            });
            if (data.row.index % 2 !== 0) {
              doc.setFillColor(...altBgColor); // o cualquier color
            } else {
              doc.setFillColor(...bgColor); // o cualquier color
            }

            // Línea secundaria: normal y gris
            const titleLines = doc.splitTextToSize(title, width - 6);
            const titleHeight = titleLines.length * 4.5; // Aproximadamente 4.5 por línea

            if (note) {
              doc.setFont("helvetica", "normal");
              doc.setFontSize(9);
              doc.setTextColor(120);
              doc.text(note, textX, y + titleHeight + 6, {
                maxWidth: width - 6,
              });
              doc.setTextColor(...textColor); // Resetea a negro
            }
          }
        }

        // ✅ Cambiar color de fondo si es "discount"
      },
      useCss: false,
      didParseCell: function (data) {
        const { title, note } = (data.cell.raw as any)?.raw || {};

        if (data.section === "head") {
          if (data.column.index === 1) {
            data.cell.styles.halign = "left"; // Primera columna sin centrar
          } else if (data.column.index === 4) {
            data.cell.styles.halign = "right"; // Primera columna sin centrar
          } else {
            data.cell.styles.halign = "center"; // Las demás centradas
          }
        }

        if (data.section === "body" && data.column.index === 0) {
          const maxWidth = 90; // Ajustá según tu diseño
          const lineHeight = 2.5;
          const extraPadding = !!note ? 13 : 0;

          const titleLines = title ? doc.splitTextToSize(title, maxWidth) : [];
          const noteLines = note ? doc.splitTextToSize(note, maxWidth) : [];

          const totalLines = titleLines.length + noteLines.length;
          const estimatedHeight = totalLines * lineHeight + extraPadding;

          // Este cambio afecta toda la fila
          if (estimatedHeight > data.row.height) {
            data.row.height = estimatedHeight;
          }
        }
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8, valign: "middle" },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 31 },
        4: { halign: "right", cellWidth: 31 },
      },
      willDrawPage: (data) => {
        finalPage = data.pageNumber;
        if (finalPage > 1) {
          const bgColor: [number, number, number] = darkMode
            ? [45, 45, 45]
            : [255, 255, 255]; // fondo tabla

          // Dibujar fondo
          doc.setFillColor(...bgColor);
          doc.rect(0, 0, pageWidth, pageHeight, "F");
        }
      },
      didDrawPage: (data) => {
        doc.setTextColor(...textColor); // reseteás a negro al terminar cada página
        finalY = data.cursor.y; // Guardamos la posición final de la tabla en cada página
      },
      styles: {
        minCellHeight: 4,
        cellPadding: 3,
        fontSize: 12,
      },
    });

    // Dividimos el texto largo en líneas que entren en el ancho de la página
    const usableWidth = pageWidth - 115;
    const usableHeight = pageHeight - 60;
    const lineHeight = 5;
    const lines = doc.splitTextToSize(quote.observations, usableWidth);
    const requiredHeight = lines.length * lineHeight;

    // Si no entra, agregamos una nueva página
    if (finalY + requiredHeight + 10 > usableHeight) {
      doc.addPage();
      const bgColor: [number, number, number] = darkMode
        ? [45, 45, 45]
        : [255, 255, 255]; // fondo tabla

      // Dibujar fondo
      doc.setFillColor(...bgColor);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      await svg2pdf(header, doc, {
        x: 0,
        y: 0,
        width: 210, // ancho A4 en mm
        height, // altura relativa
      });
      await svg2pdf(footer, doc, {
        x: 0,
        y: pageHeight - height,
        width: 210, // ancho A4 en mm
        height, // altura relativa
      });
      finalY = 20; // reiniciar Y
    } else {
      await svg2pdf(footer, doc, {
        x: 0,
        y: pageHeight - height,
        width: 210, // ancho A4 en mm
        height, // altura relativa
      });
    }

    let tableFinalY = finalY;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    // --- Pie de página ---
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);
    doc.text("Observaciones", 15, tableFinalY + 15, {
      align: "left",
    });
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `${quote.observations || ""}${
        quote.avoid_default_observations
          ? ""
          : `
        
      `
      }${quote.avoid_default_observations ? "" : quote.default_observations || ""}`,
      15,
      tableFinalY + 20,
      {
        maxWidth: pageWidth - 115,
      }
    );
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textColor);

    if (!quote.avoid_total) {
      const summariesX = pageWidth - 84;
      tableFinalY += 15;
      doc.text("Subtotal", summariesX, tableFinalY, { align: "left" });

      const net_amount =
        servicesSummary.total_amount - discountsSummary.total_amount;
      const IVA = net_amount * ((quote.tax || 0) / 100);
      const usd_net_amount =
        servicesSummary.usd_total_amount - discountsSummary.usd_total_amount;
      const usdIVA = usd_net_amount * ((quote.tax || 0) / 100);
      doc.setFont("helvetica", "normal");
      if (net_amount > 0) {
        doc.text(`${toMoney(net_amount)}`, pageWidth - 17, tableFinalY, {
          align: "right",
        });
      }
      if (usd_net_amount > 0) {
        tableFinalY += 6.7;
        doc.text(
          `${toMoney(usd_net_amount, false, false, "u$s")}`,
          pageWidth - 17,
          tableFinalY,
          {
            align: "right",
          }
        );
      }

      tableFinalY += 11;
      doc.setFont("helvetica", "bold");
      doc.text(
        `IVA${quote.tax > 0 ? ` (${quote.tax}%)` : " (incluído)"}`,
        summariesX,
        tableFinalY,
        { align: "left" }
      );

      doc.setFont("helvetica", "normal");

      doc.text(`${toMoney(IVA)}`, pageWidth - 17, tableFinalY, {
        align: "right",
      });

      if (usdIVA > 0) {
        tableFinalY += 6.7;
        doc.text(
          `${toMoney(usdIVA, false, false, "u$s")}`,
          pageWidth - 17,
          tableFinalY,
          {
            align: "right",
          }
        );
      }

      const rectY = tableFinalY + 10;
      const totalTextY = rectY + 6.7;
      const rectHeight = 10 + (usd_net_amount > 0 ? 7.6 : 0); // alto
      const rectX = pageWidth / 2 + 18;
      const rectWidth = pageWidth - 14 - rectX; // ancho

      doc.setFillColor(quote.primary_color);
      doc.rect(rectX, rectY, rectWidth, rectHeight, "F"); // "F" de fill

      doc.setFontSize(14);
      doc.setTextColor(255);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL", summariesX, totalTextY, { align: "left" });
      doc.setFont("helvetica", "normal");
      doc.text(`${toMoney(net_amount + IVA)}`, pageWidth - 17, totalTextY, {
        align: "right",
      });
      if (usd_net_amount > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("TOTAL u$s", summariesX, totalTextY + 7.6, {
          align: "left",
        });
        doc.setFont("helvetica", "normal");
        doc.text(
          `${toMoney(usd_net_amount + usdIVA, false, false, "u$s")}`,
          pageWidth - 17,
          totalTextY + 7.6,
          {
            align: "right",
          }
        );
      }
    }

    doc.setFontSize(12);

    const yPosWspBtn = pageHeight - 40;
    const wspLogoY = yPosWspBtn + 2;
    const btnTextY = yPosWspBtn + 6;
    const wspFillColor: [number, number, number] = darkMode
      ? [60, 60, 60]
      : [245, 245, 245];
    doc.setFillColor(...wspFillColor);
    doc.roundedRect(endX - 47, yPosWspBtn, 46, 10, 2, 2, "F");

    doc.setTextColor(...textColor);

    doc.setFontSize(12);
    doc.addImage(resizedWsp, "PNG", endX - 44, wspLogoY + 0.5, 5, 5);

    const finalPhoneNumber = store.whatsapp_number
      ? `+${store.whatsapp_number}`
      : company.phone_for_url;

    const clientMessage = `Hola, ¿cómo están? Soy *${clientDenom}*. 
  
  Escribo por el presupuesto que me pasaron el *${quoteDate}*.
  *Vehículo*: ${vehicleInfo}.`;
    doc.textWithLink("Realizar consulta", endX - 37, btnTextY, {
      url: `https://api.whatsapp.com/send?phone=${finalPhoneNumber}&text=${encodeURI(clientMessage)}`,
    });

    const companyNameY = yPosWspBtn - 12;
    doc.addImage(resizedGaraje, "PNG", startX, companyNameY - 4, 4.2, 4.2);
    pos.y = companyNameY;
    doc.setFont("helvetica", "bold");
    doc.text(`${company.name.toUpperCase()}`, startX + 7, companyNameY);
    doc.setFont("helvetica", "normal");

    pos.y += 9;

    doc.addImage(resizedPin, "PNG", startX, pos.y - 3.3, 4, 4);
    doc.setFont("helvetica", "bold");
    doc.text(`Dirección:`, startX + 6, pos.y);
    doc.setFont("helvetica", "normal");
    const addressLines = splitTextIntoLines(store.address, 30); // cambia 30 según tu ancho
    addressLines.forEach((line, index) => {
      doc.text(line, startX + 95, pos.y, { align: "right" }); // cambia coordenadas según tu diseño
      if (index + 1 != addressLines.length) {
        pos.y += 6;
      }
    });

    doc.addImage(resizedWsp, "PNG", startX, pos.y + 3.6, 4, 4);
    pos.y += 7;
    if (company.phone) {
      doc.setFont("helvetica", "bold");
      doc.text(`Teléfono:`, startX + 6, pos.y);
      doc.setFont("helvetica", "normal");
      doc.textWithLink(`${company.phone}`, startX + 95, pos.y, {
        url: `https://api.whatsapp.com/send?phone=${company.phone_for_url}&text=${encodeURI(clientMessage)}`,
        align: "right",
      });
    }

    pos.y += 7;
    if (company.fiscal_id) {
      doc.setFont("helvetica", "bold");
      doc.text(`CUIT:`, startX, pos.y);
      doc.setFont("helvetica", "normal");
      doc.text(`${company.fiscal_id}`, startX + 95, pos.y, { align: "right" });
    }
    pos.y += 7;
    if (company?.fiscal_category?.name) {
      doc.setFont("helvetica", "bold");
      doc.text(`IVA:`, startX, pos.y);
      doc.setFont("helvetica", "normal");
      doc.text(`${company.fiscal_category.name}`, startX + 95, pos.y, {
        align: "right",
      });
    }

    // Guardar o enviar al backend
    return doc;
  } catch (error) {
    console.log({ error });
  }
  // O usar doc.output
};

function splitTextIntoLines(text, maxCharsPerLine) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length <= maxCharsPerLine) {
      currentLine += word + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

export const getMenuItemsCount = (conditions = [], minimum = 4) => {
  return minimum + conditions.reduce((prev, curr) => prev + +curr, 0);
};

export const filterMenuItems = (screen, item, template) => {
  if (screen === "Ventas") {
    const isRememberTemplate =
      template.name === "Recordatorio turno" && template.locked;
    const isTakeAwayTemplate =
      template.name === "Retirar vehículo" && template.locked;

    return (
      (isRememberTemplate &&
        showIfHourAhead(item.sale_date, 1) &&
        !item.sent) ||
      (isRememberTemplate && isPast(item.sale_date) && item.sent) ||
      (isTakeAwayTemplate &&
        !item.sent &&
        !item.taken_away &&
        (isPast(item.sale_date) || isToday(item.sale_date))) ||
      !template.locked
    );
  }

  if (screen === "Cotizaciones") {
    return (template.locked && !item.sent) || !template.locked;
  }

  return true;
};

export const getCountry = (current_store, form) => {
  if (["client", "member", "company"].includes(form)) {
    return COUNTRIES.find((c) => c.code === current_store?.country_code);
  }
};

export const forceDownload = (url: string, filename?: string) => {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
