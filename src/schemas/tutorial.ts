import mongoose, { model, Schema } from "mongoose";

const TutorialSchema = new Schema(
  {
    url: String,
    step: Number,
    entity: String,
    roles: [String],
    duration: String,
    kind: String,
    order: Number,
  },
  { timestamps: true }
);

const TutorialModel =
  (mongoose.models.Tutorial as any) || model("Tutorial", TutorialSchema);
export default TutorialModel;
