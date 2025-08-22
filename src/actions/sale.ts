import {
  abortTransaction,
  commitTransaction,
  getSaleMetadata,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import { CashflowModel } from "@/schemas/cashflow";
import { ClientModel } from "@/schemas/client";
import CompanyModel from "@/schemas/company";
import { QuoteModel } from "@/schemas/quote";
import { SaleModel } from "@/schemas/sale";
import ServiceModel from "@/schemas/service";
import StoreModel from "@/schemas/store";
import { SubscriptionModel } from "@/schemas/subscription";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data }, user) => {
  const session = await startTransaction();
  const editing = !!data._id;

  try {
    let _id = data._id;

    const services = data.services.map((s) => ({
      _id: s._id,
      name: s.name,
      detail: s.detail,
      description: s.description,
      currency: s.currency,
      price: s.value || 0,
      quantity: s.quantity,
      allow_quantity: s.allow_quantity,
    }));

    const discounts = data.discounts.map((d) => {
      return {
        _id: d._id,
        name: d.name,
        kind: d.kind,
        value: d.value,
        currency: d.currency,
        amount: d.amount,
      };
    });

    const salesNetAmount = data.amount - data.discounts_amount;
    const salesNetAmountUSD = data.usd_amount - data.usd_discounts_amount;

    const workers = data.workers.map((w) => {
      const workersCounts = data.workers.length;
      const percentage_to_pay = +(w.sales_percentage / workersCounts).toFixed(
        3
      );
      const amount_to_pay = Math.round(
        (percentage_to_pay / 100) * salesNetAmount
      );
      const usd_amount_to_pay = Math.round(
        (percentage_to_pay / 100) * salesNetAmountUSD
      );
      return {
        member_id: w._id,
        member_email: w.member_email,
        member_name: w.member_name,
        count: workersCounts,
        sales_percentage: w.sales_percentage,
        percentage_to_pay,
        amount_to_pay,
        usd_amount_to_pay,
      };
    });
    const saleMetadata = await getSaleMetadata(data, user);

    const store = await StoreModel.findById(
      user.store._id,
      "allow_automatic_reminders"
    );

    const sale_data = {
      company_id: user.company._id,
      store_id: user.store._id,
      store: user.store,
      services,
      discounts,
      workers,
      discounts_amount: data.discounts_amount,
      amount: data.amount,
      usd_discounts_amount: data.usd_discounts_amount,
      usd_amount: data.usd_amount,
      creator: user,
      quote_id: !!data.quote_id ? data.quote_id : null,
      quote_identifier: data.quote_identifier,
      client_id: data.client._id,
      vehicle_id: data.vehicle._id,
      should_be_reminded: store.allow_automatic_reminders,
      ...saleMetadata,
      location: data?.client?.lng
        ? {
            type: "Point",
            coordinates: [data.client.lng, data.client.lat], // [lng, lat] — ¡importante el orden!
          }
        : null,
    };

    let old_amount = 0;
    let usd_old_amount = 0;

    let added_services = services.map((s) => ({
      _id: s._id,
      amount_inc: s.price * s.quantity,
      count_inc: 1,
    }));
    let updated_services = [];
    let deleted_services = [];

    let final_sale_id = data._id;
    if (editing) {
      const oldSale = await SaleModel.findByIdAndUpdate(_id, sale_data, {
        session,
      });
      old_amount = oldSale.amount;
      usd_old_amount = oldSale.usd_amount;
      if (oldSale.date.toString() !== data.date.toString()) {
        await CashflowModel.updateMany(
          { sale_id: _id },
          {
            sale_date: data.date,
            sale_full_date: sale_data.full_date,
          }
        );
      }
      const new_services_ids = services.map((s) => s._id.toString());
      const old_services_ids = oldSale.services.map((s) => s._id.toString());
      deleted_services = oldSale.services
        .filter((s) => !new_services_ids.includes(s._id.toString()))
        .map((s) => ({
          _id: s._id,
          currency: s.currency,
          amount_inc: -1 * s.price * s.quantity,
          count_inc: -1,
        }));
      added_services = services
        .filter((s) => !old_services_ids.includes(s._id.toString()))
        .map((s) => ({
          _id: s._id,
          currency: s.currency,
          amount_inc: s.price * s.quantity,
          count_inc: 1,
        }));

      updated_services = services
        .filter((s) => old_services_ids.includes(s._id.toString()))
        .map((s) => {
          const oldService = oldSale.services.find(
            (os) => os._id.toString() === s._id.toString()
          );
          return {
            _id: s._id,
            currency: s.currency,
            amount_inc:
              s.price * s.quantity - oldService.price * oldService.quantity,
            count_inc: 0,
          };
        });
    } else {
      const newSale = new SaleModel(sale_data);
      final_sale_id = newSale._id;
      await newSale.save({ session });
      if (newSale.quote_id) {
        await QuoteModel.findByIdAndUpdate(
          newSale.quote_id,
          {
            $set: { sold: true, sold_at: new Date() },
          },
          { session }
        );
      }
      _id = newSale._id;
    }

    const services_updates = [
      ...deleted_services,
      ...added_services,
      ...updated_services,
    ];

    const bulkUpdates = services_updates.map((su) => {
      const fieldStart = su.currency === "usd" ? "sales.usd_" : "sales.";
      return {
        updateOne: {
          filter: { _id: su._id },
          update: {
            $inc: {
              [`${fieldStart}amount`]: su.amount_inc,
              [`${fieldStart}count`]: su.count_inc,
            },
          },
        },
      };
    });

    const inc_amount = data.amount - old_amount;
    const usd_inc_amount = data.usd_amount - (usd_old_amount || 0);
    const inc_count = editing || inc_amount === 0 ? 0 : 1;
    const usd_inc_count = editing || usd_inc_amount === 0 ? 0 : 1;

    const client = await ClientModel.findById(data.client._id).session(session);
    let currentLastServices = client.last_services || [];

    for (let index = 0; index < services.length; index++) {
      const service = services[index];
      const lastTime = await SaleModel.findOne(
        {
          client_id: data.client._id,
          "services._id": service._id,
          vehicle_id: data.vehicle._id,
          deleted: false,
        },
        "date vehicle"
      ).sort({ date: -1 });
      const inCurrentServices = currentLastServices.find(
        (cls) => cls._id === service._id && cls.vehicle_id === data.vehicle._id
      );

      // Era la 1era vez, y le quitaron el servicio
      if (!lastTime || !inCurrentServices) {
        currentLastServices.push({
          _id: service._id,
          sale_id: final_sale_id,
          vehicle_id: data.vehicle._id,
          vehicle: saleMetadata.vehicle,
          name: service.name,
          last_date: data.date,
        });
      } else {
        const newServiceInTheFuture = lastTime.date < data.date;
        const lastTimeIsSaleBeingEdited = lastTime._id.toString() === data._id;

        currentLastServices = currentLastServices.map((cls) => {
          if (cls._id === service._id && cls.vehicle_id === data.vehicle._id) {
            return {
              ...cls.toObject(),
              last_date:
                newServiceInTheFuture && !lastTimeIsSaleBeingEdited
                  ? data.date
                  : lastTime.date,
            };
          } else {
            return cls;
          }
        });
      }
    }

    for (let index = 0; index < deleted_services.length; index++) {
      const service = deleted_services[index];
      const lastTime = await SaleModel.findOne(
        {
          _id: { $ne: toObjectId(data._id) },
          client_id: data.client._id,
          "services._id": service._id,
          vehicle_id: data.vehicle._id,
          deleted: false,
        },
        "date vehicle"
      ).sort({ date: -1 });
      // Era la 1era vez, y le quitaron el servicio
      if (!lastTime) {
        currentLastServices = currentLastServices.filter(
          (cls) =>
            cls._id === service._id.toString() &&
            cls.vehicle_id === data.vehicle._id
        );
      } else {
        currentLastServices = currentLastServices.map((cls) => {
          if (
            cls._id === service._id.toString() &&
            cls.vehicle_id === data.vehicle._id
          ) {
            return {
              ...cls.toObject(),
              last_date: lastTime.date,
            };
          } else {
            return cls;
          }
        });
      }
    }

    await Promise.all([
      ServiceModel.bulkWrite(bulkUpdates, { session }),
      ClientModel.findByIdAndUpdate(
        data.client._id,
        {
          $inc: {
            "sales.amount": inc_amount,
            "sales.usd_amount": usd_inc_amount,
            "sales.count": inc_count,
            "sales.usd_count": usd_inc_count,
          },
          $set: {
            "sales.last_one": data.date,
            last_services: currentLastServices,
          },
        },
        { session }
      ),
      CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $inc: {
            "statistics.sales_amount": inc_amount,
            "statistics.usd_sales_amount": usd_inc_amount,
            "statistics.sales": inc_count,
            "statistics.usd_sales": usd_inc_count,
          },
          $set: {
            "statistics.last_interaction": "Creación venta",
          },
        },
        { session }
      ),
      StoreModel.findByIdAndUpdate(
        user.store._id,
        {
          $inc: {
            "sales.amount": inc_amount,
            "sales.usd_amount": usd_inc_amount,
            "sales.count": inc_count,
            "sales.usd_count": usd_inc_count,
          },
        },
        { session }
      ),
    ]);

    await commitTransaction(session);

    revalidatePath("/washes");
    return { ok: true, message: editing ? "Venta editada" : "Venta creada" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const finish = async ({ data }, user) => {
  const { _id, finished } = data;
  await SaleModel.findByIdAndUpdate(_id, {
    finished,
    finished_at: new Date(),
  });

  revalidatePath("/washes");
  return { ok: true, message: "Lavado finalizado" };
};
export const setColor = async ({ data }, user) => {
  const { _id, color, alreadySelected } = data;

  await SaleModel.findByIdAndUpdate(_id, {
    color: alreadySelected ? null : color,
  });

  revalidatePath("/washes");
  return { ok: true, message: "Color modificado" };
};
export const takenAway = async ({ data }, user) => {
  const { _id, takenAway } = data;
  const session = await startTransaction();
  const now = new Date();

  try {
    const updatedSale = await SaleModel.findByIdAndUpdate(
      _id,
      {
        taken_away: takenAway,
        taken_away_at: now,
      },
      { new: true, session }
    );

    if (!updatedSale.finished) {
      updatedSale.finished = true;
      updatedSale.finished_at = now;
      await updatedSale.save({ session });
    }

    await commitTransaction(session);
    revalidatePath("/washes");
    return { ok: true, message: "Vehículo entregado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const resetSales = async ({}, user) => {
  const session = await startTransaction();
  const sub = await SubscriptionModel.findOne({
    company_id: toObjectId(user.company._id),
  });
  if (sub && sub.active) {
    return {
      ok: false,
      message:
        "No puedes resetear las ventas una vez que tienes una suscripción activa",
    };
  }
  try {
    await SaleModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      { $set: { deleted: true } },
      { session }
    );
    await ClientModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      {
        $set: {
          sales: {
            count: 0,
            amount: 0,
            usd_count: 0,
            usd_amount: 0,
            last_one: null,
          },
          last_services: [],
        },
      },
      { session }
    );
    await StoreModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      { $set: { sales: { count: 0, amount: 0, usd_count: 0, usd_amount: 0 } } },
      { session }
    );
    await ServiceModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      { $set: { sales: { count: 0, amount: 0, usd_count: 0, usd_amount: 0 } } },
      { session }
    );
    await CashflowModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      { $set: { deleted: true } },
      { session }
    );
    await QuoteModel.updateMany(
      { company_id: toObjectId(user.company._id) },
      { $set: { deleted: true } },
      { session }
    );

    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.resets": 1,
        },
        $set: {
          "statistics.last_interaction": "Reseteo ventas",
        },
      },
      { session }
    );
    await commitTransaction(session);
    revalidatePath("/");
    return { ok: true, message: "Movimientos reseteados" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();
  try {
    const date = new Date();
    const deleted = await SaleModel.findByIdAndUpdate(
      _id,
      {
        deleted: true,
        deleted_at: date,
        deleted_by: user._id,
      },
      { session }
    );

    await CompanyModel.findByIdAndUpdate(
      user.company._id,
      {
        $inc: {
          "statistics.sales_deleted": 1,
        },
      },
      { session }
    );

    await CashflowModel.updateMany(
      { sale_id: deleted._id },
      {
        $set: {
          deleted: true,
          deleted_at: date,
          deleted_by: user._id,
        },
      },
      { session }
    );

    if (deleted.quote_id) {
      await QuoteModel.findByIdAndUpdate(
        deleted.quote_id,
        {
          $set: {
            sold: false,
            sold_at: null,
            sale: null,
          },
        },
        { session }
      );
    }

    const client = await ClientModel.findById(deleted.client_id).session(
      session
    );
    let currentLastServices = client.last_services || [];
    for (let index = 0; index < deleted.services.length; index++) {
      const service = deleted.services[index];
      const isUSD = service.currency === "usd";
      const coef = -1;
      const serviceAmount = coef * service.price * service.quantity;
      await ServiceModel.findByIdAndUpdate(
        service._id,
        {
          $inc: {
            "sales.count": isUSD ? 0 : coef,
            "sales.amount": isUSD ? 0 : serviceAmount,
            "sales.usd_count": isUSD ? coef : 0,
            "sales.usd_amount": isUSD ? serviceAmount : 0,
          },
        },
        { session }
      );
      const lastTime = await SaleModel.findOne(
        {
          _id: { $ne: deleted._id },
          client_id: deleted.client_id,
          "services._id": service._id,
          vehicle_id: deleted.vehicle_id,
          deleted: false,
        },
        "date vehicle"
      ).sort({ date: -1 });
      // Era la 1era vez, y le quitaron el servicio
      if (!lastTime) {
        currentLastServices = currentLastServices.filter(
          (cls) =>
            cls._id === service._id.toString() &&
            cls.vehicle_id === deleted.vehicle_id.toString()
        );
      } else {
        currentLastServices = currentLastServices.map((cls) => {
          if (
            cls._id === service._id.toString() &&
            cls.vehicle_id === deleted.vehicle_id.toString()
          ) {
            return {
              ...cls.toObject(),
              last_date: lastTime.date,
            };
          } else {
            return cls;
          }
        });
      }
    }
    const hadAmount = deleted.amount > 0;
    const hadUSDAmount = deleted.usd_amount > 0;

    const statsUpdate = {
      "sales.count": hadAmount ? -1 : 0,
      "sales.amount": hadAmount ? -1 * deleted.amount : 0,
      "sales.usd_count": hadUSDAmount ? -1 : 0,
      "sales.usd_amount": hadUSDAmount ? -1 * deleted.usd_amount : 0,
    };

    await StoreModel.findByIdAndUpdate(
      deleted.store_id,
      {
        $inc: statsUpdate,
      },
      { session }
    );
    await ClientModel.findByIdAndUpdate(
      deleted.client_id,
      {
        $inc: statsUpdate,
        $set: { last_services: currentLastServices },
      },
      { session }
    );
    await commitTransaction(session);
    revalidatePath("/washes");
    return { ok: true, message: "Venta eliminada" };
  } catch (error) {
    console.log({ error });
    await abortTransaction(session);
    throw error;
  }
};
