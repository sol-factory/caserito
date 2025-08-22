import mongoose, { model, Schema } from "mongoose";
const Mixed = mongoose.Schema.Types.Mixed;
const EventSchema = new Schema(
  {
    origin: String,
    name: String,
    user: { _id: { type: Schema.Types.ObjectId, ref: "User" }, email: String },
    company: {
      _id: { type: Schema.Types.ObjectId, ref: "Company" },
      name: String,
    },
    kommo_lead_id: Number,
    kommo_contact_id: Number,
    whatsapp: String,
    instagram: String,
    lead_id: String,
    browser: Mixed,
    device: Mixed,
    os: Mixed,
    engine: Mixed,
    ip: String,
    geo: {
      country: String,
      city: String,
      flag: String,
      timezone: String,
    },
    metadata: Mixed,
  },
  { timestamps: true }
);

const EventModel =
  (mongoose.models.Event as any) || model("Event", EventSchema);
export default EventModel;
