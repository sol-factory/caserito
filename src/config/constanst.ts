import { addDays } from "date-fns";

type PriceGroup = {
  aquapp: number;
  whatsapp_base: number;
  quotes_base: number;
  files_base: number;
};

type VersionedPrices = {
  from: string; // fecha desde la cual entra en vigencia (ISO string: "2025-07-01")
  prices: Record<string, PriceGroup>;
  increased?: number;
};

const PRICING_BY_VERSION: VersionedPrices[] = [
  {
    from: "2025-01-01",
    prices: {
      AR: { aquapp: 23100, whatsapp_base: 24, quotes_base: 80, files_base: 17 },
      US: {
        aquapp: 27,
        whatsapp_base: 0.03,
        quotes_base: 0.09,
        files_base: 0.022,
      },
      ES: {
        aquapp: 25,
        whatsapp_base: 0.025,
        quotes_base: 0.08,
        files_base: 0.02,
      },
      G1: {
        aquapp: 19,
        whatsapp_base: 0.02,
        quotes_base: 0.066,
        files_base: 0.019,
      },
      G2: {
        aquapp: 17,
        whatsapp_base: 0.017,
        quotes_base: 0.055,
        files_base: 0.017,
      },
    },
  },
  {
    from: "2025-07-01",
    increased: 0.168,
    prices: {
      AR: { aquapp: 26900, whatsapp_base: 28, quotes_base: 94, files_base: 20 },
      US: {
        aquapp: 27,
        whatsapp_base: 0.03,
        quotes_base: 0.09,
        files_base: 0.022,
      },
      ES: {
        aquapp: 25,
        whatsapp_base: 0.025,
        quotes_base: 0.08,
        files_base: 0.02,
      },
      G1: {
        aquapp: 19,
        whatsapp_base: 0.02,
        quotes_base: 0.066,
        files_base: 0.019,
      },
      G2: {
        aquapp: 17,
        whatsapp_base: 0.017,
        quotes_base: 0.055,
        files_base: 0.017,
      },
    },
  },
];

const getPrices = (
  country: string,
  atDate: Date,
  graceDays: number = 15
): PriceGroup | null => {
  const input = atDate;
  const sorted = [...PRICING_BY_VERSION].sort(
    (a, b) => new Date(b.from).getTime() - new Date(a.from).getTime()
  );
  for (const version of sorted) {
    const fromDate = addDays(new Date(version.from), graceDays);
    if (atDate >= fromDate) {
      const group1 = ["CR", "CL", "MX", "UY", "PA", "PE", "SV", "PR"];
      const group2 = [
        "EC",
        "CO",
        "BO",
        "PY",
        "GT",
        "HN",
        "NI",
        "DO",
        "VE",
        "CU",
      ];

      const priceGroup = version.prices[country];
      if (priceGroup) return priceGroup;
      if (group1.includes(country)) return version.prices["G1"];
      if (group2.includes(country)) return version.prices["G2"];
    }
  }

  return null;
};

export const VK_fixedOrder = [
  "motoneta",
  "moto",
  "auto-chico",
  "suv",
  "pick-up",
  "combi",
  "camion",
  "camion-grande",
];

export const CONFIG = {
  blob_url: "https://qbs5samke2sj0bbb.public.blob.vercel-storage.com",
  azure_blob_url: "https://aquapp.blob.core.windows.net",
  paypalBaseApiUrl: "https://api-m.paypal.com",
  paypal: {
    sandbox: {
      email: "sb-c21nj6575095@business.example.com",
      url: "https://sandbox.paypal.com",
      password: "|aDj)KI0",
    },
  },
  screens: {
    sales: {
      _id: "67766b3d65b6074adf631c3a",
      name: "Ventas",
    },
    clients: {
      _id: "67766b5665b6074adf631c3b",
      name: "Clientes",
    },
    members: {
      _id: "67766b5b65b6074adf631c3c",
      name: "Personal",
    },
    quotes: {
      _id: "67fe61ae131b3f73b6ca75f9",
      name: "Cotizaciones",
    },
  },
  subscriptions: {
    prices: getPrices,
    whatsapp: {
      free_limit: 25,
      maxQty: 1000,
      minQty: 25,
      maxDiscountRate: 0.3,
    },
    quote: {
      free_limit: 5,
      maxQty: 300,
      minQty: 5,
      maxDiscountRate: 0.3,
    },
    file: {
      free_limit: 15,
      maxQty: 500,
      minQty: 15,
      maxDiscountRate: 0.3,
    },
  },
};

export const COLORS = {
  "#22c55e": { name: "Verde", bg: "bg-green-500" },
  "#3b82f6": { name: "Azul", bg: "bg-blue-500" },
  "#ef4444": { name: "Rojo", bg: "bg-red-500" },
};

