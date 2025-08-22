import { SubscriptionPlanModel } from "@/schemas/subscription";

export const getItems = async ({ isMP, wspNumberId, kind }, user) => {
  const filters: any = {
    provider: isMP ? "mp" : "paypal",
    countries: user.geo.country,
    kind,
  };

  let plans = [];
  if (!wspNumberId) {
    plans = await SubscriptionPlanModel.find(filters);
  } else {
    plans = await SubscriptionPlanModel.find(filters).sort({ messages: 1 });
  }

  return plans.map((p) => ({ ...p.toObject(), _id: p._id.toString() }));
};
