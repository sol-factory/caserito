import mongoose, { model, Schema } from "mongoose";
import { z } from "zod";

export const companyFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
});

export type Company = z.infer<typeof companyFormSchema>;

const companySchema = new Schema(
  {
    name: String,
    slug: String,
    country: String,
    city: String,
    province: String,
    fiscal_id: String,
    fiscal_category: { _id: String, name: String },
    lat: String,
    lng: String,
    is_financial: { type: Boolean, default: false },
    logo_url: String,
    phone: {
      country_code: String,
      formatted_number: String,
      phone: String,
    },
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
    subscription: {
      _id: { type: Schema.Types.ObjectId, ref: "Subscription" },
      provider_id: String,
      status: String,
      manually_activated: Boolean,
      stores: Number,
      active: { type: Boolean, default: false },
      last_update: Date,
    },
    statistics: {
      classifications: { type: Number, default: 0 },
      services: { type: Number, default: 0 },
      wallets: { type: Number, default: 1 },
      members: { type: Number, default: 1 },
      sales: { type: Number, default: 0 },
      usd_sales: { type: Number, default: 0 },
      sales_amount: { type: Number, default: 0 },
      usd_sales_amount: { type: Number, default: 0 },
      sales_deleted: { type: Number, default: 0 },
      cashflows: { type: Number, default: 0 },
      cashflows_amount: { type: Number, default: 0 },
      manual_wsp: { type: Number, default: 0 },
      attachments: { type: Number, default: 0 },
      instant_wsp: { type: Number, default: 0 },
      automatic_wsp: { type: Number, default: 0 },
      tutorials_clicked: Array,
      clients: { type: Number, default: 0 },
      resets: { type: Number, default: 0 }, // reseteos de ventas
      stores: { type: Number, default: 1 },
      last_interaction: String,
    },
    full_creation_date: {
      day: Number,
      month: Number,
      week: Number,
      year: Number,
      hour: Number,
      minute: Number,
    },
    hiddenCashflowSubCategories: [
      { type: Schema.Types.ObjectId, ref: "CashflowSubCategory" },
    ],
    created_from_ip: String,
    whatsapp: String,
    instagram: String,
    search_field: String,
    origin_event_name: String,
    kommo_contact_id: Number,
    kommo_lead_id: Number,
    active_whatsapp_session: { type: Boolean, default: false },
    whatsapp_number: String,
    last_billing_date: Date,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
    trial_start_date: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

const CompanyModel =
  (mongoose.models.Company as any) || model("Company", companySchema);
export default CompanyModel;
