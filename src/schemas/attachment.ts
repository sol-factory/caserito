import mongoose, { model, Schema } from "mongoose";

export const attachmentSchema = new Schema(
  {
    kind: String,
    description: String,
    date: Date,
    blob_url: String,
    blob_path: String,
    mb_size: Number, // in MB
    filename: String,
    mimetype: String,
    creator: {
      _id: { type: Schema.Types.ObjectId, ref: "User" },
      email: String,
      firstname: String,
      lastname: String,
      avatar_url: String,
    },
  },
  { timestamps: true }
);

const AttachmentModel =
  (mongoose.models.Attachment as any) || model("Attachment", attachmentSchema);

export { AttachmentModel };
