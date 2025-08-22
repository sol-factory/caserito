import mongoose, { model, Schema } from "mongoose";

const exchangeSchema = new Schema({
  date: Date,
  full_day: { day: Number, week: Number, month: Number, year: Number },
  currency: { type: String, enum: ["usd", "eur"], default: "usd" },
  to_currency: { type: String, enum: ["ars", "clp", "mxn"], default: "ars" },
  rate: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});
const ExchangeModel =
  (mongoose.models.Exchange as any) || model("Exchange", exchangeSchema);

export default ExchangeModel;
