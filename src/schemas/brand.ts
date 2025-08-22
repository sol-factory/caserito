import mongoose, { model, Schema } from "mongoose";
import { z } from "zod";

export const brandFormSchema = z.object({
  name: z
    .string({ required_error: "Falta indicar el nombre de la marca" })
    .min(3, "El nombre de la marca debe tener al menos 3 caracteres"),
});

export type Brand = {
  _id?: string;
  name: string;
  logo_url: string;
  vehicles: string[];
};

const brandSchema = new Schema({
  name: { type: String, unique: true },
  logo_url: String,
  deleted: { type: Boolean, default: false },
  deleted_at: Date,
  deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
});
const BrandModel =
  (mongoose.models.Brand as any) || model("Brand", brandSchema);

export default BrandModel;
