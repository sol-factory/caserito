import mongoose, { model, Schema } from "mongoose";

const roleSchema = new Schema(
  {
    name: String,
    order: Number,
  },
  { timestamps: true }
);

const RoleModel = (mongoose.models.Role as any) || model("Role", roleSchema);
export default RoleModel;
