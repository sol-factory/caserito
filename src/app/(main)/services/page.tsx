import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ServicesTable from "@/components/entities/services/ServicesTable";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { verifySession } from "@/helpers/auth";
import { getBooleanRoles } from "@/helpers/permissions";
import { cleanRegExp } from "@/helpers/text";
import { getWorkplace } from "@/helpers/mdb";
import ServiceModel from "@/schemas/service";
import connectDB from "@/lib/connectDB";
import { DialogTitle } from "@radix-ui/react-dialog";
import VehiclesClasificationsTable from "@/components/entities/services/VehiclesClasificationsTable";
import VehicleKindModel from "@/schemas/vehicle-kind";

export default async function Services({ searchParams }) {
  await connectDB();
  const user = await verifySession();

  const { search } = await searchParams;

  const matchStage = { ...getWorkplace(user, true), deleted: false };
  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    matchStage["search_field"] = regex;
  }

  const services = await ServiceModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1, // Concatenar los campos
        detail: 1,
        currency: 1,
        prices: {
          $map: {
            input: "$prices",
            as: "price",
            in: {
              _id: {
                $convert: { input: "$$price._id", to: "string" },
              },
              name: "$$price.vehicle_kind",
              classification_id: "$$price.classification_id",
              value: "$$price.price",
            },
          },
        },
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
        sales: 1,
        quotes_description: 1,
        duplicated: 1,
        allow_quantity: 1,
        duplicated_from: { $toString: "$duplicated_from" },
      },
    },
    { $sort: { name: 1 } },
  ]);
  const { isOwner } = getBooleanRoles(user);

  const vehiclesKindCount = await VehicleKindModel.countDocuments({
    company_id: user.company._id,
    deleted: false,
  });

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none flex flex-col relative max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-hidden"
    >
      <CardHeader className="flex-shrink-0 sticky top-0 bg-white z-10">
        <div className="sticky top-0 flex items-center justify-between">
          <CardTitle className="text-xl">Servicios</CardTitle>
          <div className="flex gap-2">
            {isOwner && (
              <MyFormDialog
                form="vehicle-kind"
                invalidateQueries
                automaticClose={false}
                variant="secondary"
                buttonText="Clasificación vehículos"
                icon="shapes"
              >
                <DialogTitle className="font-semibold text-lg">
                  Clasificaciones de vehículos
                </DialogTitle>

                <VehiclesClasificationsTable />
              </MyFormDialog>
            )}

            <MyFormDialog
              form="service"
              hidden={!isOwner}
              user={user}
              disabledMessage={
                vehiclesKindCount === 0
                  ? "Para crear servicios primero debes configurar 1 o más clasificaciones de vehículos. Ver tutoriales 3 y 4."
                  : ""
              }
            />
            <MyFormDialog
              form="service"
              titleName={"configuraciones"}
              fieldsIndex={1}
              hidden
              user={user}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-y-auto flex-1">
        <ServicesTable services={services} />
      </CardContent>
    </Card>
  );
}
