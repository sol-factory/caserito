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
    kind: { type: String, enum: ["income", "egress"], required: true },
    category: {
      _id: { type: Types.ObjectId, ref: "CashflowCategory" },
      name: String,
    },
    sub_category: {
      _id: { type: Types.ObjectId, ref: "CashflowSubCategory" },
      name: String,
    },
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
    comments: [commentSchema],
    attachments: [attachmentSchema],
    amount: { type: Number, default: 0 },
    gathered_amount: { type: Number, default: 0 },
    company_id: { type: Types.ObjectId, ref: "Company" },
    store_id: { type: Types.ObjectId, ref: "Store" },
    store: {
      _id: { type: Schema.Types.ObjectId, ref: "Store" },
      address: String,
      name: String,
    },
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    search_field: String,
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
