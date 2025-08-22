import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import DropdownFilter from "@/components/custom-ui/DropdownFilter";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { MyPagination } from "@/components/custom-ui/MyPagination";
import ClientsTable from "@/components/entities/clients/ClientsTable";
import DropdownDaysAgo from "@/components/entities/clients/DropdownDaysAgo";
import { ServicesDropdown } from "@/components/entities/clients/ServicesDropdown";
import ViewDropdown from "@/components/entities/sales/ViewDropdown";
import VehiclesTable from "@/components/entities/vehicles/VehiclesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/helpers/auth";
import { getWorkplace } from "@/helpers/mdb";
import { getBooleanRoles } from "@/helpers/permissions";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import { ClientModel } from "@/schemas/client";
import { addDays } from "date-fns";
import { redirect } from "next/navigation";

export default async function Clients({ searchParams }) {
  await connectDB();
  const user = await verifySession();
  const { search, service_id, days_ago, month, page = 1 } = await searchParams;

  const matchStage = { ...getWorkplace(user, true), deleted: false };

  const clientsCount = await ClientModel.countDocuments(matchStage);
  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    matchStage["search_field"] = regex;
  }

  if (!!days_ago && !!service_id) {
    matchStage["last_services"] = {
      $elemMatch: {
        _id: service_id,
        last_date: { $lt: addDays(new Date(), -days_ago) },
      },
    };
  }

  if (!!month) {
    matchStage["dob.month"] = +month;
  }
  const [result] = await ClientModel.aggregate([
    { $match: matchStage },
    { $group: { _id: null, count: { $sum: 1 } } },
  ]);

  const page_size = 10;
  const total_pages = Math.ceil((result?.count || 0) / page_size);
  const skip = page_size * (page - 1);

  if (skip > 0 && +page > total_pages) {
    redirect("/clients");
  }

  const pipeline: any = [
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        kind: 1,
        firstname: 1,
        lastname: 1,
        address: 1,
        country: "$phone.country",
        country_code: "$phone.country_code",
        fiscal_id: 1,
        category: 1,
        phone: { $ifNull: ["$phone.phone", ""] },
        formatted_number: { $ifNull: ["$phone.formatted_number", ""] },
        last_messages: {
          $map: {
            input: "$last_messages",
            as: "message",
            in: {
              template_name: "$$message.template_name",
              sender_email: "$$message.sender_email",
              sent_at: "$$message.sent_at",
            },
          },
        },
        last_services: days_ago ? 1 : -1,
        attachments_count: { $size: { $ifNull: ["$attachments", []] } },
        dob: 1,
        email: 1,
        sales: 1,
      },
    },
    { $sort: { firstname: 1, lastname: 1 } },
    { $skip: skip },
    { $limit: page_size },
  ];

  if (!!month) {
    pipeline.push({ $sort: { "dob.day": -1 } });
  }

  const clients = await ClientModel.aggregate(pipeline);
  const { isOwner } = getBooleanRoles(user);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none flex flex-col min-h-[20rem] max-h-[50rem] overflow-hidden rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              {!search && <CardTitle className="text-xl">Clientes</CardTitle>}
              {!!search && (
                <CardTitle className="text-xl">Clientes encontrados</CardTitle>
              )}
              <ViewDropdown
                screen="clients"
                count={
                  !month && !search && !days_ago ? clientsCount : clients.length
                }
                counts={{ birthday: clients.length, all: clientsCount }}
              />
            </div>
          </div>

          <MyFormDialog form="client" afterForm user={user}>
            <VehiclesTable isOwner={isOwner} />
          </MyFormDialog>
          <MyFormDialog
            form="vehicle"
            hidden
            dialogToOpen="client"
            invalidateQueries
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        <div className="flex items-end sm:items-center mt-4 -mb-2">
          {!!search && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex">
                <span className="font-bold underline">Búsqueda</span>:
              </div>
              <span className="text-blue-400 font-light sm:ml-1">{search}</span>
              <CleanUrlFilters />
            </div>
          )}
          {!!month && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex">
                <span className="font-bold underline">Mes de cumpleaños</span>:
              </div>

              <DropdownFilter />
              <CleanUrlFilters />
            </div>
          )}
          {!!days_ago && !!service_id && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex flex-col">
                <div className="flex items-center mr-2">
                  <span className="font-bold underline">Servicio</span>:
                  <ServicesDropdown openText="Elegir..." />
                </div>
                <div className="flex items-center mr-2">
                  <span className="font-bold underline">Hace más de</span>:
                  <DropdownDaysAgo />
                </div>
              </div>
              <CleanUrlFilters />
            </div>
          )}
        </div>
        <ClientsTable user={user} clients={clients} />
        {total_pages > 1 && (
          <MyPagination total_pages={total_pages} search={search} />
        )}
      </CardContent>
    </Card>
  );
}
