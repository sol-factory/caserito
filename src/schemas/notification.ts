import mongoose, { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    origin: String,
    name: String,
    entity: String,
    entity_id: String,
    type: String,
    entity_data: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    request: mongoose.Schema.Types.Mixed,
    headers: mongoose.Schema.Types.Mixed,
    params: mongoose.Schema.Types.Mixed,
    url: String,
  },
  { timestamps: true }
);

const NotificationModel =
  (mongoose.models.Notification as any) ||
  model("Notification", NotificationSchema);
export default NotificationModel;
