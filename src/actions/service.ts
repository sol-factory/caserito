import { COUNTRIES } from "@/config/constanst";
import {
  abortTransaction,
  commitTransaction,
  getWorkplace,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import { cleanRegExp, cleanText } from "@/helpers/text";
import CompanyModel from "@/schemas/company";
import { QuoteModel } from "@/schemas/quote";
import { SaleModel } from "@/schemas/sale";
import ServiceModel from "@/schemas/service";
import { VehicleModel } from "@/schemas/vehicle";
import VehicleKindModel from "@/schemas/vehicle-kind";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data }, user) => {
  const {
    _id,
    name,
    stores,
    prices,
    currency,
    detail,
    allow_quantity,
    quotes_description,
    duplicated_from,
  } = data;

  const finalPrices = prices.map((p) => ({
    _id: p._id,
    vehicle_kind: p.name,
    classification_id: p.classification_id,
    price: p.value || 0,
  }));

  const session = await startTransaction();

  try {
    const alreadyExists = await ServiceModel.findOne({
      _id: { $ne: _id },
      company_id: user.company._id,
      name,
      detail,
      deleted: false,
    });
    if (!!alreadyExists) {
      abortTransaction(session);
      return {
        ok: false,
        message:
          "Ya creaste un servicio con esta denominación. Recordá que dentro de un mismo servicio podés indicar precios para varias clasificaciones de vehículo.",
      };
    }
    if (!_id) {
      const newService = new ServiceModel({
        name: name,
        detail,
        prices: finalPrices,
        stores,
        currency,
        allow_quantity,
        quotes_description,
        creator: user,
        search_field: cleanText(`${name} ${detail}`),
        company_id: user.company._id,
      });
      await newService.save({ session });
      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.services": 1,
          },
          $set: {
            "statistics.last_interaction": "Creación servicio",
          },
        },
        { session }
      );
    } else {
      let stillDuplicated = false;
      let originalService;
      if (duplicated_from) {
        originalService = await ServiceModel.findById(
          duplicated_from,
          "name detail"
        );
        stillDuplicated =
          originalService.name === name && originalService.detail === detail;
      }
      originalService = await ServiceModel.findById(_id, "currency");
      if (originalService.currency !== currency) {
        const salesCount = await SaleModel.countDocuments({
          "services._id": _id,
        });
        if (salesCount > 0) {
          abortTransaction(session);
          return {
            ok: false,
            message:
              "No se puede editar la moneda de este servicio porque ya tuvo ventas en dicha moneda.",
          };
        }
        const quotesCount = await QuoteModel.countDocuments({
          "services._id": _id,
        });
        if (quotesCount > 0) {
          abortTransaction(session);
          return {
            ok: false,
            message:
              "No se puede editar la moneda de este servicio porque ya tuvo presupuestos en dicha moneda.",
          };
        }
      }

      const updatedService = await ServiceModel.findByIdAndUpdate(
        _id,
        {
          name: name,
          detail,
          prices: finalPrices,
          currency,
          stores,
          allow_quantity,
          quotes_description,
          search_field: cleanText(`${name} ${detail}`),
          duplicated: stillDuplicated,
        },
        { session }
      );

      // No actualizamos ni precios ni currency
      await SaleModel.updateMany(
        { "services._id": updatedService._id },
        {
          $set: {
            "services.$.name": name,
            "services.$.detail": detail,
            "services.$.allow_quantity": allow_quantity,
          },
        },
        { session }
      );
      await QuoteModel.updateMany(
        { "services._id": updatedService._id, sent: false },
        {
          $set: {
            "services.$.quotes_description": quotes_description,
          },
        },
        { session }
      );
    }
    await commitTransaction(session);
    revalidatePath("/services");
    return {
      ok: true,
      message: `¡Servicio ${_id ? "editado" : "creado"} con éxito!`,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();
  try {
    await ServiceModel.findByIdAndUpdate(
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
          "statistics.services": -1,
        },
      },
      { session }
    );

    revalidatePath("/services");
    await commitTransaction(session);
    return { ok: true, message: "Servicio eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const duplicate = async ({ data }, user) => {
  const { _id } = data;

  const service = await ServiceModel.findById(_id, {
    name: 1,
    prices: 1,
    allow_quantity: 1,
    company_id: 1,
    stores: 1,
    currency: 1,
  });

  const newService = {
    name: service.name,
    prices: service.prices,
    company_id: service.company_id,
    stores: service.stores,
    allow_quantity: service.allow_quantity,
    currency: service.currency,
    duplicated: true,
    duplicated_from: service._id,
  };

  await ServiceModel.create(newService);
  revalidatePath("/services");
  return { ok: true, message: "Servicio duplicado" };
};

export type getItemsProps = {
  filterId: string | undefined;
  searchText: string | undefined;
  allow_multi_currency?: boolean;
};

export const getItems = async (
  { filterId, searchText, allow_multi_currency, store_country_code },
  user
) => {
  const matchStage = {
    ...getWorkplace(user, false, true),
    deleted: false,
    duplicated: false,
  };

  const vehicle = await VehicleModel.findById(filterId);

  if (!!searchText) {
    const regex = cleanRegExp(searchText);
    matchStage["name"] = regex;
  }
  let pipeline: any = [{ $match: matchStage }];
  let vehicle_kind;
  if (vehicle?.kind?._id) {
    vehicle_kind = await VehicleKindModel.findOne({
      _id: vehicle.kind._id,
      deleted: false,
    });

    pipeline = pipeline.concat({ $unwind: "$prices" });
    pipeline = pipeline.concat({
      $match: { "prices._id": toObjectId(vehicle.kind._id) },
    });
  }

  const country = COUNTRIES.find((c) => c.code === store_country_code);
  pipeline = pipeline.concat({
    $project: {
      _id: { $convert: { input: "$_id", to: "string" } },
      name: "$name", // Concatenar los campos
      pre_name: {
        $cond: {
          if: { $eq: ["$currency", "usd"] },
          then: "🇺🇸",
          else:
            country?.code === "AR" && allow_multi_currency ? country.flag : "",
        },
      },
      detail: 1,
      currency: 1,
      quotes_description: 1,
      value: !!vehicle_kind ? `$prices.price` : 1,
      allow_quantity: 1,
    },
  });
  pipeline = pipeline.concat({ $sort: { name: 1 } });

  const services = await ServiceModel.aggregate(pipeline);

  return services.map((s) => ({ ...s, quantity: 1 }));
};
