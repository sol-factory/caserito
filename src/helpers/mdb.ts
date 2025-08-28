import { ClientModel } from "@/schemas/client";
import { VehicleModel } from "@/schemas/vehicle";
import { cleanText } from "./text";
import {
  correctHours,
  getFullDate,
  getPeriodFilter,
  getUserDate,
  getWeekOfYear,
} from "./date";
import mongoose, { Types } from "mongoose";
import { UserPayload } from "./auth";
import {
  addDays,
  addHours,
  differenceInDays,
  differenceInSeconds,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  getISOWeek,
  startOfDay,
} from "date-fns";
import { MessageModel, WhatsappNumberModel } from "@/schemas/template";
import { SubscriptionModel } from "@/schemas/subscription";
import { QuoteModel } from "@/schemas/quote";
import { SaleModel } from "@/schemas/sale";
import { calculatePrices } from "./subscription";
import StoreModel from "@/schemas/store";
import ExchangeModel from "@/schemas/exchange";
import { isTomorrowOrMore } from "./currency";

export const addCurrencyToArray = async () => {
  const items = await QuoteModel.find({ "services.currency": null });
  let count = 0;

  for (const quote of items) {
    const storeId = quote.store_id;
    if (!storeId) continue;
    const store = await StoreModel.findById(storeId, { currency: 1 });
    if (!store || !store.currency) continue;
    let modified = false;
    if (Array.isArray(quote.services)) {
      quote.services.forEach((s) => {
        if (!s.currency) {
          s.currency = store.currency;
          modified = true;
        }
      });
    }

    if (Array.isArray(quote.discounts)) {
      quote.discounts.forEach((d) => {
        if (!d.currency) {
          d.currency = store.currency;
          modified = true;
        }
      });
    }
    if (modified) {
      await quote.save();
      count++;
    }
  }

  console.log(`✅ ${count} documentos de ventas actualizados.`);
};

export function getFullDateFilter(
  date: Date,
  type: "week" | "month",
  fieldName = "full_day"
) {
  const year = date.getUTCFullYear();

  if (type === "week") {
    const week = getWeekOfYear(date);
    return { [`${fieldName}.year`]: year, [`${fieldName}.week`]: week };
  }

  if (type === "month") {
    const month = date.getUTCMonth() + 1;
    return { [`${fieldName}.year`]: year, [`${fieldName}.month`]: month };
  }

  throw new Error("Tipo inválido: debe ser 'week' o 'month'");
}

export const getAquappExchangeRate = async (date: Date) => {
  let finalDate = typeof date === "string" ? new Date(date) : date;

  if (isTomorrowOrMore(finalDate)) {
    finalDate = new Date();
  }
  let exchange = await ExchangeModel.findOne({
    "full_day.day": finalDate.getDate(),
    "full_day.month": finalDate.getMonth() + 1,
    "full_day.year": finalDate.getFullYear(),
  });

  // Si no hay un exchange para la fecha, buscamos el anterior
  // Por si cargan venta antes de que corra el cronjob
  if (!exchange?.rate) {
    finalDate = addDays(finalDate, -1);
    exchange = await ExchangeModel.findOne({
      "full_day.day": finalDate.getDate(),
      "full_day.month": finalDate.getMonth() + 1,
      "full_day.year": finalDate.getFullYear(),
    });
  }

  return exchange.rate;
};

export const getAvgExchangeRateForPeriod = async (
  period = "this_month",
  customMatch = null
) => {
  const match = customMatch ?? getPeriodFilter(period, "full_day");
  const result = await ExchangeModel.aggregate([
    { $match: { ...match, rate: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        avg_rate: { $avg: "$rate" },
      },
    },
  ]);
  let rate = result?.[0]?.avg_rate
    ? Math.round(+result[0].avg_rate.toFixed(2))
    : 0;
  if (rate === 0) {
    rate = await getAquappExchangeRate(new Date());
  }

  return rate;
};

export const getSaleMetadata = async (sale, user) => {
  const date = getUserDate(user, sale.date);

  const pick_up_date = sale.pick_up_date
    ? getUserDate(user, sale.pick_up_date)
    : undefined;

  return {
    date,
    full_date: getFullDate(date),
    pick_up_date,
    full_pick_up_date: pick_up_date ? getFullDate(pick_up_date) : null,
  };
};
export const getQuoteMetadata = async (quote, user) => {
  const client = await ClientModel.findById(quote.client._id);
  const vehicle = await VehicleModel.findById(quote.vehicle._id);
  const date = getUserDate(user, new Date());

  const clientBasicInfo = client.getBasicInfo();
  const vehicleBasicInfo = vehicle.getBasicInfo();

  return {
    date,
    full_date: getFullDate(date),
    client: clientBasicInfo,
    vehicle: vehicleBasicInfo,
    search_field: cleanText(`${client.search_field} ${vehicle.search_field}`),
  };
};

export const toObjectId = (_id: string) => {
  return new Types.ObjectId(_id);
};

export const startTransaction = async () => {
  const session = await mongoose.startSession(); // Inicia una sesión
  session.startTransaction(); // Inicia la transacción

  return session;
};
export const commitTransaction = async (session) => {
  await session.commitTransaction();
  session.endSession();
};
export const abortTransaction = async (session) => {
  await session.abortTransaction();
  session.endSession();
};

