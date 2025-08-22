import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import { getWorkplace } from "@/helpers/mdb";
import DiscountModel from "@/schemas/discount";

export const upsert = async ({ data }, user) => {
  const { _id, kind, stores, value, name } = data;

  const discount_data = {
    name,
    kind,
    value,
    stores,
  };

  if (!_id) {
    const newDiscount = new DiscountModel({
      ...discount_data,
      ...getWorkplace(user),
    });

    await newDiscount.save();
  } else {
    await DiscountModel.findByIdAndUpdate(_id, discount_data);
  }

  revalidatePath("/discounts");
  return { ok: true, message: "Descuento creado" };
};

export const remove = async ({ _id }, user) => {
  await DiscountModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/discounts");
  return { ok: true, message: "Descuento eliminado" };
};

export const getItems = async (
  { filterId, searchText }: getItemsProps,
  user
) => {
  const pipeline = [];

  const matchStage = {
    deleted: false,
    ...getWorkplace(user, false, true),
  };

  pipeline.push({ $match: matchStage });
  pipeline.push({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: 1,
      kind: 1,
      value: 1,
    },
  });

  const lastThreeDiscounts = await DiscountModel.aggregate(pipeline);

  return lastThreeDiscounts;
};
