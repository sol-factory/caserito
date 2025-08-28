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

    if (editing) {
      const oldSale = await SaleModel.findByIdAndUpdate(data._id, sale_data, {
        session,
      });
      old_amount = oldSale.amount;
      if (oldSale.date.toString() !== data.date.toString()) {
        await CashflowModel.updateMany(
          { sale_id: data._id },
          {
            sale_date: data.date,
            sale_full_date: sale_data.full_date,
          }
        );
      }
    } else {
      const newSale = new SaleModel(sale_data);
      const created = await newSale.save({ session });
      const wallet = data.wallet;
      if (wallet._id) {
        await CashflowModel.create({
          company_id: user.company._id,
          store_id: user.store._id,
          store: user.store,
          amount: data.kind === "income" ? 1 : -1 * data.amount,
          kind: data.kind,
          category: data.category,
          sub_category: data.sub_category,
          wallet: { ...wallet, logo_url: wallet.pre_name },
          currency: "ars",
          sale_id: newSale._id,
          ...saleMetadata,
        });
        const updated = await SaleModel.findByIdAndUpdate(
          created._id,
          {
            gathered_amount: created.amount,
          },
          { session }
        );
      }
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
