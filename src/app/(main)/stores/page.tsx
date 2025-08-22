import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import connectDB from "@/lib/connectDB";
import { verifySession } from "@/helpers/auth";
import { getWorkplace } from "@/helpers/mdb";
import StoresTable from "@/components/entities/stores/StoresTable";
import StoreModel from "@/schemas/store";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";

export default async function Stores({}) {
  await connectDB();
  const user = await verifySession();
  const stores = await StoreModel.aggregate([
    {
      $match: { ...getWorkplace(user, true), deleted: false },
    },
  ]);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full overflow-scroll no-scrollbar rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <CardTitle className="text-xl">Sucursales</CardTitle>
          </div>
          <MyFormDialog form="store" />
          <MyFormDialog form="store" fieldsIndex={2} hidden />
          <MyFormDialog
            form="store"
            fieldsIndex={3}
            hidden
            action="updateExchangeRate"
          />
        </div>
      </CardHeader>
      <CardContent>
        <StoresTable
          stores={stores.map((s) => ({
            ...s,
            _id: s._id.toString(),
            company_id: s.company_id.toString(),
            whatsapp: s.whatsapp?._id
              ? { _id: s.whatsapp._id.toString(), number: s.whatsapp.number }
              : null,
          }))}
        />
      </CardContent>
    </Card>
  );
}
