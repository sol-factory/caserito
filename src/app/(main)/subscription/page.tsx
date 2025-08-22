import SubscriptionDetail from "@/components/entities/subscriptions/SubscriptionDetail";
import SubscriptionForm from "@/components/entities/subscriptions/SubscriptionForm";
import { verifySession } from "@/helpers/auth";
import { toObjectId } from "@/helpers/mdb";
import connectDB from "@/lib/connectDB";
import { SubscriptionModel } from "@/schemas/subscription";

export default async function Subscription() {
  await connectDB();
  const user = await verifySession();
  const pipeline: any = [
    {
      $match: {
        store_id: toObjectId(user.store?._id),
        status: {
          $in: ["pending", "PENDING", "authorized", "ACTIVE", "paused"],
        },
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        provider: 1,
        automatic: 1,
        messages: 1,
        quotes: 1,
        files: 1,
        amount: 1,
        active: 1,
        status: 1,
        createdAt: 1,
        subscription_id: 1,
        details: 1,
      },
    },
    { $sort: { createdAt: -1 } }, // Ordenar por fecha de creación descendente
  ];

  const [dbSub] = await SubscriptionModel.aggregate(pipeline);

  // const client = new MercadoPagoConfig({
  //   accessToken: process.env.MP_ACCESS_TOKEN,
  //   options: { timeout: 5000, idempotencyKey: "abc" },
  // });

  // const payment = new Payment(client);
  // const data = await payment.get({ id: 117528833128 });
  // console.log({ data });

  return (
    <>
      <SubscriptionDetail dbSub={dbSub} />
      <SubscriptionForm dbSub={dbSub} />
    </>
  );
}
