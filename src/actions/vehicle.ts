import { cleanRegExp, cleanText, toSlug } from "@/helpers/text";
import { VehicleModel } from "@/schemas/vehicle";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import { ClientModel } from "@/schemas/client";
import { CONFIG } from "@/config/constanst";
import { SaleModel } from "@/schemas/sale";

export const upsert = async ({ data }, user) => {
  const { _id, user_id, brand, vehicle_kind, model, insurance, patent } = data;

  let vehicle;
  const client_id = user_id;
  const client = await ClientModel.findById(client_id);

  const vehicle_data = {
    client_id,
    company_id: user.company._id,
    client: client.getBasicInfo(),
    kind: vehicle_kind,
    insurance,
    brand: { ...brand, blob_path: `/brands/${toSlug(brand.name)}.png` },
    model,
    patent,
    search_field: cleanText(`${brand.name} ${model} ${patent}`),
  };

  if (!_id) {
    const newVehicle = new VehicleModel(vehicle_data);
    vehicle = await newVehicle.save();
  } else {
    vehicle = await VehicleModel.findByIdAndUpdate(_id, vehicle_data);
    if (!client.search_field.includes(patent?.toLowerCase()) && patent) {
      client.search_field = `${client.search_field} ${patent || ""}`;
      await client.save();
    }
    const updated = await SaleModel.updateMany(
      { client_id: vehicle.client_id, taken_away: false, deleted: false },
      { $set: { vehicle: vehicle.getBasicInfo() } }
    );
  }

  const lowerCasePatent = patent?.toLowerCase().replace(/\s+/g, "") || "";
  const patentAlreadyIncluded = client.patents?.includes(lowerCasePatent);
  if (!!lowerCasePatent && !patentAlreadyIncluded) {
    await ClientModel.findByIdAndUpdate(client_id, {
      $addToSet: { patents: lowerCasePatent },
      $set: {
        search_field: cleanText(`${client.search_field} ${lowerCasePatent}`),
      },
    });
  }

  revalidatePath("/");
  return {
    ok: true,
    message: `Vehículo ${_id ? "editado" : "creado"}`,
    data: { createdVehicleId: vehicle?._id.toString() },
  };
};

export const remove = async (_id: string, user) => {
  await VehicleModel.findByIdAndUpdate(_id, {
    deleted: true,
    deleted_at: new Date(),
    deleted_by: user._id,
  });

  revalidatePath("/");
  return { ok: true, message: "Vehículo eliminado" };
};

export const getByUserId = async (userId: string) => {
  const pipeline = [
    {
      $match: { client_id: new Types.ObjectId(userId), deleted: false },
    },
    {
      $project: {
        _id: {
          $convert: {
            input: "$_id",
            to: "string",
          },
        },
        kind: 1,
        insurance: 1,
        size: 1,
        brand: 1,
        model: 1,
        patent: 1,
        user_id: { $toString: "$client_id" },
      },
    },
  ];

  const vehicles = await VehicleModel.aggregate(pipeline);

  return vehicles;
};

export const getItems = async ({ filterId, searchText }: getItemsProps) => {
  let pipeline = [];
  const matchStage = { deleted: false };

  if (!!filterId) {
    matchStage["client_id"] = new Types.ObjectId(filterId);
  }

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["search_field"] = regex;
  }

  if (!!filterId || !!searchText) {
    pipeline = pipeline.concat({ $match: matchStage });
  }

  pipeline = pipeline.concat({
    $project: {
      _id: {
        $convert: {
          input: "$_id",
          to: "string",
        },
      },
      kind: 1,
      model: 1,
      detail: { $concat: ["$model", " ", "$patent"] },
      brand: { _id: { $toString: "$brand._id" }, name: "$brand.name" },
    },
  });

  const vehicles = await VehicleModel.aggregate(pipeline);

  return vehicles.map((v) => ({
    ...v,
    pre_name: `${CONFIG.blob_url}/brands/${toSlug(v.brand.name)}.png`,
    name: `${v?.kind?.name}`,
    detail: v.model,
  }));
};