export const getWorkplace = (
  user: UserPayload,
  justCompany = false,
  storeIsArray = false
) => {
  if (justCompany) {
    return { company_id: toObjectId(user?.company?._id) };
  } else {
    return {
      company_id: toObjectId(user?.company?._id),
      [storeIsArray ? "stores._id" : "store_id"]: toObjectId(user?.store?._id),
    };
  }
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mergeCashflowsAndSales = (
  cashflows,
  sales,
  group: "day" | "week" | "month" = "day",
  range // interval de fechas { start: Date, end: Date }
) => {
  const merged = {} as Record<string, any>;

  if (group === "day") {
    // Generar todos los días en el rango y crear entradas vacías
    const days = eachDayOfInterval(range);

    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd"); // clave con formato ISO día
      d.setHours(10);
      merged[key] = {
        date: d,
        day: d.getDate(),
        month: d.getMonth() + 1,
        year: d.getFullYear(),
        gathered: 0,
        spent: 0,
        sold: 0,
        extras: 0,
        discounted: 0,
        count: 0,
        gatherings: 0,
        spents: 0,
      };
    });
  } else if (group === "week") {
    // Similar para semanas, cada semana empieza el lunes (weekStartsOn: 1)
    const weeks = eachWeekOfInterval(range, { weekStartsOn: 1 });
    weeks.forEach((d) => {
      // d es el lunes de cada semana
      const year = d.getFullYear();
      d.setHours(10);
      // Obtener número de semana ISO 8601 (opcional, podés usar una función para calcularla)
      const weekNumber = getISOWeek(d); // Si usás date-fns: import { getISOWeek }
      const key = `${year}-W${String(weekNumber).padStart(2, "0")}`;

      merged[key] = {
        date: d,
        week: weekNumber,
        year,
        gathered: 0,
        spent: 0,
        sold: 0,
        extras: 0,
        discounted: 0,
        count: 0,
        gatherings: 0,
        spents: 0,
      };
    });
  }

  // Función helper para normalizar la clave según grupo
  const getKey = (year, month, day, week) => {
    if (group === "day") {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    } else {
      return `${year}-W${String(week).padStart(2, "0")}`;
    }
  };

  // Sumar datos de cashflows
  cashflows.forEach((c) => {
    const key = getKey(c.year, c.month, c.day, c.week);
    if (!merged[key]) {
      // Si la clave no existía, crearla (por si no estaba en el rango)
      merged[key] = {
        date: c.date instanceof Date ? c.date : new Date(c.date),
        day: c.day,
        month: c.month,
        year: c.year,
        gathered: 0,
        spent: 0,
        sold: 0,
        extras: 0,
        discounted: 0,
        count: 0,
        gatherings: 0,
        spents: 0,
      };
    }
    merged[key].gathered += c.gathered ?? 0;
    merged[key].spent += c.spent ?? 0;
    merged[key].gatherings += c.gatherings ?? 0;
    merged[key].spents += c.spents ?? 0;
  });

  // Sumar datos de sales
  sales.forEach((s) => {
    const key = getKey(s.year, s.month, s.day, s.week);
    if (!merged[key]) {
      merged[key] = {
        date: s.date instanceof Date ? s.date : new Date(s.date),
        day: s.day,
        month: s.month,
        year: s.year,
        gathered: 0,
        spent: 0,
        sold: 0,
        extras: 0,
        discounted: 0,
        count: 0,
        gatherings: 0,
        spents: 0,
      };
    }
    merged[key].sold += s.sold ?? 0;
    merged[key].extras += s.extras ?? 0;
    merged[key].discounted += s.discounted ?? 0;
    merged[key].count += s.count ?? 0;
  });

  // Ordenar y devolver
  return Object.values(merged).sort((a, b) => {
    if (group === "day") {
      return a.year - b.year || a.month - b.month || a.day - b.day;
    } else {
      return a.year - b.year || a.week - b.week;
    }
  });
};

export const createQuoteIdentifier = (quote) => {
  return `${format(quote.date, "ddMMyy")}-${quote._id.toString().slice(-6).toUpperCase()}`;
};

export const sendWspMessage = async ({ data, user, pdfBuffer }) => {
  const {
    template_id,
    template_name,
    message,
    wspNumberId,
    phoneNumber,
    sale_id,
    client_id,
    quote_id,
    formData,
    pdfFileName,
    notInRAMTimeout,
  } = data;

  const alreadySent = sale_id
    ? await MessageModel.findOne({ sale_id, template_id }, "sender_email")
    : false;

  if (!!alreadySent) {
    return {
      ok: false,
      message:
        "Este mensaje ya fue enviado por " +
        alreadySent.sender_email +
        " para esta venta",
    };
  }

  const automaticSending = user.email === "info@aquapp.lat";

  const wspNumber = await WhatsappNumberModel.findById(wspNumberId);
  const activeSub = await SubscriptionModel.findOne(
    {
      store_id: user.store._id,
      active: true,
    },
    "messages quotes subscription_id automatic"
  );

  let minutesDifInSeconds, hourDifInSeconds, dayDifInSeconds, monthDifInSeconds;
  const now = new Date();

  if (activeSub) {
    const { messages } = activeSub;
    const {
      limits: { minute, hour, day, month },
    } = messages;
    minutesDifInSeconds = differenceInSeconds(now, minute.start_date);
    hourDifInSeconds = differenceInSeconds(now, hour.start_date);
    dayDifInSeconds = differenceInSeconds(now, day.start_date);
    monthDifInSeconds = differenceInSeconds(now, month.start_date);

    if (
      minute.count >= minute.max &&
      minutesDifInSeconds <= 60 &&
      !automaticSending
    ) {
      return {
        ok: false,
        message: `Alcanzaste el límite de ${minute.max} mensajes por minuto, espera ${60 - minutesDifInSeconds} segundos para volver a enviar, o envíalos con el modo Manual ✋🏼.`,
      };
    }
    if (
      hour.count >= hour.max &&
      hourDifInSeconds <= 3600 &&
      !automaticSending
    ) {
      return {
        ok: false,
        message: `Alcanzaste el límite de ${hour.max} mensajes por hora, espera ${Math.round((3600 - hourDifInSeconds) / 60)} minutos para volver a enviar, o envíalos con el modo Manual ✋🏼`,
      };
    }
    if (day.count >= day.max && dayDifInSeconds <= 86400 && !automaticSending) {
      return {
        ok: false,
        message: `Alcanzaste el límite de ${day.max} mensajes por día, espera ${Math.round((86400 - dayDifInSeconds) / 60 / 60)} horas para volver a enviar, o envíalos con el modo Manual ✋🏼`,
      };
    }
    if (month.count >= month.max && monthDifInSeconds <= 2592000) {
      // Si no es envío automático, le aviso que alcanzó el límite,
      // sino se lo aumento en 25
      if (!automaticSending) {
        return {
          ok: false,
          message: `Alcanzaste el límite de ${month.max} mensajes por mes, espera ${Math.round((2592000 - dayDifInSeconds) / 60 / 60 / 24)} días para volver a enviar, o envíalos con el modo Manual ✋🏼`,
        };
      } else {
        if (activeSub.automatic) {
          let method = "PUT";

          const newWspMonthlyLimit = activeSub.messages.limits.month.max + 25;
          const store = await StoreModel.findById(
            activeSub.store_id,
            "createdAt"
          );
          const { whatsapp } = calculatePrices({
            filesQty: activeSub.files?.limit?.max || 0,
            whatsappQty: newWspMonthlyLimit,
            quotesQty: activeSub.quotes.limit.max,
            country: "AR",
            createdAt: store.createdAt,
            subscription: {
              messages: activeSub.messages,
              quotes: activeSub.quotes,
            },
          });

          const transaction_amount =
            activeSub.amount +
            whatsapp.total +
            activeSub.quotes.amount +
            activeSub.files.amount;
          const reason = `1 sucursal Aquapp (${whatsapp.quantity} mensajes, ${activeSub.quotes.limit.max} PDFs, ${activeSub.files.limit.max} archivos)`;

          const auto_recurring = {
            frequency: 1,
            frequency_type: "months",
            transaction_amount,
            currency_id: "ARS",
          };

          let url = "https://api.mercadopago.com/preapproval";

          url += `/${activeSub.subscription_id}`;
          method = "PUT";

          const body = { reason, auto_recurring };

          const res = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(body),
          });
          if (res.status === 200) {
            await SubscriptionModel.findByIdAndUpdate(activeSub._id, {
              $set: { "messages.limits.month.max": newWspMonthlyLimit },
            });
          }
        } else {
          await StoreModel.findOneAndUpdate(
            { store_id: user.store._id },
            { $set: { allow_automatic_reminders: false } }
          );
          await SaleModel.updateMany(
            { store_id: user.store._id, date: { $gt: new Date() } },
            { $set: { should_be_reminded: false } }
          );
        }
      }
    }
  }

  const res = await fetch(
    `${process.env.NEXT_IO_SERVER}/whatsapp/send-message`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wspNumberId,
        message,
        phoneNumber,
        pdfBuffer,
        pdfFileName,
        notInRAMTimeout,
      }),
    }
  );
  const result = await res.json();

  if (result.ok) {
    const messageBody = {
      company_id: user.company._id,
      store_id: user.store._id,
      sale_id,
      client_id,
      template_id,
      template_name,
      whatsapp_number: wspNumber.number,
      sender_email: user.email,
      message_key: result.data.message_key,
    };
    const createdMessage = await MessageModel.create(messageBody);
    const msgBodyForClientAndSales = {
      _id: createdMessage._id,
      message_key: result.data.message_key,
      sender_email: user.email,
      template_id,
      template_name: template_name,
      sent_at: result.data.sent_at,
    };

    if (!!formData) {
      await QuoteModel.findByIdAndUpdate(quote_id, {
        $set: { sent: true, sent_at: result.data.sent_at },
      });
    }

    if (activeSub) {
      const setQuery = {};
      const incQuery = {};
      if (minutesDifInSeconds >= 60) {
        setQuery["messages.limits.minute.start_date"] = now;
        setQuery["messages.limits.minute.count"] = 1;
      } else {
        incQuery["messages.limits.minute.count"] = 1;
      }
      if (hourDifInSeconds >= 3600) {
        setQuery["messages.limits.hour.start_date"] = new Date();
        setQuery["messages.limits.hour.count"] = 1;
      } else {
        incQuery["messages.limits.hour.count"] = 1;
      }
      if (dayDifInSeconds >= 86400) {
        setQuery["messages.limits.day.start_date"] = new Date();
        setQuery["messages.limits.day.count"] = 1;
      } else {
        incQuery["messages.limits.day.count"] = 1;
      }
      if (monthDifInSeconds >= 2592000) {
        setQuery["messages.limits.month.start_date"] = new Date();
        setQuery["messages.limits.month.count"] = 1;
      } else {
        incQuery["messages.limits.month.count"] = 1;
      }

      await SubscriptionModel.findByIdAndUpdate(activeSub._id, {
        $inc: incQuery,
        $set: setQuery,
      });
    }
    if (sale_id) {
      const saleQuery = {
        $addToSet: {
          messages: msgBodyForClientAndSales,
        },
      };
      if (template_name === "Recordatorio turno") {
        saleQuery["$set"] = {
          reminded: true,
          reminded_at: result.data.sent_at,
        };
      }
      await SaleModel.findByIdAndUpdate(sale_id, saleQuery);
    }

    if (client_id) {
      await ClientModel.updateOne(
        { _id: client_id },
        {
          $push: {
            last_messages: {
              $each: [msgBodyForClientAndSales], // Agrega el nuevo mensaje
              $slice: -3, // Mantiene solo los últimos 3
            },
          },
        }
      );
    }
  }

  return result;
};

