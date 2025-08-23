import { cleanRegExp, cleanText, toSlug } from "@/helpers/text";
import BrandModel from "@/schemas/brand";
import { revalidatePath } from "next/cache";
import { upsertBlob } from "@/helpers/blobs";

export const upsert = async ({ data, form }) => {
  const { _id } = data;
  const image = form.get("image");
  let blob_id;
  if (!_id) {
    const inserted = await BrandModel.create(data);
    blob_id = inserted._id;
  } else {
    await BrandModel.findByIdAndUpdate(_id, {
      name: data.name,
    });
    blob_id = _id;
  }
  if (!!image) {
    const url = await upsertBlob(image, `/brands/${toSlug(data.name)}`);
    await BrandModel.findByIdAndUpdate(blob_id, { logo_url: url });
  }

  revalidatePath("/brands");
  return {
    ok: true,
    message: `Marca ${_id ? "editada" : "creada"}`,
  };
};

export const remove = async (_id: string, user) => {
  await BrandModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/brands");
  return { ok: true, message: "Marca eliminada" };
};

export const getItems = async ({ filterId, searchText }) => {
  const pipeline = [];

  const matchStage = { deleted: false };

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  }
  pipeline.push({ $match: matchStage });

  if (!searchText) {
    pipeline.push({ $limit: 5 });
  }

  pipeline.push({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: 1,
      pre_name: "$logo_url",
    },
  });

  const brands = await BrandModel.aggregate(pipeline);

  return brands;
};
