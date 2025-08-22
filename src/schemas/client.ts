import mongoose, { model, Schema, Types } from "mongoose";
import { attachmentSchema } from "./attachment";

const clientSchema = new Schema(
  {
    kind: {
      type: String,
      enum: ["person", "company"],
      required: true,
    }, // "person" o "company"
    name: String, // para "company"
    firstname: String, // para "person"
    lastname: String, // para "person"
    email: String,
    address: String,
    fiscal_id: String,
    category: String, // "gold", "silver", "bronze"
    phone: {
      country_code: String,
      formatted_number: String,
      phone: String,
    },
    addresses: [
      {
        address: String,
        city: String,
        province: String,
        country: String,
        country_code: String,
        location: {
          type: { type: String },
          coordinates: [Number, Number], // [lng, lat] — ¡importante el orden!
        },
      },
    ],
    search_field: String,
    patents: [String],
    is_developer: Boolean,
    avatar_url: String,
    dob: { date: Date, day: Number, month: Number, year: Number },
    company_id: { type: Schema.Types.ObjectId, ref: "Company" },
    attachments: [attachmentSchema],
    sales: {
      amount: Number,
      count: Number,
      usd_amount: Number,
      usd_count: Number,
      last_one: Date,
    },
    last_messages: [
      {
        name: String,
        message_key: Schema.Types.Mixed,
        sender_email: String,
        template_id: String,
        template_name: String,
        sent_at: Date,
      },
    ],
    last_services: [
      {
        _id: String,
        vehicle_id: String,
        sale_id: String,
        vehicle: Schema.Types.Mixed,
        name: String,
        last_date: Date,
      },
    ],
    batch_id: String,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

clientSchema.methods.getBasicInfo = function () {
  return {
    kind: this.kind,
    firstname: this.firstname,
    lastname: this.lastname,
    email: this.email,
    category: this.category,
    phone: this.phone?.phone,
    country_code: this.phone?.country_code,
    address: this.address,
  };
};

const ClientModel =
  (mongoose?.models?.Client as any) || model("Client", clientSchema, "clients");

export { ClientModel, clientSchema };