export const groupCompaniesByInactivity = (companies, maxDays = 20) => {
  const today = startOfDay(new Date());
  const stats = {};

  for (const company of companies) {
    const lastUpdate = startOfDay(new Date(company.updatedAt));
    const daysAgo = differenceInDays(today, lastUpdate);

    if (!stats[daysAgo]) {
      stats[daysAgo] = {
        days: daysAgo,
        count: 0,
        percentage: 0,
        companies: [],
      };
    }

    stats[daysAgo].count++;
    stats[daysAgo].companies.push(company);
  }

  const total = companies.length;
  const result = Object.values(stats)
    .sort((a: any, b: any) => a.days - b.days)
    .map((entry: any) => ({
      ...entry,
      percentage: total ? +((entry.count * 100) / total).toFixed(2) : 0,
    }))
    .filter((entry) => entry.count > 0);

  // Agregar acumulado
  let cumulative = 0;
  for (const entry of result) {
    cumulative += entry.percentage;
    entry.cumulativePercentage = +cumulative.toFixed(2);
  }

  return result;
};

export const getSalesReports = (sales, workers, exchange_rate) => {
  const toProperCase = (str) =>
    str.replace(
      /\w\S*/g,
      (txt) => txt[0].toUpperCase() + txt.slice(1).toLowerCase()
    );

  const reports = {
    salesByBrand: [],
    salesByService: [],
    salesByVehicleKind: [],
    salesByColor: [],
    debtSummary: initSummary(),
    salesSummary: initSummary(),
    discountsSummary: initSummary(),
    tipsSummary: initSummary(),
    salesByClientType: [],
    salaries: [],
  };

  const brandMap = new Map();
  const serviceMap = new Map();
  const kindMap = new Map();
  const clientTypeMap = new Map([
    ["person", { type: "person", name: "Ventas a personas", ...initSummary() }],
    [
      "company",
      { type: "company", name: "Ventas a empresas", ...initSummary() },
    ],
  ]);

  const salaryMap = new Map();

  for (const sale of sales) {
    const grossAmount = sale.amount || 0;
    const grossUsd = sale.usd_amount || 0;
    const discount = sale.discounts_amount || 0;
    const usdDiscount = sale.usd_discounts_amount || 0;

    const netAmount = grossAmount - discount;
    const netUsd = grossUsd - usdDiscount;

    const usdConverted = netUsd * exchange_rate;
    const amountConverted = netAmount / exchange_rate;

    const grossCount = netAmount > 0 ? 1 : 0;
    const grossUsdCount = netUsd > 0 ? 1 : 0;

    // === Sales Summary ===
    addToSummary(reports.salesSummary, {
      amount: grossAmount,
      amount_converted: grossAmount / exchange_rate,
      usd_amount: grossUsd,
      usd_amount_converted: grossUsd * exchange_rate,
      count: grossAmount > 0 ? 1 : 0,
      usd_count: grossUsd > 0 ? 1 : 0,
    });

    // === Debt Summary ===
    const gathered = sale.gathered_amount || 0;
    const usdGathered = sale.usd_gathered_amount || 0;
    const debtAmount = Math.max(netAmount - gathered, 0);
    const debtUsd = Math.max(netUsd - usdGathered, 0);
    const debtUsdConverted = debtUsd * exchange_rate;
    const debtAmountConverted = debtAmount / exchange_rate;

    addToSummary(reports.debtSummary, {
      amount: debtAmount,
      amount_converted: debtAmountConverted,
      usd_amount: debtUsd,
      usd_amount_converted: debtUsdConverted,
      count: debtAmount > 0 ? 1 : 0,
      usd_count: debtUsd > 0 ? 1 : 0,
    });

    // === Discounts Summary ===
    if (sale.discounts?.length) {
      addToSummary(reports.discountsSummary, {
        amount: discount,
        amount_converted: discount / exchange_rate,
        usd_amount: usdDiscount,
        usd_amount_converted: usdDiscount * exchange_rate,
        count: discount > 0 ? 1 : 0,
        usd_count: usdDiscount > 0 ? 1 : 0,
      });
    }

    // === Tips Summary ===
    const arsTip = Math.max((sale.gathered_amount || 0) - netAmount, 0);
    const usdTip = Math.max((sale.usd_gathered_amount || 0) - netUsd, 0);
    if (arsTip > 0 || usdTip > 0) {
      addToSummary(reports.tipsSummary, {
        amount: arsTip,
        amount_converted: arsTip / exchange_rate,
        usd_amount: usdTip,
        usd_amount_converted: usdTip * exchange_rate,
        count: arsTip > 0 ? 1 : 0,
        usd_count: usdTip > 0 ? 1 : 0,
      });
    }

    // === Brand ===
    const brand = sale.vehicle?.brand || "Sin marca";
    const brandEntry = brandMap.get(brand) || {
      _id: brand,
      name: brand,
      ...initSummary(),
    };
    addToSummary(brandEntry, {
      amount: netAmount,
      amount_converted: amountConverted,
      usd_amount: netUsd,
      usd_amount_converted: usdConverted,
      count: grossCount,
      usd_count: grossUsdCount,
    });
    brandMap.set(brand, brandEntry);

    // === Vehicle Kind ===
    const kind = sale.vehicle?.kind || "Sin tipo";
    const kind_id = sale.vehicle?.kind_classification_id || "";
    const kindEntry = kindMap.get(kind) || {
      _id: kind,
      name: kind,
      kind_classification_id: kind_id,
      blob_path: `vehicles/${kind_id}.png`,
      ...initSummary(),
    };
    addToSummary(kindEntry, {
      amount: netAmount,
      amount_converted: amountConverted,
      usd_amount: netUsd,
      usd_amount_converted: usdConverted,
      count: grossCount,
      usd_count: grossUsdCount,
    });
    kindMap.set(kind, kindEntry);

    // === Client Type ===
    const type = sale.client?.kind || "person";
    const clientEntry = clientTypeMap.get(type);
    if (clientEntry) {
      addToSummary(clientEntry, {
        amount: netAmount,
        amount_converted: amountConverted,
        usd_amount: netUsd,
        usd_amount_converted: usdConverted,
        count: grossCount,
        usd_count: grossUsdCount,
      });
    }

    // === Services ===
    for (const service of sale.services || []) {
      const id = service._id;
      const isUSD = service.currency === "usd";
      const quantity = service.quantity || 1;
      const rawValue = (service.price || service.value || 0) * quantity;
      const value = isUSD ? rawValue * exchange_rate : rawValue;

      const entry = serviceMap.get(id) || {
        _id: id,
        name: service.name,
        detail: service.detail,
        currency: service.currency || null,
        ...initSummary(),
      };
      if (isUSD) {
        entry.usd_amount += rawValue;
        entry.usd_amount_converted += value;
        entry.usd_count += 1;
      } else {
        entry.amount += rawValue;
        entry.amount_converted += rawValue / exchange_rate;
        entry.count += 1;
      }
      entry.total_count += 1;
      entry.total_amount = entry.amount + entry.usd_amount_converted;
      entry.usd_total_amount = entry.usd_amount + entry.amount_converted;
      serviceMap.set(id, entry);
    }

    // === Salaries ===
    for (const worker of sale.workers || []) {
      const id = worker._id;
      if (!id) continue;

      const percent = worker.percentage_to_pay || 0;
      const value = Math.round((netAmount * percent) / 100);
      const usd = Math.round((netUsd * percent) / 100);
      const usdConverted = usd * exchange_rate;
      const amountConverted = value / exchange_rate;

      const entry = salaryMap.get(id) || {
        _id: id,
        name: worker.member_name || worker.member_email || "Sin nombre",
        ...initSummary(),
      };
      addToSummary(entry, {
        amount: value,
        amount_converted: amountConverted,
        usd_amount: usd,
        usd_amount_converted: usdConverted,
        count: value > 0 ? 1 : 0,
        usd_count: usd > 0 ? 1 : 0,
      });
      salaryMap.set(id, entry);
    }
  }

  // === Salaries Output ===
  reports.salaries = workers.map((w) => {
    const id = w._id.toString();
    const salaryData = salaryMap.get(id);
    const name = w.user?.firstname
      ? `${w.user.firstname} ${w.user.lastname || ""}`.trim()
      : w.user?.email || "Sin nombre";

    return {
      _id: id,
      name: toProperCase(name),
      payment_scheme: w.payment_scheme?.toObject?.() || w.payment_scheme,
      pay_cycle:
        w.payment_scheme?.pay_cycle?.toObject?.() ||
        w.payment_scheme?.pay_cycle,
      detail: w.payment_scheme?.pay_cycle?.name || "",
      ...(salaryData || initSummary()),
    };
  });

  // === Final Sort ===
  reports.salesByBrand = Array.from(brandMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );
  reports.salesByService = Array.from(serviceMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );
  reports.salesByVehicleKind = Array.from(kindMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );
  reports.salesByClientType = Array.from(clientTypeMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );
  reports.salaries.sort((a, b) => b.total_amount - a.total_amount);

  return reports;
};

