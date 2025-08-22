import { del, put } from "@vercel/blob";
import { BlobServiceClient } from "@azure/storage-blob";
import { CONFIG } from "@/config/constanst";
import { startOfMonth } from "date-fns";
import { SubscriptionModel } from "@/schemas/subscription";
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_BLOB_CONNECTION_STRING || ""
);
const containerName = "aquapp";
const containerClient = blobServiceClient.getContainerClient(containerName);

export const updateAzureBlob = async ({ buffer, blobPath, contentType }) => {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  const result = await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: contentType, // o "application/pdf" según el archivo
      blobContentDisposition: "inline", // esto permite ver en navegador
    },
  });

  return result;
};

export const upsertBlob = async (
  file: File,
  file_name: string,
  randomSufix = false
) => {
  const upsertedBlob = await put(`${file_name}.png`, file, {
    access: "public",
    addRandomSuffix: randomSufix,
  });

  return upsertedBlob.url;
};

export const deleteBlob = async (blob_url: string) => {
  try {
    await del(blob_url, null);
    return true;
  } catch (error) {
    console.error("Error deleting blob:", error);
    return false;
  }
};

export const deleteAzureBlob = async (blobUrl: string) => {
  try {
    // blobPath debe ser exactamente el mismo que usaste al subir:
    // ejemplo: "attachments/64e7bfa67e0b9c01.png"
    const blobPath = blobUrl.replace(
      `${CONFIG.azure_blob_url}/${containerName}/`,
      ""
    );
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const result = await blockBlobClient.deleteIfExists();
    return result.succeeded; // true si lo borró o no existía
  } catch (error) {
    console.error("Error deleting blob:", error);
    throw error;
  }
};

// Chequea si puede subir archivos según la suscripción
export const checkFilesLimit = async (storeId: string) => {
  const sub = await SubscriptionModel.findOne({
    store_id: storeId,
    active: true,
  });
  if (!sub) return { ok: true }; // si no hay suscripción, permitir, estaría en período de prueba

  const limit = sub.files?.limit;
  if (!limit) return { ok: true }; // si no hay límites, permitir

  const now = new Date();
  const currentStart = startOfMonth(now);

  // Si es un nuevo período, resetea internamente y permite
  if (!limit.start_date || limit.start_date < currentStart) {
    await SubscriptionModel.updateOne(
      { _id: sub._id },
      {
        $set: {
          "files.limit.start_date": currentStart,
          "files.limit.count": 0,
        },
      }
    );
    return { ok: true };
  }

  // Si está dentro del mismo período, revisar max
  if (limit.count >= limit.max) {
    return {
      ok: false,
      message: `Alcanzaste el límite de ${limit.max} archivos adjuntos para esta sucursal.`,
    };
  }

  return { ok: true };
};

export const incrementFilesCount = async (storeId: string) => {
  await SubscriptionModel.updateOne(
    { store_id: storeId },
    { $inc: { "files.limit.count": 1 } }
  );
};
