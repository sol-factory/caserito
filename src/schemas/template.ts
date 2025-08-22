import mongoose, { model, Schema, Types } from "mongoose";
import { z } from "zod";

export const templateFormSchema = z.object({
  _id: z.string().optional(),
  of: z.string({ required_error: "Falta indicar el tipo de template" }),
  name: z.string(),
  content: z.string({
    required_error: "Falta indicar el contenido del template",
  }),
  company_id: z.string(),
});

export type Template = z.infer<typeof templateFormSchema>;

const messageSchema = new Schema(
  {
    platform: String,
    client_id: { type: Types.ObjectId, ref: "Client" },
    sale_id: { type: Types.ObjectId, ref: "Sale" },
    member_id: { type: Types.ObjectId, ref: "Member" },
    template_id: { type: Types.ObjectId, ref: "Template" },
    template_name: String,
    whatsapp_number: String,
    message_key: Schema.Types.Mixed,
    sender_email: String,
    store_id: { type: Types.ObjectId, ref: "Store" },
    company_id: { type: Types.ObjectId, ref: "Company" },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const whatsappNumberSchema = new Schema(
  {
    number: String,
    company_id: String,
    company_name: String,
    stores: [{ _id: { type: Types.ObjectId, ref: "Store" }, name: String }],
    active_session: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const templateSchema = new Schema(
  {
    of: String,
    name: String,
    content: String,
    company_id: { type: Types.ObjectId, ref: "Company" },
    store_id: { type: Types.ObjectId, ref: "Store" },
    stores: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Store" },
        address: String,
        name: String,
      },
    ],
    screens: [
      {
        _id: { type: Schema.Types.ObjectId, ref: "Screen" },
        name: String,
      },
    ],

    locked: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const TemplateModel =
  (mongoose.models.Template as any) || model("Template", templateSchema);

export const MessageModel =
  (mongoose.models.Message as any) || model("Message", messageSchema);

export const WhatsappNumberModel =
  (mongoose.models.WhatsappNumber as any) ||
  model("WhatsappNumber", whatsappNumberSchema);

export default TemplateModel;