export const getCashflowsReports = (cashflows, exchange_rate) => {
  const reports = {
    cashflowsBySubCategory: [],
    cashflowsByWallet: [],
  };

  const subCategoryMap = new Map();
  const walletMap = new Map();

  for (const item of cashflows) {
    const { kind, category, sub_category, amount, wallet, usd_items } = item;

    const coef = category.name === "VENTA" ? 1 : -1;
    const arsAmount = wallet.currency !== "usd" ? amount * coef || 0 : 0;
    const usdAmount = wallet.currency === "usd" ? amount * coef || 0 : 0;
    const arsCount = wallet.currency !== "usd" ? 1 || 0 : 0;
    const usdCount = wallet.currency === "usd" ? 1 || 0 : 0;

    const usdConverted = usdAmount * exchange_rate;
    const amountConverted = arsAmount / exchange_rate;

    // === SUBCATEGORY REPORT ===
    const id = `${kind}-${category.name}-${sub_category.name}`;
    const subCategoryEntry = subCategoryMap.get(id) || {
      kind,
      category,
      sub_category,
      ...initSummary(),
    };
    addToSummary(subCategoryEntry, {
      id,
      amount: arsAmount,
      usd_amount: usdAmount,
      amount_converted: amountConverted,
      usd_amount_converted: usdConverted,
      count: arsCount,
      usd_count: usdCount,
    });

    if (usd_items) {
      const usdConverted = usd_items.amount * exchange_rate;
      const amountConverted = usd_items.base_currency_amount / exchange_rate;

      addToSummary(subCategoryEntry, {
        id,
        amount: usd_items.base_currency_amount,
        usd_amount: usd_items.amount,
        amount_converted: amountConverted,
        usd_amount_converted: usdConverted,
        count: 0,
        usd_count: usd_items.count || 0,
      });
    }

    subCategoryMap.set(id, subCategoryEntry);

    // === WALLET REPORT ===
    if (wallet?._id) {
      const walletId = wallet._id;
      const walletEntry = walletMap.get(walletId) || {
        _id: walletId,
        name: wallet.name,
        url: wallet.logo_url,
        currency: wallet.currency,
        ...initSummary(),
      };

      addToSummary(walletEntry, {
        amount: arsAmount,
        usd_amount: usdAmount,
        amount_converted: amountConverted,
        usd_amount_converted: usdConverted,
        count: arsCount,
        usd_count: usdCount,
      });

      if (usd_items) {
        const usdConverted = usd_items.amount * exchange_rate;
        const amountConverted = usd_items.base_currency_amount / exchange_rate;

        addToSummary(walletEntry, {
          id: walletId,
          amount: usd_items.base_currency_amount,
          usd_amount: usd_items.amount,
          amount_converted: amountConverted,
          usd_amount_converted: usdConverted,
          count: 0,
          usd_count: usd_items.count || 0,
        });
      }

      walletMap.set(walletId, walletEntry);
    }
  }

  reports.cashflowsBySubCategory = Array.from(subCategoryMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );
  reports.cashflowsByWallet = Array.from(walletMap.values()).sort(
    (a, b) => b.total_amount - a.total_amount
  );

  return reports;
};

