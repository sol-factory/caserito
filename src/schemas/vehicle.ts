import mongoose, { model, Schema } from "mongoose";

const vehicleSchema = new Schema(
  {
    client_id: { type: Schema.Types.ObjectId, ref: "Client" },
    company_id: { type: Schema.Types.ObjectId, ref: "Company" },
    client: { firstname: String, lastname: String, email: String },
    kind: {
      _id: String,
      name: String,
      emoji: String,
      classification_id: String,
    },
    insurance: {
      _id: String,
      name: String,
    },
    model: String,
    size: String,
    brand: { _id: String, name: String, blob_path: String },
    patent: String,
    search_field: String,
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vehicleSchema.methods.getBasicInfo = function () {
  return {
    kind: this.kind.name,
    kind_classification_id: this.kind.classification_id,
    insurance_name: this.insurance?.name,
    insurance_id: this.insurance?._id,
    brand: this.brand.name,
    model: this.model,
    patent: this.patent,
  };
};

const VehicleModel =
  (mongoose?.models?.Vehicle as any) || model("Vehicle", vehicleSchema);
export { VehicleModel, vehicleSchema };
