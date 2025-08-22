import mongoose, { Schema, model, Types } from "mongoose";
import { attachmentSchema } from "./attachment";
import { commentSchema } from "./sale";

const quoteSchema = new Schema(
  {
    identifier: String, //240612-HNCJUC
    date: Date,
    full_date: {
      day: Number,
      month: Number,
      week: Number,
      year: Number,
      hour: Number,
      minute: Number,
    },
    services: [
      {
        _id: { type: Types.ObjectId, ref: "Service" },
        name: String,
        detail: String,
        quotes_description: String,
        currency: String, // e.g. "ars" or "usd"
        price: Number,
        quantity: Number,
        allow_quantity: Boolean,
      },
    ],
    discounts: [
      {
        _id: { type: Types.ObjectId, ref: "Discount" },
        name: String,
        kind: String,
        currency: String,
        value: Number,
        amount: Number,
      },
    ],
    amount: { type: Number, default: 0 },
    usd_amount: { type: Number, default: 0 },
    discounts_amount: { type: Number, default: 0 },
    usd_discounts_amount: { type: Number, default: 0 },
    attachments: [attachmentSchema],
    comments: [commentSchema],
    primary_color: String,
    secondary_color: String,
    company_id: { type: Types.ObjectId, ref: "Company" },
    vehicle_id: { type: Types.ObjectId, ref: "Vehicle" },
    store_id: { type: Types.ObjectId, ref: "Store" },
    store: {
      _id: { type: Schema.Types.ObjectId, ref: "Store" },
      address: String,
      name: String,
    },
    client_id: { type: Types.ObjectId, ref: "User" },
    client: {
      kind: String,
      firstname: String,
      lastname: String,
      email: String,
      category: String,
      phone: String,
      country_code: String,
      address: String,
    },
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    observations: String,
    dark_mode: { type: Boolean, default: false },
    valid_days: Number,
    tax: Number,
    default_observations: String,
    sent: { type: Boolean, default: false },
    sent_at: Date,
    sold: { type: Boolean, default: false },
    avoid_total: { type: Boolean, default: false },
    sold_at: Date,
    sale: {
      _id: { type: Types.ObjectId, ref: "Sale" },
      date: Date,
    },
    search_field: String,
    vehicle: {
      kind: String,
      kind_classification_id: String,
      insurance_name: String,
      insurance_id: String,
      size: String,
      brand: String,
      model: String,
      patent: String,
      _id: String,
    },
    color: String,
    messages: [
      {
        name: String,
        message_key: Schema.Types.Mixed,
        sender_email: String,
        template_id: String,
        template_name: String,
        sent_at: Date,
      },
    ],
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const QuoteModel =
  (mongoose.models.Quote as any) || model("Quote", quoteSchema, "quotes");

export { QuoteModel };