export function groupReportsByCategory(reports) {
  const map = new Map<string, any>();

  for (const r of reports) {
    const key = r.category?._id ?? r.category?.name ?? "unknown";

    const acc = map.get(key) || {
      category: r.category,
      // totales por categoría
      count: 0,
      amount: 0,
      amount_converted: 0,
      total_count: 0,
      total_amount: 0,
      // para ver el detalle de subcategorías (opcional)
      subcategories: [] as any[],
    };

    acc.count += r.count ?? 0;
    acc.amount += r.amount ?? 0;
    acc.amount_converted += r.amount_converted ?? 0;
    acc.total_count += r.total_count ?? 0;
    acc.total_amount += r.total_amount ?? 0;

    acc.subcategories.push({
      _id: r.sub_category?._id,
      name: r.sub_category?.name,
      count: r.count ?? 0,
      amount: r.amount ?? 0,
      amount_converted: r.amount_converted ?? 0,
      total_count: r.total_count ?? 0,
      total_amount: r.total_amount ?? 0,
    });

    map.set(key, acc);
  }

  return Array.from(map.values()).sort(
    (a, b) => (b.total_amount ?? 0) - (a.total_amount ?? 0)
  );
}

export function initSummary() {
  return {
    count: 0,
    amount: 0,
    amount_converted: 0,
    usd_count: 0,
    usd_amount: 0,
    usd_amount_converted: 0,
    total_count: 0,
    total_amount: 0,
    usd_total_amount: 0,
  };
}

export function addToSummary(summary, delta) {
  if (!summary || !delta) return; // 👈 esto previene el error
  const someAmount =
    Math.abs(delta.amount) > 0 || Math.abs(delta.usd_amount) > 0;

  summary.id = summary.id || delta._id || "default"; // Asegura que summary tenga un id
  summary.count += delta.count || 0;
  summary.amount += delta.amount || 0;
  summary.amount_converted += delta.amount_converted || 0;
  summary.usd_count += delta.usd_count || 0;
  summary.usd_amount += delta.usd_amount || 0;
  summary.usd_amount_converted += delta.usd_amount_converted || 0;
  summary.total_count += someAmount ? 1 : 0;
  summary.total_amount = summary.amount + summary.usd_amount_converted;
  summary.usd_total_amount = summary.usd_amount + summary.amount_converted;
}

export const getExchangePeriodMatch = (
  period: string,
  today = new Date()
): Record<string, any> => {
  const fullDate = getFullDate(today);

  if (period.startsWith("custom_")) {
    const [_, yearStr, monthStr] =
      period.match(/^custom_(\d{4})-(\d{2})$/) || [];
    if (yearStr && monthStr) {
      return {
        "full_day.year": parseInt(yearStr),
        "full_day.month": parseInt(monthStr),
      };
    }
  }

  switch (period) {
    case "this_week":
      return {
        "full_day.year": fullDate.year,
        "full_day.week": fullDate.week,
      };
    case "last_week":
      return {
        "full_day.year": fullDate.year - (fullDate.week === 1 ? 1 : 0),
        "full_day.week": fullDate.week === 1 ? 52 : fullDate.week - 1,
      };
    case "this_month":
      return {
        "full_day.year": fullDate.year,
        "full_day.month": fullDate.month,
      };
    case "last_month":
      const month = fullDate.month === 1 ? 12 : fullDate.month - 1;
      const year = fullDate.month === 1 ? fullDate.year - 1 : fullDate.year;
      return { "full_day.year": year, "full_day.month": month };
    case "this_year":
      return { "full_day.year": fullDate.year };
    case "last_2_years":
      return { "full_day.year": { $gte: fullDate.year - 1 } };
    case "last_3_years":
      return { "full_day.year": { $gte: fullDate.year - 2 } };
    case "last_4_years":
      return { "full_day.year": { $gte: fullDate.year - 3 } };
    case "last_5_years":
      return { "full_day.year": { $gte: fullDate.year - 4 } };
    default:
      return {}; // sin filtro
  }
};

const getGroupStageFromPeriod = (
  period: string,
  fullDateField = "full_date"
) => {
  let groupStage: any = {};

  if (
    ["this_week", "last_week", "this_month", "last_month"].includes(period) ||
    period.startsWith("custom_")
  ) {
    groupStage = {
      year: `$${fullDateField}.year`,
      month: `$${fullDateField}.month`,
      day: `$${fullDateField}.day`,
    };
  } else if (
    [
      "this_year",
      "last_2_years",
      "last_3_years",
      "last_4_years",
      "last_5_years",
    ].includes(period)
  ) {
    groupStage = {
      year: `$${fullDateField}.year`,
      month: `$${fullDateField}.month`,
    };
  } else {
    groupStage = {
      year: `$${fullDateField}.year`,
    };
  }
  return groupStage;
};

