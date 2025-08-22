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
    kind,
    firstname,
    lastname,
    email,
    phone,
    country,
    address,
    fiscal_id,
    formatted_number,
    dob,
    brand,
    model,
    patent,
    vehicle_kind,
    insurance,
  } = data;

  const lowerCasePatent = patent?.toLowerCase().replace(/\s+/g, "") || "";

  const isPerson = kind === "person";
  const fullname = isPerson ? `${firstname} ${lastname}` : firstname;
  const client_data = {
    kind,
    firstname,
    lastname: isPerson ? lastname : "",
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
    dob: dob.day
      ? { ...dob, date: new Date(dob.year, dob.month - 1, dob.day) }
      : undefined,
    company_id: user.company._id,
    search_field: cleanText(
      `${fullname} ${email} ${phone} ${lowerCasePatent || ""}`
    ),
    patents: !!lowerCasePatent ? [lowerCasePatent] : [],
  };

  let createdClient, createdVehicle;
  const session = await startTransaction();
  try {
    if (!_id) {
      const newUser = new ClientModel(client_data);
      createdClient = await newUser.save({ session });
      const vehicle_data = {
        client: newUser.getBasicInfo(),
        client_id: newUser._id,
        company_id: user.company._id,
        kind: vehicle_kind,
        insurance,
        brand: {
          _id: brand._id,
          name: brand.name,
          blob_path: `/brands/${toSlug(brand.name)}.png`,
        },
        model,
        patent,
        search_field: cleanText(`${brand.name} ${model} ${patent}`),
      };
      const newVehicle = new VehicleModel(vehicle_data);
      createdVehicle = await newVehicle.save({ session });
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
      await QuoteModel.updateMany(
        { client_id: updatedClient._id, sent: false },
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
            createdVehicleId: createdVehicle._id.toString(),
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
      name: { $concat: ["$firstname", " ", "$lastname"] },
      lat: { $arrayElemAt: ["$address.location.coordinates", 1] },
      lng: { $arrayElemAt: ["$address.location.coordinates", 0] },
      value: "$sales.count",
      detail: "$email",
      icon: "$kind",
      category: 1,
    },
  });
  const clients = await ClientModel.aggregate(pipeline);

  return clients.map((c) => ({
    ...c,
    after_name: c.category
      ? `${CONFIG.blob_url}/clients/${c.category}${c.category === "gold" ? "2" : ""}.png`
      : null,
  }));
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
