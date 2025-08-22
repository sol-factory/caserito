import WalletModel, { WalletClosureModel } from "@/schemas/wallet";
import { ClientSession, Types } from "mongoose";
import { CashflowModel } from "@/schemas/cashflow";

export async function recalcAllWalletBalances() {
  // 1) Zerar balances
  await WalletModel.updateMany({}, { $set: { balance: 0 } });

  // 2) Totales por wallet y aplicar
  const totals = await CashflowModel.aggregate([
    { $match: { deleted: { $ne: true } } },
    { $group: { _id: "$wallet._id", total: { $sum: "$amount" } } },
  ]);

  if (totals.length) {
    await WalletModel.bulkWrite(
      totals.map((t) => ({
        updateOne: {
          filter: { _id: t._id },
          update: {
            $set: { balance: Number(Number(t.total || 0).toFixed(2)) },
          },
        },
      }))
    );
  }
  console.log({ ok: true, updated: totals.length });
}

type WalletRef = { _id: Types.ObjectId | string };

export const incWalletBalance = async (
  wallet: WalletRef,
  delta: number,
  session: ClientSession
) => {
  if (!wallet?._id) return;
  await WalletModel.updateOne(
    { _id: wallet._id },
    { $inc: { balance: Number(delta.toFixed(2)) } },
    { session }
  );
};

export const applyWalletDiff = async ({
  session,
  prev,
  next,
}: {
  session: ClientSession;
  prev?: { wallet?: WalletRef; amount?: number };
  next: { wallet?: WalletRef; amount: number };
}) => {
  const prevAmt = Number((prev?.amount ?? 0).toFixed(2));
  const nextAmt = Number(next.amount.toFixed(2));
  const sameWallet =
    prev?.wallet?._id && next.wallet?._id
      ? String(prev.wallet._id) === String(next.wallet._id)
      : false;

  if (prev && sameWallet) {
    // edit en misma wallet: solo delta
    const delta = nextAmt - prevAmt;
    if (delta !== 0) await incWalletBalance(next.wallet!, delta, session);
  } else if (prev && !sameWallet) {
    // cambió de wallet: revertir en la anterior y aplicar en la nueva
    if (prev.wallet?._id && prevAmt !== 0)
      await incWalletBalance(prev.wallet, -prevAmt, session);
    if (next.wallet?._id && nextAmt !== 0)
      await incWalletBalance(next.wallet, nextAmt, session);
  } else {
    // creación
    if (next.wallet?._id && nextAmt !== 0)
      await incWalletBalance(next.wallet, nextAmt, session);
  }
};

export const checkWalletClosure = async ({
  _id,
  new_wallet_id,
  new_full_date,
}) => {
  try {
    let cashflowToEdit, prevDateClosure;

    if (!!_id) {
      cashflowToEdit = await CashflowModel.findById(_id, "wallet full_date");
      prevDateClosure = await WalletClosureModel.findOne({
        wallet_id: cashflowToEdit?.wallet?._id?.toString(),
        "full_date.day": cashflowToEdit.full_date.day,
        "full_date.month": cashflowToEdit.full_date.month,
        "full_date.year": cashflowToEdit.full_date.year,
        deleted: false,
      });
    }

    const newDateClosure = await WalletClosureModel.findOne({
      wallet_id: new_wallet_id,
      "full_date.day": new_full_date.day,
      "full_date.month": new_full_date.month,
      "full_date.year": new_full_date.year,
      deleted: false,
    });

    if (!!prevDateClosure || !!newDateClosure) {
      return {
        ok: false,
        message:
          "Operación no permitida. No se pueden modificar movimientos de billeteras que ya tengan un cierre de caja para una fecha determinada.",
      };
    }
    return { ok: true };
  } catch (error) {
    throw error;
  }
};