export const getExchangeAveragesAggregation = (period: string) => {
  const matchStage = getExchangePeriodMatch(period);

  const groupStage = getGroupStageFromPeriod(period, "full_day");

  return [
    {
      $match: {
        currency: "usd",
        to_currency: "ars",
        ...matchStage,
      },
    },
    {
      $group: {
        _id: groupStage,
        avg_rate: {
          $avg: {
            $cond: [
              { $gt: ["$rate", 0] }, // solo si rate > 0
              "$rate",
              null, // ignora los 0
            ],
          },
        },
        min_date: {
          $min: {
            $dateFromParts: {
              year: "$full_day.year",
              month: "$full_day.month",
              day: "$full_day.day",
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$min_date",
        avg_rate: "$avg_rate",
      },
    },
    { $sort: { date: 1 } },
  ];
};

export const mergeSalesEvolutionWithRates = (
  salesEvolution = [],
  aquappRates = [],
  avg_aquapp_rate
) => {
  const mergedMap = new Map();
  // Agrupamos por clave única store_id + date
  for (const sale of salesEvolution) {
    const key = `${sale.store_id}_${toLocalISODate(sale.date)}`;

    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...sale });
    } else {
      const existing = mergedMap.get(key);
      mergedMap.set(key, {
        ...existing,
        amount: (existing.amount || 0) + (sale.amount || 0),
        usd_amount: (existing.usd_amount || 0) + (sale.usd_amount || 0),
        count: (existing.count || 0) + (sale.count || 0),
        usd_count: (existing.usd_count || 0) + (sale.usd_count || 0),
        total_count: (existing.total_count || 0) + (sale.total_count || 0),

        gathered_amount:
          (existing.gathered_amount || 0) + (sale.gathered_amount || 0),
        usd_gathered_amount:
          (existing.usd_gathered_amount || 0) + (sale.usd_gathered_amount || 0),
        gathered_count:
          (existing.gathered_count || 0) + (sale.gathered_count || 0),
        usd_gathered_count:
          (existing.usd_gathered_count || 0) + (sale.usd_gathered_count || 0),

        discounts_amount:
          (existing.discounts_amount || 0) + (sale.discounts_amount || 0),
        usd_discounts_amount:
          (existing.usd_discounts_amount || 0) +
          (sale.usd_discounts_amount || 0),
        discounts_count:
          (existing.discounts_count || 0) + (sale.discounts_count || 0),
        usd_discounts_count:
          (existing.usd_discounts_count || 0) + (sale.usd_discounts_count || 0),

        tipAmount: (existing.tipAmount || 0) + (sale.tipAmount || 0),
        usdTipAmount: (existing.usdTipAmount || 0) + (sale.usdTipAmount || 0),
        tip_count: (existing.tip_count || 0) + (sale.tip_count || 0),
        usd_tip_count:
          (existing.usd_tip_count || 0) + (sale.usd_tip_count || 0),

        debtAmount: (existing.debtAmount || 0) + (sale.debtAmount || 0),
        debtUsd: (existing.debtUsd || 0) + (sale.debtUsd || 0),
        debt_count: (existing.debt_count || 0) + (sale.debt_count || 0),
        usd_debt_count:
          (existing.usd_debt_count || 0) + (sale.usd_debt_count || 0),
        store_id: sale.store_id,
      });
    }
  }

  // Detectamos todas las store_id presentes
  const storeIds = Array.from(new Set(salesEvolution.map((s) => s.store_id)));

  const result = [];

  for (const rate of aquappRates) {
    const dateStr = toLocalISODate(rate.date);
    const avg_rate = avg_aquapp_rate || rate.avg_rate || 1;

    for (const store_id of storeIds) {
      const key = `${store_id}_${dateStr}`;
      const sale = mergedMap.get(key) || {
        store_id,
        amount: 0,
        usd_amount: 0,
        count: 0,
        usd_count: 0,
        total_count: 0,
        gathered_amount: 0,
        usd_gathered_amount: 0,
        gathered_count: 0,
        usd_gathered_count: 0,
        discounts_amount: 0,
        usd_discounts_amount: 0,
        discounts_count: 0,
        usd_discounts_count: 0,
        tipAmount: 0,
        usdTipAmount: 0,
        tip_count: 0,
        usd_tip_count: 0,
        debtAmount: 0,
        debtUsd: 0,
        debt_count: 0,
        usd_debt_count: 0,
      };

      result.push({
        ...sale,
        date: correctHours(addHours(new Date(rate.date), 5)),
        avg_rate,
        amount_converted: sale.amount / avg_rate,
        usd_amount_converted: sale.usd_amount * avg_rate,
        total_amount: sale.amount + sale.usd_amount * avg_rate,
        usd_total_amount: sale.usd_amount + sale.amount / avg_rate,
      });
    }
  }

  // Ordenamos por fecha ascendente
  result.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return result;
};

