import mongoose, { model, Schema, Types } from "mongoose";
import { z } from "zod";

export const storeFormSchema = z.object({
  _id: z.string().optional(),
  name: z.string(),
  address: z.string(),
  company_id: z.string(),
});

export type Store = z.infer<typeof storeFormSchema>;

const storeSchema = new Schema(
  {
    name: String,
    company_id: { type: Types.ObjectId, ref: "Company" },
    sales: {
      amount: Number,
      count: Number,
      usd_amount: Number,
      usd_count: Number,
    },
    activated: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    whatsapp: {
      _id: { type: Types.ObjectId, ref: "WhatsappNumber" },
      number: String,
    },
    address: String,
    city: String,
    province: String,
    country: String,
    country_code: String,
    currency: String,
    country_flag: String,
    usd_exchange_rate: Number,
    location: {
      type: { type: String },
      coordinates: [Number, Number], // [lng, lat] — ¡importante el orden!
    },
    lat: Number,
    lng: Number,
    quotes_dark_mode: Boolean,
    quotes_observations: String,
    quotes_valid_days: { type: Number, default: 7 },
    quotes_primary_color: { type: String, default: "#0B70B7" },
    quotes_secondary_color: { type: String, default: "#E8E8E8" },
    quotes_tax: Number,
    quotes_available_count: Number,
    quotes_limit_start_date: { type: Date, default: new Date() },
    quotes_limit: { type: Number, default: 10 },
    quotes_count: { type: Number, default: 0 },
    allow_multi_currency: { type: Boolean, default: false },
    allow_vehicle_insurance: { type: Boolean, default: false },
    allow_pick_up_date: { type: Boolean, default: false },
    allow_client_email: { type: Boolean, default: false },
    allow_client_fiscal_id: { type: Boolean, default: false },
    allow_workers: { type: Boolean, default: false },
    show_permanence: { type: Boolean, default: false },
    allow_automatic_reminders: { type: Boolean, default: false },
    allow_client_address: { type: Boolean, default: false },
    allow_check_in_date: { type: Boolean, default: false },
    allow_sale_color: { type: Boolean, default: false },
    track_services_time: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const StoreModel =
  (mongoose.models.Store as any) || model("Store", storeSchema);

export default StoreModel;
