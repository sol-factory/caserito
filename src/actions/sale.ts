import {
  abortTransaction,
  commitTransaction,
  getSaleMetadata,
  startTransaction,
} from "@/helpers/mdb";
import { CashflowModel } from "@/schemas/cashflow";
import CompanyModel from "@/schemas/company";
import { SaleModel } from "@/schemas/sale";
import StoreModel from "@/schemas/store";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data }, user) => {
  const session = await startTransaction();
  const editing = !!data._id;

  try {
    let _id = data._id;

    const saleMetadata = await getSaleMetadata(data, user);

    const sale_data = {
      company_id: user.company._id,
      store_id: user.store._id,
      store: user.store,
      amount: data.amount,
      kind: data.kind,
      category: data.category,
      sub_category: data.sub_category,
      creator: user,
      ...saleMetadata,
      search_field: `${data.category.name} ${data.sub_category.name}`,
    };

    let old_amount = 0;

    let final_sale_id = data._id;
    if (editing) {
      const oldSale = await SaleModel.findByIdAndUpdate(_id, sale_data, {
        session,
      });
      old_amount = oldSale.amount;
      if (oldSale.date.toString() !== data.date.toString()) {
        await CashflowModel.updateMany(
          { sale_id: _id },
          {
            sale_date: data.date,
            sale_full_date: sale_data.full_date,
          }
        );
      }
    } else {
      const newSale = new SaleModel(sale_data);
      final_sale_id = newSale._id;
      await newSale.save({ session });
      _id = newSale._id;
    }

    await commitTransaction(session);

    revalidatePath("/washes");
    return { ok: true, message: editing ? "Venta editada" : "Venta creada" };
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

    const hadAmount = deleted.amount > 0;

    const statsUpdate = {
      "sales.count": hadAmount ? -1 : 0,
      "sales.amount": hadAmount ? -1 * deleted.amount : 0,
    };

    await StoreModel.findByIdAndUpdate(
      deleted.store_id,
      {
        $inc: statsUpdate,
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
