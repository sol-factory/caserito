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
    email: String,
    address: String,
    fiscal_id: String,
    phone: {
      country_code: String,
      formatted_number: String,
      phone: String,
    },

    search_field: String,
    company_id: { type: Schema.Types.ObjectId, ref: "Company" },
    attachments: [attachmentSchema],

    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

clientSchema.methods.getBasicInfo = function () {
  return {
    kind: this.kind,
    name: this.name,
    email: this.email,
    category: this.category,
    phone: this.phone?.phone,
    country_code: this.phone?.country_code,
    address: this.address,
  };
};

const ClientModel =
  (mongoose?.models?.Client as any) || model("Client", clientSchema);

export { ClientModel, clientSchema };
