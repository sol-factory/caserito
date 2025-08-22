import mongoose, { model, Schema } from "mongoose";

const InstitutionSchema = new Schema(
  {
    name: String,
    is_financial: { type: Boolean, required: true },
    is_insurance: { type: Boolean, required: true },
    logo_url: String,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const InstitutionModel =
  (mongoose.models.Institution as any) ||
  model("Institution", InstitutionSchema);
export default InstitutionModel;
