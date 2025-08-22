import { CONFIG } from "@/config/constanst";
import { differenceInCalendarDays } from "date-fns";
import {
  MercadoPagoConfig,
  PreApproval,
  Payment,
  Preference,
} from "mercadopago";

// Configura tu access token
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preapproval = new PreApproval(client);
const payment = new Payment(client);
const preference = new Preference(client);

export const getRemainingDays = (trial_start_date) => {
  const daysSinceCreation = differenceInCalendarDays(
    new Date(),
    new Date(trial_start_date)
  );

  return 14 - daysSinceCreation;
};

export const isCurrentSub = (currentActiveSub, selectedPlan) => {
  if (
    !!currentActiveSub &&
    currentActiveSub.stores === selectedPlan.stores &&
    currentActiveSub.plan_id.toString() === selectedPlan._id.toString()
  ) {
    return {
      ok: false,
      isSameSub: true,
      message:
        "Ya tienes una suscripción activa con ese plan y esa cantidad de sucursales",
    };
  }
  return { isSameSub: false };
};

export const getEffectivePriceDate = (createdAt: Date): Date => {
  const year = new Date(createdAt).getFullYear();
  const julyCutoff = new Date(`${year}-07-15`);
  const janCutoff = new Date(`${year}-01-15`);

  if (createdAt <= janCutoff) {
    return new Date(`${year - 1}-12-31`); // Usa precios del año anterior
  }

  if (createdAt <= julyCutoff) {
    return new Date(`${year}-06-30`); // Usa precios del primer semestre
  }

  // Si no entra en la gracia, usa fecha actual (precios vigentes)
  return createdAt;
};

export function getGracePeriodDays(creationDate: Date): number {
  const year = creationDate?.getFullYear();

  const juneStart = new Date(`${year}-06-01`);
  const juneEnd = new Date(`${year}-06-30T23:59:59`);
  const julyCutoff = new Date(`${year}-07-15T23:59:59`);

  const decemberStart = new Date(`${year}-12-01`);
  const decemberEnd = new Date(`${year}-12-31T23:59:59`);
  const januaryCutoff = new Date(`${year + 1}-01-15T23:59:59`);

  // Si se creó en junio o entre el 1 y 15 de julio → 15 días de gracia
  if (
    (creationDate >= juneStart && creationDate <= julyCutoff) ||
    (creationDate >= decemberStart && creationDate <= januaryCutoff)
  ) {
    return 15;
  }

  return 0;
}

export const calculatePrices = ({
  quotesQty,
  whatsappQty,
  filesQty,
  country,
  createdAt,
  subscription,
}: {
  quotesQty: number;
  whatsappQty: number;
  filesQty: number;
  country: string;
  createdAt: Date;
  subscription?: any;
}) => {
  const config = CONFIG.subscriptions;

  const graceDays = getGracePeriodDays(createdAt);

  const prices = config.prices(country, new Date(), graceDays);

  if (!prices)
    return { pricing: null, whatsapp: null, quote: null, file: null };

  const result: any = {
    pricing: prices,
    whatsapp: null,
    quote: null,
    file: null,
  };

  const calculate = (quantity: number, type: "whatsapp" | "quote" | "file") => {
    const typeConfig = config[type];
    const { maxQty, minQty, free_limit, maxDiscountRate } = typeConfig;
    const qty = Math.max(minQty, Math.min(quantity, maxQty));
    const discountFactor = (qty - minQty) / (maxQty - minQty);
    const discount = discountFactor * maxDiscountRate;

    let basePrice: number | null = null;
    if (subscription) {
      if (type === "whatsapp")
        basePrice = subscription?.messages?.base_price ?? null;
      if (type === "quote")
        basePrice = subscription?.quotes?.base_price ?? null;
      if (type === "file") basePrice = subscription?.files?.base_price ?? null;
    }

    if (basePrice == null) {
      switch (type) {
        case "whatsapp":
          basePrice = prices.whatsapp_base;
          break;
        case "quote":
          basePrice = prices.quotes_base;
          break;
        case "file":
          basePrice = prices.files_base;
          break;
      }
    }

    const unitPrice = basePrice * (1 - discount);
    const total = unitPrice * (qty > free_limit ? qty : 0);
    const decimals = country === "AR" ? 0 : 2;

    return {
      quantity: qty,
      unitPrice: Number(unitPrice.toFixed(decimals)),
      total: qty < minQty ? 0 : Number(total.toFixed(decimals)),
      discountPercent: Number((discount * 100).toFixed(decimals)),
      config: typeConfig,
      subscriptionPricingUsed: !!subscription && basePrice != null,
    };
  };

  result.whatsapp = calculate(whatsappQty, "whatsapp");
  result.quote = calculate(quotesQty, "quote");
  result.file = calculate(filesQty, "file");

  return result;
};

export const createDebtPaymentLink = async ({ preapproval_id, debt }) => {
  if (debt <= 0) return null;

  const expirationFrom = new Date();
  const expirationTo = new Date(expirationFrom.getTime() + 72 * 60 * 60 * 1000); // +24 hs
  const preference_data = {
    items: [
      {
        id: preapproval_id,
        title: `Pago de deuda Aquapp`,
        description: `Suscripción #${preapproval_id}`,
        quantity: 1,
        unit_price: debt,
        currency_id: "ARS", // o "USD", según el caso
      },
    ],
    metadata: {
      preapproval_id,
      is_debt_payment: true,
    },
    expiration_date_from: expirationFrom.toISOString(),
    expiration_date_to: expirationTo.toISOString(),
    notification_url: "https://www.aquapp.lat/api/webhook/mp/debt/payment", // tu endpoint real
    back_urls: {
      success: "https://aquapp.lat/subscription",
      failure: "https://aquapp.lat/subscription",
      pending: "https://aquapp.lat/subscription",
    },
    auto_return: "approved",
  };

  const res = await preference.create({ body: preference_data });
  return res.init_point;
};
