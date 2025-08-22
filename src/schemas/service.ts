import mongoose, { Schema, model } from "mongoose";

const serviceSchema = new Schema(
  {
    name: String,
    detail: String,
    currency: String, // e.g. "ars" or "usd"
    prices: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "VehicleKind" },
        vehicle_kind: String,
        emoji: String,
        classification_id: String,
        price: Number,
      },
    ],
    redo_after_days: Number,
    manteinance_after_days: Number,
    manteinance_fee: Number,
    duplicated: { type: Boolean, default: false },
    duplicated_from: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
    sales: {
      amount: Number,
      count: Number,
      usd_amount: Number,
      usd_count: Number,
    },
    company_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    stores: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Store" },
        address: String,
        name: String,
      },
    ],
    search_field: String,
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    allow_quantity: { type: Boolean, default: false },
    quotes_description: String,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ServiceModel =
  (mongoose.models.Service as any) || model("Service", serviceSchema);
export default ServiceModel;
