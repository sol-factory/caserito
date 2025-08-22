import mongoose, { model, Schema, Types } from "mongoose";

const vehicleKindSchema = new Schema(
  {
    company_id: { type: Types.ObjectId, ref: "Company" },
    name: String,
    classification_id: String,
    emoji: { _id: String, emoji: String },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const VehicleKindModel =
  (mongoose.models.VehicleKind as any) ||
  model("VehicleKind", vehicleKindSchema, "vehicle_kinds");

export default VehicleKindModel;
