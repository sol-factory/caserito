import mongoose, { model, Schema } from "mongoose";

const countrySchema = new Schema(
  {
    name: String,
    code: String,
    phone_code: String,
    flag: String,
    used_in: [String],
  },
  { timestamps: true }
);

const CountryModel =
  (mongoose.models.Country as any) || model("Country", countrySchema);
export default CountryModel;
