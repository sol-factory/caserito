import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import DiscountsTable from "@/components/entities/discounts/DiscountsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/helpers/auth";
import { getWorkplace } from "@/helpers/mdb";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import DiscountModel from "@/schemas/discount";

export default async function Discounts({ searchParams }) {
  const { search } = await searchParams;
  await connectDB();
  const user = await verifySession();
  const pipeline: any = [
    { $match: { ...getWorkplace(user, true), deleted: false } },
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        kind: 1,
        name: 1,
        value: 1,
        locked: 1,
        stores: {
          $map: {
            input: "$stores",
            as: "store",
            in: {
              _id: {
                $convert: { input: "$$store._id", to: "string" },
              },
              name: "$$store.name",
            },
          },
        },
      },
    },
  ];

  if (!!search) {
    const regex = cleanRegExp(search);
    pipeline.unshift({ $match: { name: regex } });
  } else {
    pipeline.push({ $limit: 20 });
  }
  const discounts = await DiscountModel.aggregate(pipeline);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-auto"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Descuentos</CardTitle>
          <MyFormDialog form="discount" invalidateQueries />
        </div>
      </CardHeader>
      <CardContent>
        <DiscountsTable discounts={discounts} />
      </CardContent>
    </Card>
  );
}
