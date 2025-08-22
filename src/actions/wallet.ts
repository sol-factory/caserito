import { cleanRegExp } from "@/helpers/text";
import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import WalletModel, { WalletClosureModel } from "@/schemas/wallet";
import {
  abortTransaction,
  commitTransaction,
  getWorkplace,
  startTransaction,
} from "@/helpers/mdb";
import { CashflowModel } from "@/schemas/cashflow";
import InstitutionModel from "@/schemas/institutions";
import { CONFIG, COUNTRIES } from "@/config/constanst";
import CompanyModel from "@/schemas/company";

export const upsert = async ({ data }, user) => {
  const { _id, name, institution, stores, currency } = data;
  const financial_institution = await InstitutionModel.findById(
    institution?._id
  );

  if (name === "Efectivo") {
    return {
      ok: false,
      message: "No se puede crear una billetera con el nombre 'Efectivo'.",
    };
  }

  const session = await startTransaction();
  try {
    let blob_id;
    if (!_id) {
      const newWallet = new WalletModel({
        name,
        is_cash: name === "Efectivo",
        currency,
        institution: financial_institution
          ? {
              _id: financial_institution._id,
              name: financial_institution.name,
              logo_url: financial_institution.logo_url,
            }
          : undefined,
        stores,
        ...getWorkplace(user, true),
      });
      blob_id = newWallet._id;
      await newWallet.save({ session });
      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.wallets": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación billetera",
          },
        },
        { session }
      );
    } else {
      const oldWallet = await WalletModel.findById(_id, "currency");

      if (oldWallet.currency !== currency) {
        const cashflowsCount = await CashflowModel.countDocuments({
          "wallet._id": _id,
        });
        if (cashflowsCount > 0) {
          return {
            ok: false,
            message:
              "No se puede editar esta billetera porque ya tuvo ingresos o egresos.",
          };
        }
      }
      await WalletModel.findByIdAndUpdate(
        _id,
        {
          name,
          institution: {
            _id: financial_institution._id,
            name: financial_institution.name,
            logo_url: financial_institution.logo_url,
          },
          currency,
          stores,
        },
        { session }
      );
      await CashflowModel.updateMany(
        { "wallet._id": _id },
        {
          $set: {
            "wallet.name": name,
            "wallet.logo_url": financial_institution.logo_url,
          },
        },
        { session }
      );
      blob_id = _id;
    }

    revalidatePath("/wallets");
    await commitTransaction(session);
    return {
      ok: true,
      message: `Cuenta ${_id ? "editada" : "creada"}`,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();

  try {
    await WalletModel.findByIdAndUpdate(_id, {
      deleted: true,
      deleted_at: new Date(),
      deleted_by: user._id,
    });
    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.wallets": 1,
        },
      },
      { session }
    );

    revalidatePath("/wallets");
    await commitTransaction(session);
    return { ok: true, message: "Billetera eliminada" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getItems = async (
  { filterId, searchText, store_country_code },
  user
) => {
  const pipeline = [];
  const matchStage = {
    deleted: false,
    ...getWorkplace(user, false, true),
  };
  const limitStage = {};

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  } else {
    limitStage["$limit"] = 10;
  }
  pipeline.push({ $match: matchStage });

  if (!searchText) {
    pipeline.push(limitStage);
  }

  const country = COUNTRIES.find((c) => c.code === store_country_code);

  pipeline.push({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: 1,
      pre_name: {
        $cond: [
          { $eq: ["$name", "Efectivo"] },
          `${CONFIG.blob_url}/billetes.png`,
          "$institution.logo_url",
        ],
      },
      detail: {
        $cond: [
          { $eq: ["$currency", "usd"] },
          "🇺🇸 dólares",
          `${country?.flag || "🇦🇷"} pesos`,
        ],
      },
      currency: 1,
    },
  });

  const wallets = await WalletModel.aggregate(pipeline);

  return wallets;
};

export const createWalletClosure = async (data, user: any) => {
  const session = await startTransaction();

  const { dayFilters } = data;
  try {
    await WalletClosureModel.updateOne(
      {
        wallet_id: data._id,
        ...dayFilters,
        deleted: false,
      },
      {
        $set: {
          company_id: user.company._id,
          wallet_id: data._id,
          store_id: user.store._id,
          ...dayFilters,
          currency: data.currency,
          day_opening: data.balanceAtStart,
          gathered: data.gathered,
          gatherings: data.gatherings,
          spent: data.spent,
          spents: data.spents,
          expected_closing: data.current_balance,
          counted_closing: data.counted_closing,
          diff: data.difference,
          notes: data.closure_comment || "",

          closed_by: user._id,
          closed_by_email: user.email,
        },
      },
      { upsert: true, session }
    );
    await commitTransaction(session);

    return {
      ok: true,
      message: "Cierre de caja guardado",
      refresh: true,
    };
  } catch (err) {
    await abortTransaction(session);
    throw err;
  }
};

export const removeWalletClosure = async (id: string, user: any) => {
  const session = await startTransaction();
  try {
    await WalletClosureModel.findByIdAndUpdate(
      id,
      {
        deleted: true,
        deleted_at: new Date(),
        deleted_by: user._id,
      },
      { session }
    );

    revalidatePath("/");
    await commitTransaction(session);
    return { ok: true, message: "Cierre de caja eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};
