import { revalidatePath } from "next/cache";
import { upsertBlob } from "@/helpers/blobs";
import { cleanRegExp, cleanText } from "@/helpers/text";
import {
  abortTransaction,
  commitTransaction,
  startTransaction,
} from "@/helpers/mdb";
import InstitutionModel from "@/schemas/institutions";

export const upsert = async ({ data, form }, user) => {
  const { _id, is_financial, is_insurance } = data;

  const logo = form.get("logo");
  let blob_id;
  let company, url;

  const session = await startTransaction();
  try {
    if (!_id) {
      const newCompany = new InstitutionModel({
        ...data,
        is_financial,
        is_insurance, // Default to true if not financial
      });
      company = await newCompany.save({ session });

      blob_id = company._id;
    } else {
      await InstitutionModel.findByIdAndUpdate(_id, {
        name: data.name,
      });
      blob_id = _id;
    }

    if (logo?.size > 0) {
      url = await upsertBlob(logo, `/institutions/${blob_id}`);
      await InstitutionModel.findByIdAndUpdate(
        blob_id,
        { logo_url: url },
        { session }
      );
    }

    revalidatePath("/");
    await commitTransaction(session);
    return {
      ok: true,
      message: `Institución ${_id ? "editada" : "creada"}`,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  await InstitutionModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/");
  return { ok: true, message: "Institución eliminada" };
};

export const getItems = async ({ flag, searchText }) => {
  let pipeline = [];
  const is_insurance = flag === "insurance";

  const matchStage: any = {
    is_financial: !is_insurance || !flag,
    is_insurance,
    deleted: false,
  };

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    pipeline = pipeline.concat({ $match: { ...matchStage, name: regex } });
  } else {
    pipeline.push({ $match: matchStage });
    pipeline.push({ $limit: 5 });
  }

  pipeline.push({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: 1,
      pre_name: "$logo_url",
    },
  });

  pipeline.push({ $sort: { name: 1 } });

  const financial_entities = await InstitutionModel.aggregate(pipeline);

  return financial_entities;
};
