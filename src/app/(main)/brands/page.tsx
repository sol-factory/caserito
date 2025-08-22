import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import BrandsTable from "@/components/entities/brands/BrandsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import BrandModel from "@/schemas/brand";

export default async function Brands({ searchParams }) {
  const { search } = await searchParams;
  await connectDB();
  const pipeline: any = [
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        vehicles: 1,
        logo_url: 1,
      },
    },
  ];

  if (!!search) {
    const regex = cleanRegExp(search);
    pipeline.unshift({ $match: { name: regex } });
  } else {
    pipeline.push({ $limit: 10 });
  }
  const brands = await BrandModel.aggregate(pipeline);
  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-auto"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Marcas</CardTitle>
          <MyFormDialog form="brand" />
        </div>
      </CardHeader>
      <CardContent>
        <BrandsTable brands={brands} />
      </CardContent>
    </Card>
  );
}
