import { addDays, isAfter, startOfDay } from "date-fns";

export const isTomorrowOrMore = (date) => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  return isAfter(date, tomorrow) || date.getTime() === tomorrow.getTime();
};

export const getUSDExchangeRate = async (date: Date) => {
  try {
    const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD
    const response = await fetch(
      `https://api.bluelytics.com.ar/v2/historical?day=${formattedDate}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }
    const data = await response.json();

    const sell = data.blue.value_sell;
    const buy = data.blue.value_buy;
    return Math.round((sell + buy) / 2); // Assuming you want the ARS rate
  } catch (error) {
    console.error("Error fetching USD exchange rate:", error);
    return null;
  }
};

export const getCurrencySign = (currency: string) => {
  switch (currency) {
    case "ars":
      return "$";
    case "usd":
      return "u$s";
    case "eur":
      return "€";
    case "clp":
      return "$";
    case "mxn":
      return "$";
    default:
      return "";
  }
};

export const groupCashflows = (data, exchange_rate) => {
  const result = [];
  const arsMap = new Map(); // key = subCategory

  // Primero, procesamos todos los ARS (y otras monedas que no son USD)
  for (const item of data) {
    const key = item.subCategory;

    if (item.currency !== "usd") {
      arsMap.set(key, item);
      result.push(item);
    }
  }

  // Luego procesamos los USD
  for (const item of data) {
    const key = item.subCategory;

    if (item.currency === "usd") {
      if (arsMap.has(key)) {
        const arsItem = arsMap.get(key);
        const amountInBaseCurrency = item.amount * exchange_rate;

        arsItem.amount += amountInBaseCurrency;
        arsItem.count += item.count;
        arsItem.usd_items = {
          ...item,
          exchange_rate,
          base_currency_amount: amountInBaseCurrency,
        };
      } else {
        // No hay equivalente en ARS, lo agregamos suelto
        result.push({ ...item });
      }
    }
  }

  return result;
};
