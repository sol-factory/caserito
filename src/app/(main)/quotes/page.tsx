import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import connectDB from "@/lib/connectDB";
import { cleanRegExp, getRandomId } from "@/helpers/text";
import { verifySession } from "@/helpers/auth";
import { getBooleanRoles } from "@/helpers/permissions";
import { getWorkplace, toObjectId } from "@/helpers/mdb";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { DialogTitle } from "@/components/ui/dialog";
import { CONFIG } from "@/config/constanst";
import { ClientModel } from "@/schemas/client";
import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import CommentsTable from "@/components/entities/comments/CommentsTable";
import StoreModel from "@/schemas/store";
import { QuoteModel } from "@/schemas/quote";
import QuotesTable from "@/components/entities/quotes/QuotesTable";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import ViewDropdown from "@/components/entities/sales/ViewDropdown";
import { addDays } from "date-fns";
import DropdownDaysAgo from "@/components/entities/clients/DropdownDaysAgo";
import QuoteBrands from "@/components/entities/quotes/QuotesBrands";
import { addUUIDtoFields } from "@/helpers/arrays";

export default async function Quotes({ searchParams }) {
  await connectDB();

  const user = await verifySession();
  let store = await StoreModel.findById(user?.store?._id, {
    allow_pick_up_date: 1,
    allow_check_in_date: 1,
    track_services_time: 1,
    allow_sale_color: 1,
    quotes_observations: 1,
    quotes_dark_mode: 1,
    quotes_valid_days: 1,
    quotes_primary_color: 1,
    quotes_secondary_color: 1,
    quotes_tax: 1,
    quotes_payment_conditions: 1,
  });

  store = store ? { ...store.toObject(), _id: store._id.toString() } : {};

  const { search, client_id, days_ago, view } = await searchParams;

  let matchStage: any = {
    ...getWorkplace(user),
    sent: false,
    deleted: false,
  };

  if (user.role === "Técnico") {
    matchStage["creator._id"] = toObjectId(user._id);
  }

  const counts = {
    "not-sent": await QuoteModel.countDocuments({
      ...matchStage,
      sold: false,
      sent: false,
    }),
    sold: await QuoteModel.countDocuments({
      ...matchStage,
      sold: true,
      sent: true,
    }),
  };

  let dateFilters;
  const unfinished = !client_id && !search;

  if (days_ago) {
    dateFilters = {
      sent_at: { $lt: addDays(new Date(), -days_ago) },
    };
    matchStage["sent"] = true;
    matchStage["sold"] = false;
  }

  if (view === "sold") {
    matchStage["sent"] = true;
    matchStage["sold"] = true;
  }

  if (!!search) {
    delete matchStage.sent;
    delete matchStage.sold;
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    matchStage["search_field"] = regex;
  } else {
    matchStage = {
      ...matchStage,
      ...dateFilters,
    };
  }
  let client = null;
  if (!!client_id) {
    matchStage = {
      ...getWorkplace(user),
      deleted: false,
      client_id: toObjectId(client_id),
    };
    client = await ClientModel.findById(client_id);
  }

  const projectStage = {
    _id: { $toString: "$_id" },
    date: 1,
    full_date: 1,
    services: {
      $map: {
        input: "$services",
        as: "service",
        in: {
          _id: {
            $convert: { input: "$$service._id", to: "string" },
          },
          name: "$$service.name",
          detail: "$$service.detail",
          quotes_description: "$$service.quotes_description",
          description: "$$service.quotes_description",
          value: "$$service.price",
          quantity: "$$service.quantity",
          currency: "$$service.currency",
          allow_quantity: "$$service.allow_quantity",
        },
      },
    },
    attachments_count: { $size: { $ifNull: ["$attachments", []] } },
    identifier: 1,
    primary_color: 1,
    secondary_color: 1,
    sold: 1,
    sold_at: 1,
    avoid_total: 1,
    store_id: { $toString: "$store_id" },
    color: 1,
    amount: 1,
    usd_amount: 1,
    dark_mode: 1,
    observations: 1,
    sent: 1,
    sent_at: 1,
    tax: 1,
    valid_days: 1,
    messages_count: { $size: "$messages" },
    client: {
      _id: { $toString: "$client_id" },
      kind: "$client.kind",
      firstname: "$client.firstname",
      lastname: "$client.lastname",
      category: "$client.category",
      email: "$client.email",
      phone: "$client.phone",
      country_code: "$client.country_code",
      address: "$client.address",
      name: { $concat: ["$client.firstname", " ", "$client.lastname"] },
    },
    vehicle: {
      _id: { $toString: "$vehicle_id" },
      brand: "$vehicle.brand",
      model: "$vehicle.model",
      patent: "$vehicle.patent",
      insurance_name: "$vehicle.insurance_name",
      insurance_id: "$vehicle.insurance_id",
      pre_name: {
        $concat: [
          CONFIG.blob_url, // Inserta la URL base directamente
          "/brands/",
          {
            $toLower: {
              $replaceAll: {
                input: "$vehicle.brand",
                find: " ",
                replacement: "-",
              },
            },
          }, // Convierte la marca a slug
          ".png",
        ],
      },
      name: {
        $concat: ["$vehicle.kind", " ", "$vehicle.model"],
      },
    },
    discounts: {
      $map: {
        input: "$discounts",
        as: "discount",
        in: {
          _id: { $toString: "$$discount._id" },
          name: "$$discount.name",
          kind: "$$discount.kind",
          amount: "$$discount.amount",
          currency: "$$discount.currency",
          value: "$$discount.value",
        },
      },
    },
    discounts_amount: 1,
    usd_discounts_amount: 1,
  };
  const quotesPipeline: any = [
    {
      $match: matchStage,
    },
    {
      $project: projectStage,
    },
    { $sort: { date: -1 } },
  ];

  if (!!search) {
    quotesPipeline.push({ $limit: 20 });
  }

  let quotes_count;

  const { isOwner, isManager } = getBooleanRoles(user);
  let quotes = [];

  if ((isOwner || isManager) && !search && !client_id) {
    quotes = await QuoteModel.aggregate(quotesPipeline);
    quotes_count = quotes.reduce((prev, curr) => prev + 1, 0);
  }

  if (!!search || client_id || (!isOwner && !isManager)) {
    quotes = await QuoteModel.aggregate(quotesPipeline);
  }

  return (
    <div>
      <Card
        className={`bg-white outline-none flex flex-col min-h-[20rem] rounded-none sm:rounded-xl m-0 mt-0 h-full`}
      >
        <CardHeader className="pb-4">
          <div className="flex  justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {unfinished && <span>Cotizaciones</span>}
                    {!!search && <span>Cotizaciones encontradas</span>}
                    {!!client_id && <span>Historial de cotizaciones</span>}
                  </div>
                </div>
                <ViewDropdown
                  screen="quotes"
                  count={quotes.length}
                  counts={counts}
                />
              </CardTitle>
              <TutorialBadge
                title="+ ventas 💰 en - tiempo ⏱️"
                url="https://youtu.be/74ESCF0Thqs"
                titleFont="font-light"
                tiny
                custom_id={13}
              />
            </div>

            <div className="flex gap-2">
              <MyFormDialog
                form="client"
                hidden
                dialogToOpen="quote"
                user={user}
              />

              <MyFormDialog
                titleName="configuración"
                buttonText="Configuración"
                variant="secondary"
                form="store"
                startMode="editing"
                action="updateQuotesConfig"
                fieldsIndex={1}
                avoidValidations
                icon="cog"
                user={user}
              />
              <MyFormDialog form="quote" user={user} />
            </div>
            <MyFormDialog form="vehicle" hidden dialogToOpen="quote" />
            <MyFormDialog
              form="service"
              hidden
              dialogToOpen="quote"
              user={user}
            />
          </div>
        </CardHeader>
        <CardContent className={"flex-1"}>
          {(!!search || !!client) && (
            <div className="flex items-end sm:items-center mt-4 -mb-2">
              {!!search && (
                <div className="flex flex-col sm:flex-row mr-3">
                  <div className="flex">
                    <span className="font-bold underline">Búsqueda</span>:
                  </div>
                  <span className="text-blue-400 font-light sm:ml-1">
                    {search}
                  </span>
                </div>
              )}
              {!!client && (
                <div className="flex flex-col sm:flex-row mr-3">
                  <div className="flex">
                    <span className="font-bold underline">Cliente</span>:
                  </div>
                  <span className="text-blue-400 font-light sm:ml-1">
                    {client.firstname} {client.lastname}
                  </span>
                </div>
              )}
              <CleanUrlFilters />
            </div>
          )}
          {!!days_ago && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex items-center mr-2">
                <span className="font-bold underline">Hace más de</span>:
                <DropdownDaysAgo screen="quotes" />
              </div>

              <CleanUrlFilters />
            </div>
          )}
          {(isOwner || isManager) && <QuoteBrands quotes={quotes} />}
          <QuotesTable
            quotes={addUUIDtoFields(quotes, ["services", "discounts"])}
            user={user}
            isOwner={isOwner}
            isManager={isManager}
            store={store}
          />
        </CardContent>
      </Card>
    </div>
  );
}
