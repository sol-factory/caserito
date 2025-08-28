"use server";
import {
  CashflowCategoryModel,
  CashflowModel,
  CashflowSubCategoryModel,
} from "@/schemas/cashflow";
import { SaleModel } from "@/schemas/sale";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import {
  abortTransaction,
  commitTransaction,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import connectDB from "@/lib/connectDB";
import { getFullDate, getUserDate } from "@/helpers/date";
import { cleanRegExp } from "@/helpers/text";
import CompanyModel from "@/schemas/company";
import { v4 as uuidv4 } from "uuid";
import {
  applyWalletDiff,
  checkWalletClosure,
  incWalletBalance,
} from "@/helpers/wallets";

export const upsert = async ({ data }, user) => {
  const { _id, date, amount, sale_id, wallet, client, detail } = data;

  const cashflowDate = date ? getUserDate(user, date) : getUserDate(user);

  const session = await startTransaction();
  const sale = await SaleModel.findById(sale_id);
  const coef = sale.kind === "income" ? 1 : -1;
  const isIncome = sale.kind === "income";

  const finalExchangeRate = 1;
  const cancellingAmount = Math.round(amount);

  try {
    const cashflow_data = {
      category: sale.category,
      sub_category: sale.sub_category,
      date: cashflowDate,
      full_date: getFullDate(cashflowDate),
      amount: amount * coef,
      sale_id: !!sale_id ? sale_id : null,
      exchange_rate: finalExchangeRate,
      company_id: user.company._id,
      store_id: user.store._id,
      client_id: client?._id || null,
      client_name: client?.name || "",
      wallet: { ...wallet, logo_url: wallet.pre_name },
      creator: user,
      detail,
    };

    if (_id) {
      const prevCashflow = await CashflowModel.findById(
        _id,
        "amount cancelling_amount wallet"
      );

      await CashflowModel.findByIdAndUpdate(_id, cashflow_data, { session });

      // Ajuste de balance en wallets
      await applyWalletDiff({
        session,
        prev: {
          wallet: prevCashflow?.wallet,
          amount: prevCashflow?.amount ?? 0,
        },
        next: {
          wallet: cashflow_data.wallet,
          amount: cashflow_data.amount,
        },
      });

      if (!!sale_id) {
        await SaleModel.findByIdAndUpdate(
          sale_id,
          {
            $inc: {
              gathered_amount:
                cancellingAmount - prevCashflow.cancelling_amount,
            },
          },
          { session }
        );
      }
    } else {
      const newCashflow = new CashflowModel(cashflow_data);
      if (!!sale_id) {
        const updatedSale = await SaleModel.findByIdAndUpdate(
          sale_id,
          {
            $inc: {
              gathered_amount: cancellingAmount,
              gatherings: 1,
            },
          },
          { session }
        );
        newCashflow.sale_date = updatedSale.date;
        newCashflow.sale_full_date = updatedSale.full_date;

        const { client_id } = updatedSale;
        newCashflow.client_id = client_id;
      } else {
        await CompanyModel.findByIdAndUpdate(
          user.company._id,
          {
            $inc: {
              "statistics.cashflows_amount": amount * coef,
              "statistics.cashflows": 1,
            },
            $set: {
              "statistics.last_interaction": "Creación gasto",
            },
          },
          { session }
        );
      }
      await newCashflow.save({ session });

      // Ajuste de balance en wallet (creación)
      await incWalletBalance(
        cashflow_data.wallet,
        cashflow_data.amount,
        session
      );
    }
    await commitTransaction(session);
    revalidatePath(!!sale_id ? "/washes" : "/cashflows");
    return {
      ok: true,
      message: `${isIncome ? "Cobro" : "Egreso"} ${_id ? "editado" : "creado"}`,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const transfer = async ({ data }, user) => {
  const session = await startTransaction();

  const { wallet, wallet_to, date, amount, detail } = data;
  const cashflowDate = date ? getUserDate(user, date) : getUserDate(user);
  const cashflowFullDate = getFullDate(cashflowDate);
  const resultWallet = await checkWalletClosure({
    _id: null,
    new_wallet_id: wallet?._id,
    new_full_date: cashflowFullDate,
  });
  if (!resultWallet.ok) return resultWallet;

  const resultWalletTo = await checkWalletClosure({
    _id: null,
    new_wallet_id: wallet_to?._id,
    new_full_date: cashflowFullDate,
  });

  if (!resultWalletTo.ok) return resultWalletTo;

  const transactionId = uuidv4();
  if (!wallet?.name || !wallet_to?.name) {
    return {
      ok: false,
      message: "Debes seleccionar el origen y destino de los fondos",
    };
  }
  if (wallet._id === wallet_to._id) {
    return {
      ok: false,
      message: "El origen y destino de los fondos no puede ser el mismo",
    };
  }
  if (wallet.currency !== wallet_to.currency) {
    return {
      ok: false,
      message: "No puedes transferir entre diferentes monedas",
    };
  }
  const categories = {
    internal_transfer: {
      _id: "681f37aee43149c703bb3c6c",
      name: "Transferencia interna",
    },
    external_transfer: {
      _id: "681f433ae43149c703bb3c6f",
      name: "Transferencia externa",
    },
    extraction: {
      _id: "681f379ae43149c703bb3c6b",
      name: "Extracción",
    },
    deposit: {
      _id: "681f3462e43149c703bb3c6a",
      name: "Depósito",
    },
    cash_injection: {
      _id: "681f432ae43149c703bb3c6d",
      name: "Aporte de caja",
    },
    cash_extraction: {
      _id: "681f4331e43149c703bb3c6e",
      name: "Retiro de caja",
    },
  };

  const categoryKey = getTransferCategory(wallet, wallet_to);

  try {
    if (!!wallet?.name) {
      const cashflowFrom = new CashflowModel({
        kind: "Egreso",
        category: categories[categoryKey],
        date: cashflowDate,
        full_date: getFullDate(cashflowDate),
        company_id: user.company._id,
        store_id: user.store._id,
        wallet: { ...wallet, logo_url: wallet.pre_name },
        amount: amount * -1,
        detail,
        creator: user,
        transaction_id: transactionId,
      });
      await cashflowFrom.save({ session });
    }
    if (!!wallet_to?.name) {
      const cashflowTo = new CashflowModel({
        kind: "Ingreso",
        category: categories[categoryKey],
        date: cashflowDate,
        full_date: getFullDate(cashflowDate),
        company_id: user.company._id,
        store_id: user.store._id,
        wallet: { ...wallet_to, logo_url: wallet_to.pre_name },
        amount,
        detail,
        transaction_id: transactionId,
        creator: user,
      });
      await cashflowTo.save({ session });
    }

    // 3) Impacto en balances (mismo TX, atómico)
    await incWalletBalance(wallet, -amount, session); // resta en origen
    await incWalletBalance(wallet_to, amount, session); // suma en destino
    revalidatePath("/cashflows");
    await commitTransaction(session);
    return { ok: true, message: "Giro creado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getGatherings = async ({ filterId }) => {
  return await CashflowModel.aggregate([
    { $match: { sale_id: new Types.ObjectId(filterId) } },
    {
      $project: {
        _id: { $toString: "$_id" },
        date: 1,
        sale_id: { $toString: "$sale_id" },
        sale_date: 1,
        amount: 1,
        deleted: 1,
        deletor_email: 1,
        cancelling: 1,
        cancelling_amount: 1,
        exchange_rate: 1,
        creator_email: "$creator.email",
        wallet: {
          _id: { $toString: "$wallet._id" },
          name: "$wallet.name",
          currency: "$wallet.currency",
          pre_name: "$wallet.logo_url",
          logo_url: "$wallet.logo_url",
        },
        createdAt: 1,
        deleted_at: 1,
      },
    },
    { $sort: { deleted: 1, createdAt: 1 } },
  ]);
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();

  const now = new Date();
  try {
    const cf = await CashflowModel.findById(_id).select(
      "deleted amount wallet._id kind category.name sale_id full_date cancelling cancelling_amount transaction_id"
    );

    if (!cf) {
      await abortTransaction(session);
      return { ok: false, message: "Movimiento no encontrado" };
    }

    // 1) Marcar como borrado (soft delete)
    await CashflowModel.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: now,
        deleted_by: user._id,
        deletor_email: user.email,
      },
      { session }
    );

    // 3) Revertir impacto en la Venta (si aplica y si no estaba ya borrado)
    if (cf.sale_id) {
      const saleGatheredAmountField = "gathered_amount";

      await SaleModel.findByIdAndUpdate(
        cf.sale_id,
        {
          $inc: {
            [saleGatheredAmountField]: cf.amount * -1,
            gatherings: -1,
          },
        },
        { session }
      );
    }

    // 4) Si es parte de una transferencia (transaction_id), borrar también la contraparte
    if (!!cf.transaction_id) {
      const counterpart = await CashflowModel.findOne(
        {
          _id: { $ne: cf._id },
          transaction_id: cf.transaction_id,
          deleted: false,
        },
        "_id amount wallet"
      );
      if (counterpart) {
        // 4.b) Revertir impacto en su Wallet
        await incWalletBalance(
          counterpart.wallet as any,
          -counterpart.amount,
          session
        );
        console.log("Deleting counterpart", counterpart._id);
        await CashflowModel.findByIdAndUpdate(
          { _id: counterpart._id },
          {
            deleted: true,
            deleted_at: now,
            deleted_by: user._id,
            deletor_email: user.email,
          },
          { session }
        );
      }
    }

    revalidatePath(cf.kind === "Egreso" ? "/cashflows" : "/washes");
    await commitTransaction(session);
    return { ok: true, message: `${cf.category.name} eliminado` };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const revalidate = async () => {
  await connectDB();
  revalidatePath("/washes");
  return { ok: true, message: "Revalidated" };
};

export const getSubCategories = async ({ filterId, searchText }, user) => {
  const matchStage = {
    $or: [
      { company_id: { $exists: false } },
      { company_id: { $eq: toObjectId(user.company._id) } },
    ],
  };
  if (filterId) {
    matchStage["category._id"] = toObjectId(filterId);
  }
  console.log({ filterId });

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  }

  const subCategories = await CashflowSubCategoryModel.aggregate([
    {
      $match: matchStage,
    },
    { $sort: { "category.name": -1, name: 1 } },
  ]);

  const company = await CompanyModel.findById(
    user.company._id,
    "hiddenCashflowSubCategories"
  );
  const hiddenIds = company.hiddenCashflowSubCategories.map((hc) =>
    hc.toString()
  );

  return subCategories
    .filter((s) => !hiddenIds.includes(s._id.toString()))
    .map((s) => ({
      _id: s._id.toString(),
      name: s.name,
      category: { _id: s.category._id.toString(), name: s.category.name },
    }));
};

export const getCategories = async ({ form, flag, flagValue }) => {
  const filter = {
    selectable: true,
  };
  if (form === "cashflow-sub-category") {
    filter["name"] = { $ne: "Retiro" };
  }
  if (flag) {
    filter[flag] = flagValue;
  }

  const categories = await CashflowCategoryModel.find(filter).sort({ name: 1 });

  return categories.map((c) => ({
    _id: c._id.toString(),
    name: c.name,
  }));
};

export const getKinds = async ({}) => {
  return [
    { _id: "insumos", name: "Insumos para servicios" },
    { _id: "servicios", name: "Servicios" },
    { _id: "impuestos", name: "Impuestos" },
    { _id: "honorarios", name: "Honorarios" },
    { _id: "alquileres", name: "Alquileres" },
  ];
};

function getTransferCategory(wallet, wallet_to) {
  const isEfectivo = (w) => w?.name?.toLowerCase() === "efectivo";
  const isBank = (w) => !!w && !isEfectivo(w);

  const hasWallet = !!wallet?.name;
  const hasWalletTo = !!wallet_to?.name;

  if (hasWallet && hasWalletTo) {
    if (isEfectivo(wallet) && isBank(wallet_to)) return "deposit";
    if (isBank(wallet) && isEfectivo(wallet_to)) return "extraction";
    if (isBank(wallet) && isBank(wallet_to)) return "internal_transfer";
    if (isEfectivo(wallet) && isEfectivo(wallet_to)) return "internal_transfer";
  }

  if (hasWallet && !hasWalletTo) {
    if (isEfectivo(wallet)) return "cash_extraction";
    if (isBank(wallet)) return "external_transfer";
  }

  if (!hasWallet && hasWalletTo) {
    if (isEfectivo(wallet_to)) return "cash_injection";
    if (isBank(wallet_to)) return "external_transfer";
  }

  return "not_defined"; // Fallback
}
