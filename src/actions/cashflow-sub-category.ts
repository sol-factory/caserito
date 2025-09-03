"use server";
import { CashflowModel, CashflowSubCategoryModel } from "@/schemas/cashflow";
import { revalidatePath } from "next/cache";
import {
  abortTransaction,
  commitTransaction,
  startTransaction,
  toObjectId,
} from "@/helpers/mdb";
import CompanyModel from "@/schemas/company";

export const upsert = async ({ data }, user) => {
  const { _id, category, name } = data;

  const session = await startTransaction();

  try {
    const sub_category_data = {
      category,
      name,
      company_id: user.company._id,
      store_id: user.company._id,
    };
    if (_id) {
      const prevSubCategory = await CashflowSubCategoryModel.findById(_id);
      const editingPredefinedSubCategory = !prevSubCategory.company_id;
      if (editingPredefinedSubCategory) {
        await CompanyModel.findByIdAndUpdate(
          user.company._id,
          {
            $addToSet: { hiddenCashflowSubCategories: prevSubCategory._id },
          },
          { session }
        );
        const newCashflowSubCategory = new CashflowSubCategoryModel(
          sub_category_data
        );
        await newCashflowSubCategory.save({ session });
        await CashflowModel.updateMany(
          {
            company_id: toObjectId(user.company._id),
            "sub_category._id": prevSubCategory._id,
          },
          { $set: { sub_category: newCashflowSubCategory } }
        );
      } else {
        await CashflowSubCategoryModel.findByIdAndUpdate(
          _id,
          sub_category_data,
          {
            session,
          }
        );
        await CashflowModel.updateMany(
          {
            company_id: toObjectId(user.company._id),
            "sub_category._id": _id,
          },
          { $set: { "sub_category.name": sub_category_data?.name } }
        );
      }
    } else {
      const newCashflowSubCategory = new CashflowSubCategoryModel(
        sub_category_data
      );

      await newCashflowSubCategory.save({ session });
    }
    await commitTransaction(session);
    revalidatePath("/cashflows");
    return {
      ok: true,
      message: `Categoría ${_id ? "editada" : "creada"}`,
    };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};

export const remove = async (_id: string, user) => {
  const session = await startTransaction();

  try {
    const prevSubCategory = await CashflowSubCategoryModel.findById(_id);
    const editingPredefinedSubCategory = !prevSubCategory.company_id;
    if (editingPredefinedSubCategory) {
      await CompanyModel.findByIdAndUpdate(
        user.company._id,
        {
          $addToSet: { hiddenCashflowSubCategories: prevSubCategory._id },
        },
        { session }
      );
    } else {
      await CashflowSubCategoryModel.findByIdAndUpdate(
        _id,
        {
          deleted: true,
          deleted_at: new Date(),
          deleted_by: user._id,
        },
        { session }
      );
    }

    revalidatePath("/washes");
    await commitTransaction(session);
    return { ok: true, message: "Cobro eliminado" };
  } catch (error) {
    await abortTransaction(session);
    throw error;
  }
};
