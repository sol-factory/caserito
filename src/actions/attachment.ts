import { CONFIG } from "@/config/constanst";
import {
  checkFilesLimit,
  deleteAzureBlob,
  incrementFilesCount,
  updateAzureBlob,
} from "@/helpers/blobs";
import { toObjectId } from "@/helpers/mdb";
import { AttachmentModel } from "@/schemas/attachment";
import CompanyModel from "@/schemas/company";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data, form }, user) => {
  // 1. Verificar límite
  const limitCheck = await checkFilesLimit(user.store._id);
  if (!limitCheck.ok) {
    return {
      ok: false,
      message: limitCheck.message,
    };
  }

  const newAttachment = new AttachmentModel({
    ...data,
    creator: user,
    date: new Date(),
  });

  const file = form.get("blob") as any;

  if (file && file.size > 0) {
    // Convertir a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Usamos extensión real si existe, si no png
    const ext = file.name?.split(".").pop() || "png";
    const blobPath = `attachments/${newAttachment._id.toString()}.${ext}`;

    // Subir a Azure
    await updateAzureBlob({
      buffer,
      blobPath,
      contentType: file.type || "application/octet-stream",
    });

    // Completar campos en el attachment
    newAttachment.blob_url = `${CONFIG.azure_blob_url}/aquapp/${blobPath}`;
    newAttachment.blob_path = blobPath;
    newAttachment.mb_size = +(file.size / (1024 * 1024)).toFixed(2);
    newAttachment.filename = file.name || `${newAttachment._id}.${ext}`;
    newAttachment.mimetype = file.type || "application/octet-stream";
  }

  await mongoose.model(data.model).findByIdAndUpdate(data.model_id, {
    $addToSet: { attachments: newAttachment },
  });

  // 2. Incrementar contador SOLO después de éxito
  await incrementFilesCount(user.store._id);
  await CompanyModel.findByIdAndUpdate(user.company._id, {
    $inc: {
      "statistics.attachments": 1,
    },
    $set: {
      "statistics.last_interaction": "Adjuntó archivo",
    },
  });

  revalidatePath("/");

  return {
    ok: true,
    message: "Archivo adjunto agregado",
  };
};

export const remove = async ({ _id, model }, user) => {
  const oldDocument = await mongoose.model(model).findOneAndUpdate(
    { "attachments._id": _id },
    {
      $pull: { attachments: _id },
    }
  );
  const deletedAttachment = oldDocument.attachments.find(
    (a) => a._id.toString() === _id.toString()
  );

  if (!deletedAttachment) {
    return {
      ok: false,
      message: "No se encontró el archivo adjunto",
    };
  }

  if (deletedAttachment.blob_url) {
    await deleteAzureBlob(deletedAttachment.blob_url);
  }

  await mongoose
    .model(model)
    .findOneAndUpdate(
      { "attachments._id": _id },
      { $pull: { attachments: { _id: toObjectId(_id) } } },
      { new: true }
    );

  revalidatePath("/");
  return {
    ok: true,
    message: "Archivo adjunto eliminado",
  };
};

export const getAttachments = async ({ filterId, model }) => {
  if (!filterId) {
    return [];
  }
  const [sale] = await mongoose.model(model).aggregate([
    { $match: { _id: toObjectId(filterId) } },
    {
      $project: {
        attachments: {
          $map: {
            input: "$attachments",
            as: "attachment",
            in: {
              _id: { $toString: "$$attachment._id" },
              description: "$$attachment.description",
              blob_url: "$$attachment.blob_url",
              mimetype: "$$attachment.mimetype",
              creator: {
                _id: {
                  $toString: "$$attachment.creator._id",
                },
                firstname: "$$attachment.creator.firstname",
                lastname: "$$attachment.creator.lastname",
                email: "$$attachment.creator.email",
              },
              date: "$$attachment.date",
              createdAt: "$$attachment.createdAt",
            },
          },
        },
      },
    },
  ]);

  return { ok: true, data: sale.attachments || [] };
};
