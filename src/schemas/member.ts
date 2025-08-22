import mongoose, { model, Schema, Types } from "mongoose";
import { attachmentSchema } from "./attachment";

const memberSchema = new Schema(
  {
    user: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      phone: {
        country_code: String,
        formatted_number: String,
        phone: String,
      },
    },
    search_field: String,
    attachments: [attachmentSchema],
    payment_scheme: {
      payment_type: {
        _id: {
          type: String,
          enum: [
            "fixed",
            "percent_of_sales",
            "fixed_or_commission",
            "fixed_plus_commission",
          ],
        },
        name: String,
      },
      fixed_salary: Number, // opcional
      sales_percentage: { type: Number }, // si aplica
      commission: {
        type: {
          type: String,
          enum: [
            "percent_of_service",
            "fixed_per_service",
            "percent_per_service",
          ],
        },
        percent: Number, // si es percent_of_service
        percent_per_service: {
          type: Map,
          of: new Schema(
            {
              name: String,
              percent: Number,
            },
            { _id: false }
          ), // Ej: { "64fa...": 10, "64fb...": 5 }
        },
      },
      pay_cycle: {
        _id: {
          type: String,
          enum: ["daily", "weekly", "monthly"],
          default: "monthly",
        },
        name: String,
      },
      bonuses_enabled: { type: Boolean, default: true },
      deductions_enabled: { type: Boolean, default: true },
    },
    company: {
      _id: { type: Schema.Types.ObjectId, ref: "Company" },
      name: String,
      slug: String,
      logo_url: String,
      country: String,
      createdAt: Date,
    },
    role: { _id: { type: Types.ObjectId, ref: "Role" }, name: String },
    stores: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Store" },
        address: String,
        name: String,
      },
    ],
    permissions: {
      quote: {
        can_view: { type: Boolean, default: true },
        can_view_amount: { type: Boolean, default: true },
      },
      cashflow: {
        can_view: { type: Boolean, default: true },
      },
      client: {
        can_view: { type: Boolean, default: true },
        can_edit: { type: Boolean, default: true },
        can_view_phone: { type: Boolean, default: true },
      },
      service: {
        can_view: { type: Boolean, default: true },
        can_view_amount: { type: Boolean, default: true },
      },
      sale: {
        can_view_amount: { type: Boolean, default: true },
      },
    },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const MemberModel =
  (mongoose.models.Member as any) || model("Member", memberSchema, "members");

export { MemberModel, memberSchema };
