import mongoose, { Schema, model, Types } from "mongoose";
import { attachmentSchema } from "./attachment";

export const commentSchema = new Schema(
  {
    text: String,
    date: Date,
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
  },
  { timestamps: true }
);

const saleSchema = new Schema(
  {
    date: Date,
    pick_up_date: Date,
    full_date: {
      day: Number,
      month: Number,
      week: Number,
      year: Number,
      hour: Number,
      minute: Number,
    },
    full_pick_up_date: {
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
        currency: String,
        description: String,
        price: Number,
        quantity: Number,
        allow_quantity: Boolean,
      },
    ],
    discounts: [
      {
        _id: String,
        name: String,
        kind: String,
        value: Number,
        currency: String,
        amount: Number,
      },
    ],
    comments: [commentSchema],
    attachments: [attachmentSchema],
    discounts_amount: { type: Number, default: 0 },
    usd_discounts_amount: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    usd_amount: { type: Number, default: 0 },
    gathered_amount: { type: Number, default: 0 },
    usd_gathered_amount: { type: Number, default: 0 },
    fully_paid: { type: Boolean, default: false },
    company_id: { type: Types.ObjectId, ref: "Company" },
    quote_id: { type: Types.ObjectId, ref: "Quote" },
    quote_identifier: String,
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
    workers: [
      {
        _id: false,
        member_id: String, // Referencia al miembro
        member_email: String, // Snapshot del mail
        member_name: String, // Snapshot del mail
        count: Number,
        sales_percentage: Number, // % que ese miembro tiene configurado globalmente
        percentage_to_pay: Number, // % real que cobrará sobre esta venta
        amount_to_pay: Number,
        usd_amount_to_pay: Number,
      },
    ],
    location: {
      type: { type: String },
      coordinates: [Number, Number], // [lng, lat] — ¡importante el orden!
    },
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    vehicle_id: { type: Types.ObjectId, ref: "Vehicle" },
    search_field: String,
    vehicle: {
      kind: String,
      kind_classification_id: String,
      size: String,
      brand: String,
      insurance_name: String,
      insurance_id: String,
      model: String,
      patent: String,
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
    finished: { type: Boolean, default: false },
    finished_at: Date,
    reminded: { type: Boolean, default: false },
    should_be_reminded: { type: Boolean, default: false },
    reminded_at: Date,
    taken_away: { type: Boolean, default: false },
    taken_away_at: Date,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const SaleModel =
  (mongoose.models.Sale as any) || model("Sale", saleSchema, "sales");
const CommentModel =
  (mongoose.models.Comment as any) || model("Comment", commentSchema);

export { SaleModel, CommentModel };
