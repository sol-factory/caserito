import RoleModel from "@/schemas/role";

export const getItems = async ({ filterId, searchText }) => {
  const brands = await RoleModel.aggregate([
    { $project: { _id: { $toString: "$_id" }, name: 1, order: 1 } },
    { $sort: { order: 1 } },
  ]);

  return brands;
};
