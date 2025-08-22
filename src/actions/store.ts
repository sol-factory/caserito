import { cleanRegExp, cleanText, pluralize } from "@/helpers/text";
import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import StoreModel from "@/schemas/store";
import {
  abortTransaction,
  commitTransaction,
  getWorkplace,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import { MemberModel } from "@/schemas/member";
import TemplateModel from "@/schemas/template";
import WalletModel from "@/schemas/wallet";
import CompanyModel from "@/schemas/company";
import { createJWTandSession, generateTokenPayload } from "@/helpers/auth";
import ServiceModel from "@/schemas/service";
import DiscountModel from "@/schemas/discount";
import { SaleModel } from "@/schemas/sale";
import { QuoteModel } from "@/schemas/quote";
import { COUNTRIES } from "@/config/constanst";

export const upsert = async ({ data }, user) => {
  const {
    _id,
    services,
    members,
    discounts,
    templates,
    wallets,
    allow_pick_up_date,
    allow_client_address,
    show_permanence,
  } = data;

  let store_id = _id;

  const session = await startTransaction();

  try {
    if (!store_id) {
      const country = COUNTRIES.find((c) => c.code === data.country_code);
      const newStore = new StoreModel({
        name: data.address,
        address: data.address,
        city: data.city,
        province: data.province,
        country: data.country_name,
        country_code: data.country_code,
        currency: country?.currency_code?.toLowerCase(),
        location: {
          type: "Point",
          coordinates: [data.lng, data.lat], // [lng, lat] — ¡importante el orden!
        },
        lat: data.lat,
        lng: data.lng,
        company_id: user.company._id,
        allow_pick_up_date,
        allow_client_address,
        show_permanence,
      });
      const createdStore = await newStore.save({ session });
      store_id = createdStore._id;
      await MemberModel.updateOne(
        {
          "user.email": user.email,
          "company._id": user.company._id,
        },
        {
          $push: { stores: { _id: createdStore._id, name: createdStore.name } },
        },
        { session }
      );

      await WalletModel.create(
        {
          name: "Efectivo",
          company_id: user.company._id,
          stores: [{ _id: createdStore._id, name: createdStore.name }],
          currency: createdStore.currency,
        },
        { session }
      );

      const filteredWallets = wallets.filter((w) => w.name !== "Efectivo");

      const updateQuery = {
        $addToSet: {
          stores: { _id: createdStore._id, name: createdStore.name },
        },
      };

      await Promise.all([
        ServiceModel.updateMany(
          { _id: { $in: services.map((s) => toObjectId(s._id)) } },
          updateQuery,
          { session }
        ),
        MemberModel.updateMany(
          { _id: { $in: members.map((m) => toObjectId(m._id)) } },
          updateQuery,
          { session }
        ),
        WalletModel.updateMany(
          { _id: { $in: filteredWallets.map((w) => toObjectId(w._id)) } },
          updateQuery,
          { session }
        ),
        DiscountModel.updateMany(
          { _id: { $in: discounts.map((d) => toObjectId(d._id)) } },
          updateQuery,
          { session }
        ),
        TemplateModel.updateMany(
          { _id: { $in: templates.map((t) => toObjectId(t._id)) } },
          updateQuery,
          { session }
        ),
        CompanyModel.findByIdAndUpdate(
          user.company._id,
          {
            $inc: { "statistics.stores": 1 },
            $set: {
              "statistics.last_interaction": "Creación sucursal",
            },
          },
          { session }
        ),
      ]);
    } else {
      delete data.sales;
      delete data.whatsapp;
      const oldStore = await StoreModel.findByIdAndUpdate(_id, data, {
        session,
      });

      if (!oldStore.whatsapp?.number && data.allow_automatic_reminders) {
        await abortTransaction(session);
        return {
          ok: false,
          message:
            'No puedes activar los recordatorios automáticos, primero deberías vincular un número de Whatsapp a la sucursal desde la pestaña "Plantillas".',
        };
      }
      if (
        oldStore.allow_automatic_reminders !== data.allow_automatic_reminders
      ) {
        console.log("Cambió el estado de recordatorios automáticos");
        await SaleModel.updateMany(
          { store_id: oldStore._id, date: { $gt: new Date() } },
          { $set: { should_be_reminded: data.allow_automatic_reminders } }
        );
      }
      if (store_id === user.store._id) {
        const company = await CompanyModel.findById(user.company?._id);
        const payload = generateTokenPayload(user, {
          company: user.company,
          role: { name: user.role },
          store: data,
          subscription: company.subscription,
        });

        await createJWTandSession(payload);
      }
      const filter = { "stores._id": toObjectId(store_id) };
      const updateQuery = {
        $set: {
          "stores.$.name": data.name,
        },
      };

      await Promise.all([
        MemberModel.updateMany(filter, updateQuery, { session }),
        ServiceModel.updateMany(filter, updateQuery, { session }),
        TemplateModel.updateMany(filter, updateQuery, { session }),
        WalletModel.updateMany(filter, updateQuery, { session }),
        DiscountModel.updateMany(filter, updateQuery, { session }),
      ]);
    }
    await commitTransaction(session);
    revalidatePath("/stores");
    return {
      ok: true,
      message: `Sucursal ${
        _id ? "editada" : "creada.\nFuiste agregado con rol de Socio"
      }`,
      refresh: true,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const updateQuotesConfig = async ({ data }, user) => {
  const session = await startTransaction();
  const {
    quotes_observations,
    quotes_valid_days,
    quotes_primary_color,
    quotes_secondary_color,
    quotes_tax,
    quotes_dark_mode,
    quotes_payment_conditions,
  } = data;

  try {
    await StoreModel.findByIdAndUpdate(user.store._id, {
      $set: {
        quotes_observations,
        quotes_valid_days,
        quotes_primary_color,
        quotes_secondary_color,
        quotes_dark_mode,
        quotes_tax,
        quotes_payment_conditions,
      },
    });
    await QuoteModel.updateMany(
      { store_id: user.store._id, sent: false },
      {
        $set: {
          valid_days: quotes_valid_days,
          primary_color: quotes_primary_color,
          secondary_color: quotes_secondary_color,
          dark_mode: quotes_dark_mode,
        },
      },
      { session }
    );

    await commitTransaction(session);
    revalidatePath("/");
    return {
      ok: true,
      message: `Configuración de presupuestos editada`,
      refresh: true,
      redirectTo: "/quotes",
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};
export const updateExchangeRate = async ({ data }, user) => {
  const { usd_exchange_rate } = data;

  try {
    await StoreModel.findByIdAndUpdate(user.store._id, {
      $set: { usd_exchange_rate },
    });

    revalidatePath("/stores");
    return {
      ok: true,
      message: `Tipo de cambio actualizado`,
    };
  } catch (error) {
    throw error;
  }
};

export const toggleAllowMultipleCurrencies = async (
  { store_id, allow },
  user
) => {
  const servicesInUsd = await ServiceModel.countDocuments({
    "stores._id": toObjectId(store_id),
    currency: "usd",
    deleted: false,
  });

  if (servicesInUsd > 0 && !allow) {
    return {
      ok: false,
      message: `No puedes deshabilitar la multimoneda porque hay ${servicesInUsd} ${pluralize("servicio", servicesInUsd)} en dólares`,
    };
  }
  try {
    const updatedStore = await StoreModel.findByIdAndUpdate(store_id, {
      $set: {
        allow_multi_currency: allow,
      },
    });
    const hasUSDWallet = await WalletModel.exists({
      company_id: updatedStore.company_id,
      currency: "usd",
      deleted: false,
    });

    if (!hasUSDWallet && allow) {
      const stores = await StoreModel.find({
        company_id: updatedStore.company_id,
        deleted: false,
      });
      await WalletModel.create({
        name: "Efectivo",
        company_id: updatedStore.company_id,
        currency: "usd",
        stores,
      });
    }

    return {
      ok: true,
      message: "Multimoneda " + (allow ? "habilitada" : "deshabilitada"),
      refresh: true,
    };
  } catch (error) {
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const members = await MemberModel.countDocuments({
    "stores._id": _id,
    deleted: false,
  });

  const stores = await StoreModel.countDocuments({
    company_id: user.company._id,
    deleted: false,
  });

  if (stores === 1) {
    return {
      ok: false,
      message: "No puedes eliminar tu única sucursal",
    };
  }
  if (members > 0) {
    return {
      ok: false,
      message: "No puedes eliminar una sucursal que tiene personal asignado",
    };
  }

  const session = await startTransaction();
  try {
    await StoreModel.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: new Date(),
        deleted_by: user._id,
      },
      { session }
    );
    const filter = { "stores._id": _id };
    const updateQuery = { $pull: { stores: { _id } } };

    await Promise.all([
      MemberModel.updateMany(filter, updateQuery, { session }),
      WalletModel.updateMany(filter, updateQuery, { session }),
      DiscountModel.updateMany(filter, updateQuery, { session }),
      TemplateModel.updateMany(filter, updateQuery, { session }),
      ServiceModel.updateMany(filter, updateQuery, { session }),
      CompanyModel.findByIdAndUpdate(
        user.company._id,
        { $inc: { "statistics.stores": -1 } },
        { session }
      ),
    ]);

    revalidatePath("/stores");
    await commitTransaction(session);
    return { ok: true, message: "Sucursal eliminada" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getItems = async (
  { filterId, searchText }: getItemsProps,
  user
) => {
  let pipeline: any = [
    { $match: { deleted: false, ...getWorkplace(user, true) } },
  ];

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    pipeline = pipeline.concat({ $match: { name: regex, deleted: false } });
  }

  pipeline = pipeline.concat([
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        address: 1,
      },
    },
  ]);

  const stores = await StoreModel.aggregate(pipeline);

  return stores;
};
