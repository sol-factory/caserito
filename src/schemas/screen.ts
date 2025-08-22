import mongoose, { model, Schema } from "mongoose";

const screenSchema = new Schema({
  name: { type: String, unique: true },
});
const ScreenModel =
  (mongoose.models.Screen as any) || model("Screen", screenSchema);

export default ScreenModel;
