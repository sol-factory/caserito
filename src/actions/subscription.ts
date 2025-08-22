import { toObjectId } from "@/helpers/mdb";
import { createDebtPaymentLink } from "@/helpers/subscription";
import CompanyModel from "@/schemas/company";
import { ErrorModel } from "@/schemas/error";
import { SubscriptionModel } from "@/schemas/subscription";

export const getByCompanyId = async ({ companyId, wspNumberId }) => {
  const sub = await SubscriptionModel.findOne({
    company_id: companyId,
  });
  return !!sub
    ? {
        ...sub.toObject(),
        _id: sub._id?.toString(),
        company_id: sub.company_id?.toString(),
      }
    : null;
};

export const applyDiscount = async ({ discountCode }, user) => {
  if (discountCode === "LANZAMIENTO") {
    return { ok: true, data: 0.3, message: "Descuento aplicado" };
  } else {
    return { ok: false, message: "Código incorrecto" };
  }
};

export const getSubscriptionInfo = async ({}, user) => {
  const [sub] = await SubscriptionModel.aggregate([
    {
      $match: {
        store_id: toObjectId(user.store._id),
        status: { $in: ["ACTIVE", "authorized", "pending", "PENDING"] },
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        messages: "$messages.limits.month.max",
        messages_count: "$messages.limits.month.count",
        messages_start_date: "$messages.limits.month.start_date",
        quotes: "$quotes.limit.max",
        quotes_count: "$quotes.limit.count",
        files: "$files.limit.max",
        files_count: "$files.limit.count",
        amount: 1,
        active: 1,
        status: 1,
        details: 1,
      },
    },
  ]);
  const company = await CompanyModel.findById(
    user.company._id,
    "trial_start_date"
  );

  return {
    ok: true,
    data: sub
      ? { ...sub, trial_start_date: company?.trial_start_date }
      : { active: false, trial_start_date: company?.trial_start_date },
  };
};

export async function reactivate({ _id, amount }, user) {
  try {
    const init_point = await createDebtPaymentLink({
      preapproval_id: _id,
      debt: amount,
    });

    return { ok: true, data: init_point };
  } catch (error) {
    console.log({ error });
    await ErrorModel.create({
      entity: "mp-sub-error",
      error_message: error?.message,
      body: _id,
      user,
      metadata: error,
    });
    return { ok: false, message: "Hubo un error al reactivar la suscripción" };
  }
}