export const getCashflowsEvolutionAggregation = (period: string) => {
  let groupStage = getGroupStageFromPeriod(period);

  groupStage = {
    ...groupStage,
    store_id: "$store_id",
  };

  return [
    {
      $group: {
        _id: {
          ...groupStage,
          kind: "$kind",
          category: "$category.name",
          sub_category: "$sub_category.name",
        },
        amount: {
          $sum: {
            $cond: [
              { $ne: ["$wallet.currency", "usd"] },
              { $ifNull: ["$amount", 0] },
              0,
            ],
          },
        },
        usd_amount: {
          $sum: {
            $cond: [
              { $eq: ["$wallet.currency", "usd"] },
              { $ifNull: ["$amount", 0] },
              0,
            ],
          },
        },
        count: {
          $sum: { $cond: [{ $ne: ["$wallet.currency", "usd"] }, 1, 0] },
        },
        usd_count: {
          $sum: { $cond: [{ $eq: ["$wallet.currency", "usd"] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: { $ifNull: ["$_id.month", 1] },
            day: { $ifNull: ["$_id.day", 1] },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: 1,
        kind: "$_id.kind",
        category: { name: "$_id.category" },
        sub_category: { name: "$_id.sub_category" },
        count: 1,
        amount: 1,
        usd_count: 1,
        usd_amount: 1,
        total_count: {
          $add: ["$count", "$usd_count"],
        },
      },
    },
    {
      $sort: {
        date: 1,
        kind: 1,
        "category.name": 1,
        "sub_category.name": 1,
      },
    },
  ];
};

export const getSalesSummary = (period: string) => {
  let groupStage = getGroupStageFromPeriod(period);

  groupStage = {
    ...groupStage,
    store_id: "$store_id",
  };

  return [
    {
      $group: {
        _id: {
          kind: "$kind",
          category: "$category.name",
          sub_category: "$sub_category.name",
        },
        amount: {
          $sum: "$amount",
        },
        count: {
          $sum: { $cond: [{ $ne: ["$wallet.currency", "usd"] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        date: {
          $dateFromParts: {
            year: "$_id.year",
            month: { $ifNull: ["$_id.month", 1] },
            day: { $ifNull: ["$_id.day", 1] },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        date: 1,
        kind: "$_id.kind",
        category: { name: "$_id.category" },
        sub_category: { name: "$_id.sub_category" },
        count: 1,
        amount: 1,
      },
    },
    {
      $sort: {
        date: 1,
        kind: 1,
        "category.name": 1,
        "sub_category.name": 1,
      },
    },
  ];
};

export const mergeCashflowsEvolutionWithRates = (
  cashflowsEvolution = [],
  aquappRates = []
) => {
  const map = new Map();
  for (const flow of cashflowsEvolution) {
    const key = toLocalISODate(new Date(flow.date));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(flow);
  }

  return aquappRates.map((rate) => {
    const key = toLocalISODate(new Date(rate.date));
    const flows = map.get(key) || [];
    const date = correctHours(addHours(new Date(rate.date), 5));
    const avg_rate = rate.avg_rate || 0;

    let total_gathered = 0;
    let usd_total_gathered = 0;
    let total_spent = 0;
    let usd_total_spent = 0;
    let total_gatherings = 0;
    let total_spents = 0;

    for (const flow of flows) {
      const coef = flow.amount > 0 ? 1 : -1;
      const converted = flow.amount * coef;
      const converted_usd = flow.usd_amount * avg_rate * coef;
      const total = converted + converted_usd;

      flow.date = date;
      flow.avg_rate = avg_rate;
      flow.amount_converted = converted;
      flow.usd_amount_converted = converted_usd;
      flow.total_amount = total;

      if (flow.amount > 0) {
        total_gathered += total;
        usd_total_gathered += flow.usd_amount;
        total_gatherings += flow.total_count;
      } else if (flow.amount < 0) {
        total_spent += total;
        usd_total_spent += flow.usd_amount;
        total_spents += flow.total_count;
      }
    }

    return {
      date,
      avg_rate,
      total_gathered,
      total_spent,
      total_gatherings,
      total_spents,
      usd_total_gathered,
      usd_total_spent,
    };
  });
};

export const getWalletsSummaryAggregation = (matchStage = {}) => {
  return [
    {
      $match: matchStage,
    },

    {
      $group: {
        _id: "$wallet._id",
        name: { $first: "$wallet.name" },
        url: { $first: "$wallet.logo_url" },
        currency: { $first: "$wallet.currency" },
        gathered: {
          $sum: {
            $cond: [{ $gt: ["$amount", 0] }, { $ifNull: ["$amount", 0] }, 0],
          },
        },
        spent: {
          $sum: {
            $cond: [
              { $lt: ["$amount", 0] },
              { $ifNull: [{ $multiply: ["$amount", -1] }, 0] },
              0,
            ],
          },
        },
        gatherings: {
          $sum: {
            $cond: [{ $gt: ["$amount", 0] }, 1, 0],
          },
        },
        spents: {
          $sum: {
            $cond: [{ $lt: ["$amount", 0] }, 1, 0],
          },
        },
      },
    },
    {
      $addFields: {
        balance: { $subtract: ["$gathered", "$spent"] },
      },
    },
    { $sort: { balance: -1 } },
  ];
};

const toLocalISODate = (date: Date) => {
  const local = correctHours(new Date(date));

  return local.toISOString().split("T")[0];
};

export const getSalesSummaryFromEvolution = (finalSalesEvolution: any[]) => {
  const summary = {
    salesSummary: {
      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,
    },
    discountsSummary: {
      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,
    },
    gatheringsSummary: {
      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,
    },
    tipsSummary: {
      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,
    },
    debtSummary: {
      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,
    },
  };
  for (const row of finalSalesEvolution) {
    const {
      amount = 0,
      usd_amount = 0,
      count = 0,
      usd_count = 0,
      total_count = 0,
      gathered_amount = 0,
      usd_gathered_amount = 0,
      gathered_count = 0,
      usd_gathered_count = 0,
      discounts_amount = 0,
      usd_discounts_amount = 0,
      discounts_count = 0,
      usd_discounts_count = 0,
      tipAmount = 0,
      usdTipAmount = 0,
      tip_count = 0,
      usd_tip_count = 0,
      debtAmount = 0,
      debtUsd = 0,
      debt_count = 0,
      usd_debt_count = 0,
      avg_rate = 1,
    } = row;

    // === Sales
    summary.salesSummary.amount += amount;
    summary.salesSummary.amount_converted += amount / avg_rate;
    summary.salesSummary.usd_amount += usd_amount;
    summary.salesSummary.usd_amount_converted += usd_amount * avg_rate;
    summary.salesSummary.count += count;
    summary.salesSummary.usd_count += usd_count;
    summary.salesSummary.total_count += total_count;
    summary.salesSummary.total_amount += amount + usd_amount * avg_rate;
    summary.salesSummary.usd_total_amount += usd_amount + amount / avg_rate;

    // === Debt
    summary.debtSummary.amount += debtAmount;
    summary.debtSummary.amount_converted += debtAmount / avg_rate;
    summary.debtSummary.usd_amount += debtUsd;
    summary.debtSummary.usd_amount_converted += debtUsd * avg_rate;
    summary.debtSummary.count += debt_count;
    summary.debtSummary.usd_count += usd_debt_count;
    summary.debtSummary.total_count += debt_count + usd_debt_count;
    summary.debtSummary.total_amount += debtAmount + debtUsd * avg_rate;
    summary.debtSummary.usd_total_amount += debtUsd + debtAmount / avg_rate;

    // === Gatherings
    summary.gatheringsSummary.amount += gathered_amount;
    summary.gatheringsSummary.amount_converted += gathered_amount / avg_rate;
    summary.gatheringsSummary.usd_amount += usd_gathered_amount;
    summary.gatheringsSummary.usd_amount_converted +=
      usd_gathered_amount * avg_rate;
    summary.gatheringsSummary.count += gathered_count;
    summary.gatheringsSummary.usd_count += usd_gathered_count;
    summary.gatheringsSummary.total_count +=
      gathered_count + usd_gathered_count;
    summary.gatheringsSummary.total_amount +=
      gathered_amount + usd_gathered_amount * avg_rate;
    summary.gatheringsSummary.usd_total_amount +=
      usd_gathered_amount + gathered_amount / avg_rate;

    // === Discounts
    summary.discountsSummary.amount += discounts_amount;
    summary.discountsSummary.amount_converted += discounts_amount / avg_rate;
    summary.discountsSummary.usd_amount += usd_discounts_amount;
    summary.discountsSummary.usd_amount_converted +=
      usd_discounts_amount * avg_rate;
    summary.discountsSummary.count += discounts_count;
    summary.discountsSummary.usd_count += usd_discounts_count;
    summary.discountsSummary.total_count +=
      discounts_count + usd_discounts_count;
    summary.discountsSummary.total_amount +=
      discounts_amount + usd_discounts_amount * avg_rate;
    summary.discountsSummary.usd_total_amount +=
      usd_discounts_amount + discounts_amount / avg_rate;

    // === Tips
    summary.tipsSummary.amount += tipAmount;
    summary.tipsSummary.amount_converted += tipAmount / avg_rate;
    summary.tipsSummary.usd_amount += usdTipAmount;
    summary.tipsSummary.usd_amount_converted += usdTipAmount * avg_rate;
    summary.tipsSummary.count += tip_count;
    summary.tipsSummary.usd_count += usd_tip_count;
    summary.tipsSummary.total_count += tip_count + usd_tip_count;
    summary.tipsSummary.total_amount += tipAmount + usdTipAmount * avg_rate;
    summary.tipsSummary.usd_total_amount += usdTipAmount + tipAmount / avg_rate;
  }

  return summary;
};

export const getCashflowsSummary = (
  cashflowsEvolution = [],
  avg_aquapp_rate = null
) => {
  const summaryMap = new Map();

  for (const flow of cashflowsEvolution) {
    const key = `${flow.category.name}-${flow.sub_category.name}`;

    const amount_converted = flow.amount;
    const usd_amount_converted = flow.usd_amount * 1;
    const total = amount_converted + usd_amount_converted;

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        category: flow.category,
        sub_category: flow.sub_category,
        amount: 0,
        amount_converted: 0,
        usd_amount: 0,
        usd_amount_converted: 0,
        count: 0,
        usd_count: 0,
        total_amount: 0,
        total_count: 0,
        total_usd_amount: 0,
        // para ponderar el avg_rate
      });
    }

    const entry = summaryMap.get(key);

    entry.amount += flow.amount;
    entry.amount_converted += amount_converted;
    entry.usd_amount += flow.usd_amount;
    entry.usd_amount_converted += usd_amount_converted;
    entry.count += flow.count;
    entry.usd_count += flow.usd_count;
    entry.total_amount += total;
    entry.total_count += flow.total_count;
    entry.total_usd_amount += flow.usd_amount;
    entry.avg_rate = 1;
    entry.id = key;
  }

  return Array.from(summaryMap.values())
    .map((item) => ({
      ...item,
      avg_rate: item.usd_amount_converted / item.usd_amount,
    }))
    .sort((a, b) => b.total_amount - a.total_amount);
};

export const getClientTypeReport = (results) => {
  const expectedTypes = ["person", "company"];

  const defaultEntry = (type) => ({
    type,
    name: type === "company" ? "Ventas a empresas" : "Ventas a personas",
    amount: 0,
    amount_converted: 0,
    usd_amount: 0,
    usd_amount_converted: 0,
    count: 0,
    usd_count: 0,
    total_count: 0,
    total_amount: 0,
    usd_total_amount: 0,
  });
  const enrichedResults = expectedTypes.map((type) => {
    return results.find((r) => r.type === type) || defaultEntry(type);
  });
  return enrichedResults;
};

export const getStoresSummaryFromEvolution = (
  finalSalesEvolution = [],
  stores = []
) => {
  const result = new Map();

  // 1. Inicializamos todas las stores con valores en 0
  for (const store of stores) {
    result.set(store._id.toString(), {
      _id: store._id,
      name: store.name || "Sin nombre",
      amount: 0,
      usd_amount: 0,
      amount_converted: 0,
      usd_amount_converted: 0,
      total_amount: 0,
      usd_total_amount: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      preText: "vendida",
    });
  }

  // 2. Sumamos los datos de evolución
  for (const row of finalSalesEvolution) {
    const {
      store_id,
      amount = 0,
      usd_amount = 0,
      discounts_amount = 0,
      usd_discounts_amount = 0,
      count = 0,
      usd_count = 0,
      avg_rate = 1,
    } = row;

    if (!store_id) continue;

    const key = store_id.toString();
    const existing = result.get(key);

    if (!existing) {
      // fallback si hay una store no listada en "stores"
      result.set(key, {
        _id: store_id,
        name: "Sin nombre",
        amount: 0,
        usd_amount: 0,
        amount_converted: 0,
        usd_amount_converted: 0,
        total_amount: 0,
        usd_total_amount: 0,
        count: 0,
        usd_count: 0,
        total_count: 0,
        preText: "vendida",
      });
    }

    const target = result.get(key);

    const netAmount = amount - discounts_amount;
    const netUsd = usd_amount - usd_discounts_amount;

    target.amount += netAmount;
    target.usd_amount += netUsd;
    target.amount_converted += netAmount / avg_rate;
    target.usd_amount_converted += netUsd * avg_rate;
    target.total_amount += netAmount + netUsd * avg_rate;
    target.usd_total_amount += netUsd + netAmount / avg_rate;

    target.count += count;
    target.usd_count += usd_count;
    target.total_count += count + usd_count;
  }

  return [...result.values()].sort((a, b) => b.total_amount - a.total_amount);
};

export const companySalesEvolutionByDate = (finalSalesEvolution = []) => {
  const byDate = new Map();

  for (const row of finalSalesEvolution) {
    const key = toLocalISODate(row.date);
    const existing = byDate.get(key) || {
      date: row.date,
      avg_rate: row.avg_rate || 1,

      amount: 0,
      amount_converted: 0,
      usd_amount: 0,
      usd_amount_converted: 0,
      count: 0,
      usd_count: 0,
      total_count: 0,
      total_amount: 0,
      usd_total_amount: 0,

      gathered_amount: 0,
      usd_gathered_amount: 0,
      gathered_count: 0,
      usd_gathered_count: 0,

      discounts_amount: 0,
      usd_discounts_amount: 0,
      discounts_count: 0,
      usd_discounts_count: 0,

      tipAmount: 0,
      usdTipAmount: 0,
      tip_count: 0,
      usd_tip_count: 0,

      debtAmount: 0,
      debtUsd: 0,
      debt_count: 0,
      usd_debt_count: 0,
    };

    for (const key of Object.keys(existing)) {
      if (key === "date" || key === "avg_rate") continue;
      existing[key] += row[key] || 0;
    }

    byDate.set(key, existing);
  }

  // Volver a calcular los campos derivados con su avg_rate
  return [...byDate.values()].map((r) => ({
    ...r,
    amount_converted: r.amount / r.avg_rate,
    usd_amount_converted: r.usd_amount * r.avg_rate,
    total_amount: r.amount + r.usd_amount * r.avg_rate,
    usd_total_amount: r.usd_amount + r.amount / r.avg_rate,
  }));
};

export const changeCompanyToUSD = async (company_id: string) => {
  const session = await startTransaction();
  try {
    // await CashflowModel.updateMany(
    //   { company_id, kind: "Ingreso" },
    //   [
    //     {
    //       $set: {
    //         cancelling: "usd",
    //         "wallet.currency": "usd",
    //         cancelling_amount: "$amount",

    //       },
    //     },
    //   ],
    //   { session }
    // );

    // await ServiceModel.updateMany(
    //   { company_id },
    //   {
    //     $set: {
    //       currency: "usd",
    //       "sales.usd_amount": "$sales.amount",
    //       "sales.usd_count": "$sales.count",
    //       "sales.amount": 0,
    //       "sales.count": 0,
    //     },
    //   },
    //   { session }
    // );
    //  await StoreModel.updateMany(
    //   { company_id },
    //   [
    //     {
    //       $set: {
    //         "sales.usd_amount": "$sales.amount",
    //         "sales.usd_count": "$sales.count",
    //         "sales.amount": 0,
    //         "sales.count": 0,
    //       },
    //     },
    //   ],
    //   { session }
    // );

    // await CashflowModel.updateMany(
    //   { company_id, kind: "Egreso" },
    //   { $set: { "wallet.currency": "usd" } },
    //   { session }
    // );
    // const update = {
    //   $set: {
    //     "discounts.$[].currency": "usd",
    //     "services.$[].currency": "usd",
    //   },
    // };

    // console.log("Updating sales...");
    // const resSales = await SaleModel.updateMany({ company_id }, update, {
    //   session,
    // });
    // await SaleModel.updateMany(
    //   { company_id: company_id },
    //   [
    //     {
    //       $set: {
    //         usd_amount: "$amount",
    //         amount: 0,
    //         usd_gathered_amount: "$gathered_amount",
    //         gathered_amount: 0,
    //       },
    //     },
    //   ],
    //   { session }
    // );
    // await ClientModel.updateMany(
    //   { company_id: company_id },
    //   [
    //     {
    //       $set: {
    //         "sales.usd_amount": "$sales.amount",
    //         "sales.amount": 0,
    //       },
    //     },
    //   ],
    //   { session }
    // );
    // await QuoteModel.updateMany(
    //   { company_id: company_id },
    //   [
    //     {
    //       $set: {
    //         usd_amount: "$amount",
    //         amount: 0,
    //       },
    //     },
    //   ],
    //   { session }
    // );
    // console.log({ resSales });
    await commitTransaction(session);
  } catch (error) {
    console.log({ error });
    await abortTransaction(session);
  }
};

export const enrichSalariesWithWorkerData = (salaries, workers) => {
  const workersMap = new Map();

  for (const w of workers) {
    workersMap.set(w._id.toString(), w.toObject());
  }

  return salaries.map((s) => {
    const real = workersMap.get(s._id?.toString());

    return {
      ...s,
      name:
        real?.user?.firstname || real?.user?.email || s.name || "Sin nombre",
      image_url: real?.user?.image_url || s.image_url,
      payment_scheme: real?.payment_scheme || s.payment_scheme,
    };
  });
};
