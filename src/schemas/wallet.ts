import mongoose, { model, Schema } from "mongoose";
import { commentSchema } from "./sale";
import { attachmentSchema } from "./attachment";

const walletSchema = new Schema(
  {
    name: String,
    company_id: { type: Schema.Types.ObjectId, ref: "Company" },
    stores: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Store" },
        address: String,
        name: String,
      },
    ],
    institution: {
      _id: String,
      name: String,
      logo_url: String,
    },
    balance: { type: Number, default: 0 },
    currency: String, // e.g. "ars" or "usd"
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const walletClosureSchema = new Schema(
  {
    company_id: { type: Schema.Types.ObjectId, ref: "Company", index: true },
    store_id: { type: Schema.Types.ObjectId, ref: "Store", index: true },
    wallet_id: { type: Schema.Types.ObjectId, ref: "Wallet", index: true },
    full_date: { day: Number, month: Number, week: Number, year: Number },
    currency: String,

    // calculados
    day_opening: Number, // saldo inicial esperado
    gathered: Number, // ingresos esperados
    gatherings: Number, // ingresos esperados
    spent: Number, // egresos esperados
    spents: Number, // egresos esperados
    expected_closing: Number, // Lo que había de saldo según movimientos
    counted_closing: Number, // lo que contó el usuario
    diff: Number, // counted_closing - expected_closing
    notes: String,
    attachments: [attachmentSchema],
    comments: [commentSchema],
    closed_by: { type: Schema.Types.ObjectId, ref: "User" },
    closed_by_email: String,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const WalletModel =
  (mongoose.models.Wallet as any) || model("Wallet", walletSchema);
const WalletClosureModel =
  (mongoose.models.WalletClosure as any) ||
  model("WalletClosure", walletClosureSchema, "wallet_closures");

export { WalletClosureModel };
export default WalletModel;
