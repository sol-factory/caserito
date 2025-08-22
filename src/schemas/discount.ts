import mongoose, { Schema, model, Types } from "mongoose";

export const discountSchema = new Schema({
  company_id: { type: Types.ObjectId, ref: "Company" },
  stores: [
    {
      _id: { type: Schema.Types.ObjectId, ref: "Store" },
      address: String,
      name: String,
    },
  ],
  name: String,
  kind: String,
  value: Number,
  locked: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
  deleted_at: Date,
  deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  for_subscription: { type: Boolean, default: false },
});

const DiscountModel =
  (mongoose.models.Discount as any) ||
  model("Discount", discountSchema, "discounts");

export default DiscountModel;
