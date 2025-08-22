import {
  abortTransaction,
  commitTransaction,
  createQuoteIdentifier,
  getQuoteMetadata,
  startTransaction,
} from "@/helpers/mdb";
import CompanyModel from "@/schemas/company";
import { QuoteModel } from "@/schemas/quote";
import StoreModel from "@/schemas/store";
import { SubscriptionModel } from "@/schemas/subscription";
import { addDays, differenceInSeconds } from "date-fns";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data, form }, user) => {
  const session = await startTransaction();
  const editing = !!data._id;

  try {
    let _id = data._id;
    const store = await StoreModel.findById(user.store._id);
    let sub = await SubscriptionModel.findOne({
      store_id: user.store._id,
      active: true,
    });

    if (sub && !_id) {
      const secondsElapsed = differenceInSeconds(
        sub?.quotes?.limit?.start_date,
        new Date()
      );

      if (secondsElapsed > 2592000) {
        sub = await SubscriptionModel.findOneAndUpdate(
          { store_id: user.store._id },
          {
            "quotes.limit.start_date": addDays(
              sub?.quotes?.limit?.start_date || new Date(),
              30
            ),
            "quotes.limit.count": 0,
          },
          { new: true } // así se renueva el count y no limita la siguiente validación
        );
      }

      if (sub?.quotes?.limit?.count >= sub?.quotes?.limit?.max) {
        return {
          ok: false,
          message: `Alcanzaste el límite de ${sub.quotes.limit.max} cotizaciones para esta sucursal. 
          Incrementa tu límite desde la configuración si deseas seguir creando cotizaciones.`,
        };
      }
    }

    const services = data.services.map((s) => ({
      _id: s._id,
      name: s.name,
      detail: s.detail,
      quotes_description: s.quotes_description,
      price: s.value || 0,
      quantity: s.quantity,
      currency: s.currency,
      allow_quantity: s.allow_quantity,
    }));

    const discounts = data.discounts.map((d) => {
      return {
        _id: d._id,
        name: d.name,
        currency: d.currency,
        kind: d.kind,
        value: d.value,
        amount: d.amount,
      };
    });

    const quoteMetadata = await getQuoteMetadata(data, user);

    const quote_data = {
      company_id: user.company._id,
      store_id: user.store._id,
      store: user.store,
      services,
      discounts,
      discounts_amount: data.discounts_amount,
      amount: data.amount,
      usd_discounts_amount: data.usd_discounts_amount,
      usd_amount: data.usd_amount,
      creator: user,
      primary_color: store.quotes_primary_color,
      secondary_color: store.quotes_secondary_color,
      client_id: data.client._id,
      vehicle_id: data.vehicle._id,
      observations: data.observations,
      dark_mode: store.quotes_dark_mode,
      tax: data.tax,
      valid_days: data.valid_days,
      avoid_total: data.avoid_total,
      avoid_default_observations: data.avoid_default_observations,
      ...quoteMetadata,
    };

    if (editing) {
      await QuoteModel.findByIdAndUpdate(_id, quote_data, {
        session,
      });
    } else {
      const newQuote = new QuoteModel(quote_data);
      newQuote.identifier = createQuoteIdentifier(newQuote);
      await newQuote.save({ session });
      if (!!sub) {
        await SubscriptionModel.findByIdAndUpdate(
          sub._id,
          { $inc: { "quotes.limit.count": 1 } },
          { session }
        );
      }
      _id = newQuote._id;

      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.quotes_amount": data.amount,
            "statistics.quotes": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación presupuesto",
          },
        },
        { session }
      );
    }

    await commitTransaction(session);
    revalidatePath("/quotes");
    return {
      ok: true,
      message: editing ? "Presupuesto editado" : "Presupuesto creado",
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const markAsSent = async ({ data }, user) => {
  const { _id } = data;
  await QuoteModel.findByIdAndUpdate(_id, {
    sent: true,
    sent_at: new Date(),
  });

  revalidatePath("/washes");
  return { ok: true, message: "Presupuesto marcado como enviado" };
};

export const setColor = async ({ data }, user) => {
  const { _id, color, alreadySelected } = data;

  await QuoteModel.findByIdAndUpdate(_id, {
    color: alreadySelected ? null : color,
  });

  revalidatePath("/washes");
  return { ok: true, message: "Color modificado" };
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();
  try {
    const date = new Date();
    await QuoteModel.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: date,
        deleted_by: user._id,
      },
      { session }
    );

    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.quotes_deleted": 1,
        },
      },
      { session }
    );

    await commitTransaction(session);
    revalidatePath("/quotes");
    return { ok: true, message: "Presupuesto eliminado" };
  } catch (error) {
    console.log({ error });
    await abortTransaction(session);
    throw error;
  }
};
