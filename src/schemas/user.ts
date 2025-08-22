import mongoose, { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstname: String,
    lastname: String,
    email: { type: String, unique: true },
    phone: {
      country_code: String,
      formatted_number: String,
      phone: String,
    },
    ips: [String],
    login_code: String,
    country_code: String,
    search_field: String,
    is_developer: Boolean,
    avatar_url: String,
    geo: {
      country: String,
      city: String,
      flag: String,
      timezone: String,
    },
    deleted: { type: Boolean, default: false },
    deleted_at: Date,
    deleted_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

userSchema.methods.getBasicInfo = function () {
  return {
    _id: this._id,
    firstname: this.firstname,
    lastname: this.lastname,
    email: this.email,
    phone: this.phone,
    avatar_url: this.avatar_url,
  };
};

const UserModel =
  (mongoose.models.User as any) || model("User", userSchema, "users");

export { UserModel, userSchema };
