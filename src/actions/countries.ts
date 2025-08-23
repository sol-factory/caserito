import CountryModel from "@/schemas/countries";
import { UserModel } from "@/schemas/user";

export const getItems = async ({ filterId, searchText }, user) => {
  let pipeline = [];
  const userDB = await UserModel.findById(user._id, "geo");

  if (!!userDB.geo.country) {
    pipeline = pipeline.concat({ $match: { used_in: userDB.geo.country } });
  }

  pipeline = pipeline.concat([
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        code: 1,
        flag: 1,
        phone_code: 1,
        is_user_country: {
          $cond: [{ $eq: ["$code", userDB.geo.country] }, true, false],
        },
      },
    },
    { $sort: { name: 1 } },
  ]);

  const countries = await CountryModel.aggregate(pipeline);

  return countries;
};
