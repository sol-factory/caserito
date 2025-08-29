import mongoose, { model, Schema, Types } from "mongoose";
import { attachmentSchema } from "./attachment";
import { commentSchema } from "./sale";

const cashflowCategorySchema = new Schema(
  {
    name: String,
    selectable: Boolean,
    kind: String,
  },
  { timestamps: true }
);
const cashflowSubCategorySchema = new Schema(
  {
    name: String,
    category: {
      _id: {
        type: Types.ObjectId,
        ref: "CashflowCategory",
        required: true,
      },
      name: String,
    },
    kind: String,
    company_id: { type: Types.ObjectId, ref: "Company" },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const cashflowSchema = new Schema(
  {
    detail: String,
    search_field: String,
    date: Date,
    category: {
      _id: { type: Types.ObjectId, ref: "CashflowCategory" },
      name: String,
    },
    sub_category: {
      _id: { type: Types.ObjectId, ref: "CashflowSubCategory" },
      name: String,
    },
    full_date: { day: Number, month: Number, week: Number, year: Number },
    company_id: { type: Types.ObjectId, ref: "Company" },
    store_id: { type: Types.ObjectId, ref: "Store" },
    client_id: { type: Types.ObjectId, ref: "Client" },
    client_name: String, // For quick access
    sale_id: { type: Types.ObjectId, ref: "Sale" },
    sale_date: Date,
    sale_full_date: { day: Number, month: Number, week: Number, year: Number },
    amount: Number,
    currency: String, // e.g. "ars" or "usd"
    exchange_rate: Number, // For currency conversion if needed
    cancelling: String, // e.g. "ars" or "usd"
    cancelling_amount: Number, // Amount in the cancelling currency
    attachments: [attachmentSchema],
    comments: [commentSchema],
    wallet: {
      _id: String,
      name: String,
      logo_url: String,
      currency: String, // e.g. "ars" or "usd"
    },
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    transaction_id: String,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
    deletor_email: String,
  },
  { timestamps: true }
);

const CashflowModel =
  (mongoose.models.Cashflow as any) ||
  model("Cashflow", cashflowSchema, "cashflows");
const CashflowSubCategoryModel =
  (mongoose.models.CashflowSubCategory as any) ||
  model(
    "CashflowSubCategory",
    cashflowSubCategorySchema,
    "cashflows-sub-categories"
  );
const CashflowCategoryModel =
  (mongoose.models.CashflowCategory as any) ||
  model("CashflowCategory", cashflowCategorySchema, "cashflows-categories");

export { CashflowModel, CashflowCategoryModel, CashflowSubCategoryModel };