export const COUNTRIES = [
  {
    name: "Argentina",
    code: "AR",
    phone_code: "+54",
    currency_name: "Peso argentino",
    currency_symbol: "$",
    currency_code: "ARS",
    language: "es-AR",
    timezone: "America/Argentina/Buenos_Aires",
    flag: "🇦🇷",
  },
  {
    name: "Bolivia",
    code: "BO",
    phone_code: "+591",
    currency_name: "Boliviano",
    currency_symbol: "Bs.",
    currency_code: "BOB",
    language: "es-BO",
    timezone: "America/La_Paz",
    flag: "🇧🇴",
  },
  {
    name: "Brasil",
    code: "BR",
    phone_code: "+55",
    currency_name: "Real brasileño",
    currency_symbol: "R$",
    currency_code: "BRL",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    flag: "🇧🇷",
  },
  {
    name: "Chile",
    code: "CL",
    phone_code: "+56",
    currency_name: "Peso chileno",
    currency_symbol: "$",
    currency_code: "CLP",
    language: "es-CL",
    timezone: "America/Santiago",
    flag: "🇨🇱",
  },
  {
    name: "Colombia",
    code: "CO",
    phone_code: "+57",
    currency_name: "Peso colombiano",
    currency_symbol: "$",
    currency_code: "COP",
    language: "es-CO",
    timezone: "America/Bogota",
    flag: "🇨🇴",
  },
  {
    name: "Costa Rica",
    code: "CR",
    phone_code: "+506",
    currency_name: "Colón costarricense",
    currency_symbol: "₡",
    currency_code: "CRC",
    language: "es-CR",
    timezone: "America/Costa_Rica",
    flag: "🇨🇷",
  },
  {
    name: "Cuba",
    code: "CU",
    phone_code: "+53",
    currency_name: "Peso cubano",
    currency_symbol: "$",
    currency_code: "CUP",
    language: "es-CU",
    timezone: "America/Havana",
    flag: "🇨🇺",
  },
  {
    name: "Ecuador",
    code: "EC",
    phone_code: "+593",
    currency_name: "Dólar estadounidense",
    currency_symbol: "$",
    currency_code: "USD",
    language: "es-EC",
    timezone: "America/Guayaquil",
    flag: "🇪🇨",
  },
  {
    name: "El Salvador",
    code: "SV",
    phone_code: "+503",
    currency_name: "Dólar estadounidense",
    currency_symbol: "$",
    currency_code: "USD",
    language: "es-SV",
    timezone: "America/El_Salvador",
    flag: "🇸🇻",
  },
  {
    name: "Guatemala",
    code: "GT",
    phone_code: "+502",
    currency_name: "Quetzal",
    currency_symbol: "Q",
    currency_code: "GTQ",
    language: "es-GT",
    timezone: "America/Guatemala",
    flag: "🇬🇹",
  },
  {
    name: "Honduras",
    code: "HN",
    phone_code: "+504",
    currency_name: "Lempira",
    currency_symbol: "L",
    currency_code: "HNL",
    language: "es-HN",
    timezone: "America/Tegucigalpa",
    flag: "🇭🇳",
  },
  {
    name: "México",
    code: "MX",
    phone_code: "+52",
    currency_name: "Peso mexicano",
    currency_symbol: "$",
    currency_code: "MXN",
    language: "es-MX",
    timezone: "America/Mexico_City",
    flag: "🇲🇽",
  },
  {
    name: "Nicaragua",
    code: "NI",
    phone_code: "+505",
    currency_name: "Córdoba",
    currency_symbol: "C$",
    currency_code: "NIO",
    language: "es-NI",
    timezone: "America/Managua",
    flag: "🇳🇮",
  },
  {
    name: "Panamá",
    code: "PA",
    phone_code: "+507",
    currency_name: "Balboa",
    currency_symbol: "B/.",
    currency_code: "PAB",
    language: "es-PA",
    timezone: "America/Panama",
    flag: "🇵🇦",
  },
  {
    name: "Paraguay",
    code: "PY",
    phone_code: "+595",
    currency_name: "Guaraní",
    currency_symbol: "₲",
    currency_code: "PYG",
    language: "es-PY",
    timezone: "America/Asuncion",
    flag: "🇵🇾",
  },
  {
    name: "Perú",
    code: "PE",
    phone_code: "+51",
    currency_name: "Sol",
    currency_symbol: "S/",
    currency_code: "PEN",
    language: "es-PE",
    timezone: "America/Lima",
    flag: "🇵🇪",
  },
  {
    name: "Puerto Rico",
    code: "PR",
    phone_code: "+1",
    currency_name: "Dólar estadounidense",
    currency_symbol: "$",
    currency_code: "USD",
    language: "es-PR",
    timezone: "America/Puerto_Rico",
    flag: "🇵🇷",
  },
  {
    name: "República Dominicana",
    code: "DO",
    phone_code: "+1",
    currency_name: "Peso dominicano",
    currency_symbol: "RD$",
    currency_code: "DOP",
    language: "es-DO",
    timezone: "America/Santo_Domingo",
    flag: "🇩🇴",
  },
  {
    name: "Uruguay",
    code: "UY",
    phone_code: "+598",
    currency_name: "Peso uruguayo",
    currency_symbol: "$U",
    currency_code: "UYU",
    language: "es-UY",
    timezone: "America/Montevideo",
    flag: "🇺🇾",
  },
  {
    name: "Venezuela",
    code: "VE",
    phone_code: "+58",
    currency_name: "Bolívar digital",
    currency_symbol: "Bs.",
    currency_code: "VES",
    language: "es-VE",
    timezone: "America/Caracas",
    flag: "🇻🇪",
  },
  {
    name: "España",
    code: "ES",
    phone_code: "+34",
    currency_name: "Euro",
    currency_symbol: "€",
    currency_code: "EUR",
    language: "es-ES",
    timezone: "Europe/Madrid",
    flag: "🇪🇸",
  },
];
