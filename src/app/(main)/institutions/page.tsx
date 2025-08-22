import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import InstitutionsTable from "@/components/entities/institutions/InstitutionsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import InstitutionModel from "@/schemas/institutions";

export default async function Institutions({ searchParams }) {
  const { search } = await searchParams;
  await connectDB();
  const pipeline: any = [
    { $match: { deleted: false } },
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        is_financial: 1,
        is_insurance: 1,
        logo_url: 1,
      },
    },
  ];

  if (!!search) {
    const regex = cleanRegExp(search);
    pipeline.unshift({ $match: { name: regex } });
  } else {
    pipeline.push({ $limit: 30 });
  }
  const institutions = await InstitutionModel.aggregate(pipeline);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-auto"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Entidades financieras</CardTitle>
          <MyFormDialog form="institution" />
        </div>
      </CardHeader>
      <CardContent>
        <InstitutionsTable institutions={institutions} />
      </CardContent>
    </Card>
  );
}
