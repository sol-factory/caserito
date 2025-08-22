import { cleanRegExp, cleanText } from "@/helpers/text";
import VehicleKind from "@/schemas/vehicle-kind";
import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import {
  abortTransaction,
  commitTransaction,
  getWorkplace,
  startTransaction,
} from "@/helpers/mdb";
import ServiceModel from "@/schemas/service";
import { CONFIG, VK_fixedOrder } from "@/config/constanst";
import CompanyModel from "@/schemas/company";
import VehicleKindModel from "@/schemas/vehicle-kind";

export const upsert = async ({ data }, user) => {
  const { _id, name, classification_id } = data;

  const session = await startTransaction();
  try {
    if (!_id) {
      const newVehicleKind = new VehicleKindModel({
        name,
        classification_id,
        company_id: user.company._id,
      });
      await newVehicleKind.save({ session });

      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.classifications": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación clasificación",
          },
        },
        { session }
      );
    } else {
      const updatedVehicleKind = await VehicleKind.findByIdAndUpdate(
        _id,
        {
          name,
          classification_id,
        },
        { session }
      );
      await ServiceModel.updateMany(
        { "prices._id": updatedVehicleKind._id },
        {
          $set: {
            "prices.$.vehicle_kind": name,
            "prices.$.classification_id": classification_id,
          },
        },
        { session }
      );
    }
    revalidatePath("/services");
    await commitTransaction(session);
    return {
      ok: true,
      message: "Tipo de vehículo " + (_id ? "editado" : "creado"),
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();
  try {
    await VehicleKind.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: new Date(),
        deleted_by: user._id,
      },
      { session }
    );
    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.classifications": -1,
        },
      },
      { session }
    );

    await ServiceModel.updateMany(
      { "prices._id": _id },
      { $pull: { prices: { _id } } },
      { session }
    );

    revalidatePath("/vehicle-kinds");
    await commitTransaction(session);
    return { ok: true, message: "Tipo de vehículo eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getItems = async (
  { filterId, searchText }: getItemsProps,
  user
) => {
  let pipeline = [];

  const matchStage: any = { ...getWorkplace(user, true), deleted: false };

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  }
  pipeline = pipeline.concat({ $match: matchStage });

  pipeline = pipeline.concat({
    $project: {
      _id: { $toString: "$_id" },
      name: 1,
      classification_id: 1,
    },
  });

  const vehicle_kinds = await VehicleKind.aggregate(pipeline);

  const result = vehicle_kinds
    .map((vk) => ({
      ...vk,
      pre_name: `${CONFIG.blob_url}/${
        vk.classification_id ? `vehicles/${vk.classification_id}` : "image-off"
      }.png`,
    }))
    .sort((a, b) => {
      const aIndex = VK_fixedOrder.indexOf(a.classification_id);
      const bIndex = VK_fixedOrder.indexOf(b.classification_id);
      return aIndex - bIndex;
    });

  return result;
};
