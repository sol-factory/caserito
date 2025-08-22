import { getWorkplace, toObjectId } from "@/helpers/mdb";
import { SaleModel } from "@/schemas/sale";

export const getItems = async (form, user) => {
  const salesReport = await SaleModel.aggregate([
    {
      $match: {
        deleted: false,
        date: { $gt: new Date(2024, 8, 1) },
        ...getWorkplace(user, true),
      },
    },
    {
      $group: {
        _id: {
          day: "$full_date.day",
          month: "$full_date.month",
          year: "$full_date.year",
        },
        sold: { $sum: "$amount" },
        gathered: { $sum: "$gathered_amount" },
      },
    },
    {
      $project: {
        date: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            { $toString: "$_id.month" },
            "-",
            { $toString: "$_id.day" },
          ],
        },
        day: "$_id.day",
        month: "$_id.month",
        year: "$_id.year",
        gathered: 1,
        sold: 1,
      },
    },
    { $sort: { year: 1, month: 1, day: 1 } },
  ]);
  return { ok: true, data: salesReport, message: "¡Lavado creado!" };
};
