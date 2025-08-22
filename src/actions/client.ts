import { cleanRegExp, cleanText, toSlug } from "@/helpers/text";
import { ClientModel } from "@/schemas/client";
import { VehicleModel } from "@/schemas/vehicle";
import { revalidatePath } from "next/cache";
import { getItemsProps } from "./service";
import {
  abortTransaction,
  commitTransaction,
  getWorkplace,
  startTransaction,
} from "@/helpers/mdb";
import { SaleModel } from "@/schemas/sale";
import CompanyModel from "@/schemas/company";
import { QuoteModel } from "@/schemas/quote";
import { CONFIG } from "@/config/constanst";

export const upsert = async ({ data }, user) => {
  const {
    _id,
    name,
    kind,
    email,
    phone,
    country,
    address,
    fiscal_id,
    formatted_number,
  } = data;

  const client_data = {
    kind,
    name,
    email,
    address,
    fiscal_id,
    addresses: [
      {
        address: data.address,
        city: data.city,
        province: data.province,
        country: data.country_name,
        country_code: data.country_code,
        location: {
          type: "Point",
          coordinates: [data.lng, data.lat], // [lng, lat] — ¡importante el orden!
        },
        lat: data.lat,
        lng: data.lng,
      },
    ],
    phone: {
      country_code: country?.code,
      formatted_number,
      phone,
    },

    company_id: user.company._id,
    search_field: cleanText(`${name} ${email} ${phone}`),
  };

  let createdClient;
  const session = await startTransaction();
  try {
    if (!_id) {
      const newUser = new ClientModel(client_data);
      createdClient = await newUser.save({ session });

      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.clients": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación cliente",
          },
        },
        { session }
      );
    } else {
      const updatedClient = await ClientModel.findByIdAndUpdate(
        _id,
        client_data,
        {
          session,
          new: true,
        }
      );
      await SaleModel.updateMany(
        { client_id: updatedClient._id },
        { $set: { client: updatedClient.getBasicInfo() } },
        { session }
      );
    }

    revalidatePath("/clients");
    await commitTransaction(session);
    return {
      ok: true,
      message: `Cliente ${_id ? "editado" : "creado"}`,
      data: !_id
        ? {
            lat: data.lat,
            lng: data.lng,
            createdClientId: createdClient._id.toString(),
          }
        : undefined,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();

  try {
    await ClientModel.findByIdAndUpdate(
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
          "statistics.clients": -1,
        },
      },
      { session }
    );

    revalidatePath("/");
    await commitTransaction(session);
    return { ok: true, message: "Cliente eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const getItems = async (
  { filterId, searchText }: getItemsProps,
  user
) => {
  const pipeline = [];
  const matchStage = { ...getWorkplace(user, true), deleted: false };

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["search_field"] = regex;
  }

  pipeline.push({ $match: matchStage });

  if (!searchText) {
    pipeline.push({ $limit: 3 });
  }

  pipeline.push({
    $addFields: {
      address: { $arrayElemAt: ["$addresses", 0] },
    },
  });

  pipeline.push({
    $project: {
      _id: { $toString: "$_id" },
      name: 1,
      detail: "$email",
      icon: "$kind",
      category: 1,
    },
  });
  const clients = await ClientModel.aggregate(pipeline);

  return clients;
};

export const recalculateSales = async (_id) => {
  const c = await ClientModel.findById(_id);

  const salesServices = await SaleModel.aggregate([
    {
      $match: {
        client_id: c._id,
        deleted: false,
      },
    },
    { $unwind: "$services" },
    {
      $project: {
        _id: { $toString: "$services._id" },
        sale_id: { $toString: "$_id" },
        last_date: "$date",
        vehicle_id: { $toString: "$vehicle_id" },
        vehicle: 1,
        name: "$services.name",
      },
    },
    { $sort: { last_date: -1 } },
  ]);

  const finalServices = {};

  for (let index = 0; index < salesServices.length; index++) {
    const s = salesServices[index];
    const key = `${s._id}${s.vehicle_id}`;
    const alreadyAdded = finalServices[key];
    if (!alreadyAdded) {
      finalServices[key] = s;
    }
  }

  const lastServices = Object.values(finalServices);
  await ClientModel.findByIdAndUpdate(c._id, {
    $set: { last_services: lastServices },
  });
};

export const setCategory = async ({ data }, user) => {
  const { _id, category, alreadySelected } = data;

  await ClientModel.findByIdAndUpdate(_id, {
    category: alreadySelected ? null : category,
  });

  await SaleModel.updateMany(
    { client_id: _id, date: { $gt: new Date() } },
    { $set: { "client.category": alreadySelected ? null : category } }
  );

  revalidatePath("/clients");
  return { ok: true, message: "Categoría modificada" };
};
