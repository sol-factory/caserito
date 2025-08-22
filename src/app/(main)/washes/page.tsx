import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SalesTable from "@/components/entities/sales/SalesTable";
import { DatePicker } from "@/components/custom-ui/DatePicker";
import connectDB from "@/lib/connectDB";
import { SaleModel } from "@/schemas/sale";
import { cleanRegExp } from "@/helpers/text";
import { verifySession } from "@/helpers/auth";
import { getBooleanRoles } from "@/helpers/permissions";
import {
  addToSummary,
  getAquappExchangeRate,
  getAvgExchangeRateForPeriod,
  getFullDateFilter,
  getSalesReports,
  getWorkplace,
  initSummary,
  toObjectId,
} from "@/helpers/mdb";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import SaleCashflowsTable from "@/components/entities/cashflows/SaleCashflowsTable";
import { getDateRange, getPeriodFilter, getUserDate } from "@/helpers/date";
import { CashflowModel } from "@/schemas/cashflow";
import { RankingBars } from "@/components/entities/reports/RankingBars";
import { CONFIG } from "@/config/constanst";
import { RankingTexts } from "@/components/entities/reports/RankingTexts";
import { ClientModel } from "@/schemas/client";
import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import {
  endOfDay,
  endOfWeek,
  isFuture,
  startOfDay,
  startOfWeek,
} from "date-fns";
import StoreModel from "@/schemas/store";
import WeeklySales from "@/components/entities/sales/WeeklySales";
import ViewDropdown from "@/components/entities/sales/ViewDropdown";
import DebtReport from "@/components/entities/reports/DebtReport";
import { MemberModel } from "@/schemas/member";
import WorkersWage from "@/components/entities/reports/WorkersWage";
import { TotalAmount } from "@/components/entities/reports/TotalAmount";
import { addUUIDtoFields } from "@/helpers/arrays";
import DebtsViewFilter from "@/components/entities/sales/DebtsViewFilter";
import ClientViewFilter from "@/components/entities/sales/ClientViewFilter";
import WalletsGatherings from "@/components/entities/reports/WalletsGatherings";

export default async function Sales({ searchParams }) {
  await connectDB();

  const user = await verifySession();

  const { date, search, client_id, view, since, to, period } =
    await searchParams;
  const dateToFilter = date
    ? getUserDate(user, new Date(+date))
    : getUserDate(user);
  const { sinceDate, toDate } = getDateRange({ user, since, to });

  let matchStage: any = {
    ...getWorkplace(user),
    deleted: false,
  };

  let dateFilters,
    sortOrders = { date: -1 };
  const weekly = view === "weekly";
  const untaken = view === "untaken";
  const debtsView = view === "debts";
  const unfinished = view === "unfinished";
  const daily =
    view === "daily" ||
    (!untaken && !client_id && !search && !debtsView && !unfinished && !weekly);

  const counts = {
    unfinished: await SaleModel.countDocuments({
      ...matchStage,
      date: { $lte: endOfDay(new Date()) },
      finished: false,
      taken_away: false,
    }),
    untaken: await SaleModel.countDocuments({
      ...matchStage,
      date: { $lte: endOfDay(new Date()) },
      taken_away: false,
    }),
  };

  const periodFilter = getPeriodFilter(period);

  const finalDate =
    date === "NaN" || date === "Invalid Date" || !date
      ? getUserDate(user)
      : getUserDate(user, new Date(+date));

  const weekStart = startOfWeek(finalDate, { weekStartsOn: 1 });
  weekStart.setHours(5);
  const weekEnd = endOfWeek(finalDate, { weekStartsOn: 1 });

  let aquapp_rate;

  if (weekly) {
    aquapp_rate = await getAvgExchangeRateForPeriod(
      null,
      getFullDateFilter(finalDate, "week")
    );
    dateFilters = {
      $and: [{ date: { $gte: weekStart } }, { date: { $lte: weekEnd } }],
    };

    sortOrders = { date: 1 };
  }
  if (daily) {
    aquapp_rate = await getAquappExchangeRate(finalDate);
    dateFilters = {
      "full_date.day": dateToFilter.getUTCDate(),
      "full_date.month": dateToFilter.getUTCMonth() + 1,
      "full_date.year": dateToFilter.getUTCFullYear(),
    };
    sortOrders = { date: -1 };
  }

  if (unfinished) {
    dateFilters = {
      date: { $lte: endOfDay(dateToFilter) },
      finished: false,
      taken_away: false,
    };
    sortOrders = { date: -1 };
  }

  if (untaken) {
    dateFilters = {
      date: { $lte: endOfDay(dateToFilter) },
      taken_away: false,
    };
    sortOrders = { date: -1 };
  }

  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      console.log({ error });
      regex = search;
    }

    matchStage["search_field"] = regex;
    sortOrders = { date: -1 };
  } else {
    matchStage = {
      ...matchStage,
      ...dateFilters,
    };
  }
  let client = null;
  if (!!client_id) {
    matchStage = {
      ...periodFilter,
      ...getWorkplace(user),
      deleted: false,
      client_id: toObjectId(client_id),
    };
    client = await ClientModel.findById(client_id, {
      _id: { $toString: "$_id" },
      firstname: 1,
      lastname: 1,
      phone: 1,
    }).lean();
    sortOrders = { date: -1 };
  }

  if (debtsView) {
    matchStage = {
      ...matchStage,
      ...periodFilter,
    };
  }

  const projectStage = {
    _id: { $toString: "$_id" },
    createdAt: 1,
    date: 1,
    full_date: 1,
    pick_up_date: 1,
    full_pick_up_date: 1,
    creator_id: { $toString: "$creator._id" },
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
          description: "$$service.description",
          value: "$$service.price",
          currency: "$$service.currency",
          quantity: "$$service.quantity",
          allow_quantity: "$$service.allow_quantity",
        },
      },
    },
    workers: {
      $map: {
        input: "$workers",
        as: "worker",
        in: {
          _id: "$$worker.member_id",
          name: "$$worker.member_name",
          member_email: "$$worker.member_email",
          member_name: "$$worker.member_name",
          sales_percentage: "$$worker.sales_percentage",
          percentage_to_pay: "$$worker.percentage_to_pay",
        },
      },
    },
    store_id: { $toString: "$store_id" },
    finished: 1,
    finished_at: 1,
    taken_away: 1,
    taken_away_at: 1,
    color: 1,
    amount: 1,
    usd_amount: 1,
    lat: { $arrayElemAt: ["$location.coordinates", 1] },
    lng: { $arrayElemAt: ["$location.coordinates", 0] },
    quote_id: { $toString: "$quote_id" },
    quote_identifier: 1,
    messages_count: { $size: "$messages" },
    client: {
      _id: { $toString: "$client_id" },
      kind: "$client.kind",
      icon: "$client.kind",
      firstname: "$client.firstname",
      lastname: "$client.lastname",
      email: "$client.email",
      category: "$client.category",
      phone: "$client.phone",
      country_code: "$client.country_code",
      address: "$client.address",
      name: { $concat: ["$client.firstname", " ", "$client.lastname"] },
    },
    vehicle: {
      _id: { $toString: "$vehicle_id" },
      brand: "$vehicle.brand",
      model: "$vehicle.model",
      kind: "$vehicle.kind",
      kind_classification_id: "$vehicle.kind_classification_id",
      insurance_name: "$vehicle.insurance_name",
      insurance_id: "$vehicle.insurance_id",
      patent: "$vehicle.patent",
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
          _id: {
            $convert: { input: "$$discount._id", to: "string" },
          },
          name: "$$discount.name",
          kind: "$$discount.kind",
          currency: "$$discount.currency",
          amount: "$$discount.amount",
          value: "$$discount.value",
        },
      },
    },
    attachments_count: { $size: { $ifNull: ["$attachments", []] } },
    comments: {
      $map: {
        input: "$comments",
        as: "comment",
        in: {
          _id: {
            $convert: { input: "$$comment._id", to: "string" },
          },
          text: "$$comment.text",
          creator: {
            _id: {
              $toString: "$$comment.creator._id",
            },
            firstname: "$$comment.creator.firstname",
            lastname: "$$comment.creator.lastname",
            email: "$$comment.creator.email",
          },
          date: "$$comment.date",
          createdAt: "$$comment.createdAt",
        },
      },
    },
    discounts_amount: 1,
    usd_discounts_amount: 1,
    gathered_amount: 1,
    usd_gathered_amount: 1,
  };

  const salesPipeline: any = [
    {
      $match: matchStage,
    },
    {
      $project: projectStage,
    },
    { $sort: sortOrders },
  ];

  const stayingCarsPipeline: any = [
    {
      $match: {
        ...getWorkplace(user),
        deleted: false,
        taken_away: false,
        pick_up_date: { $gt: startOfDay(weekStart) },
        date: { $lt: weekEnd },
      },
    },
    { $project: projectStage },
  ];

  if (!!search) {
    salesPipeline.push({ $limit: 20 });
  }

  let match: any = {
    ...dateFilters,
    ...getWorkplace(user),
    deleted: false,
  };

  if (!!client_id) {
    match = {
      ...match,
      client_id: toObjectId(client_id),
    };
  }

  let gatheredByWallet = [];
  let workers = [];

  let cashflowDateFilters, gatheringsSummary;

  const { isOwner, isManager } = getBooleanRoles(user);
  let sales = [];

  if ((isOwner || isManager) && !search) {
    workers = await MemberModel.find(
      {
        "stores._id": user.store._id,
        $or: [
          { "payment_scheme.sales_percentage": { $gt: 0 } },
          { "payment_scheme.fixed_salary": { $gt: 0 } },
        ],
      },
      "user payment_scheme"
    );

    sales = await SaleModel.aggregate(salesPipeline);

    cashflowDateFilters = weekly
      ? {
          $and: [
            { sale_date: { $gte: weekStart } },
            { sale_date: { $lte: weekEnd } },
          ],
        }
      : {
          "sale_full_date.day": dateToFilter.getDate(),
          "sale_full_date.month": dateToFilter.getMonth() + 1,
          "sale_full_date.year": dateToFilter.getFullYear(),
        };
    if (!!client_id) {
      cashflowDateFilters = {
        $and: [
          { sale_date: { $gt: startOfDay(sinceDate) } },
          { sale_date: { $lt: endOfDay(toDate) } },
        ],
      };
    }
    const cashflowsMatch = {
      ...cashflowDateFilters,
      ...getWorkplace(user),
      deleted: false,
    };
    if (!!client_id) {
      cashflowsMatch["client_id"] = toObjectId(client_id);
    }

    gatheredByWallet = await CashflowModel.aggregate([
      { $match: cashflowsMatch },
      {
        $group: {
          _id: "$wallet._id",
          name: { $first: "$wallet.name" },
          url: { $last: "$wallet.logo_url" },
          currency: { $last: "$wallet.currency" },
          gathered: {
            $sum: { $cond: [{ $eq: ["$kind", "Ingreso"] }, "$amount", 0] },
          },
          gatherings: {
            $sum: { $cond: [{ $eq: ["$kind", "Ingreso"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          name: 1,
          url: 1,
          currency: 1,
          gathered: 1,
          gatherings: 1,
          balance: "$gathered",
        },
      },
      { $sort: { balance: -1 } },
    ]);

    const adjustedByWallet = gatheredByWallet
      .map((w) => {
        return {
          ...w,
          url:
            w.name === "Efectivo" ? `${CONFIG.blob_url}/billetes.png` : w.url,
        };
      })
      .sort((a, b) => b.balance - a.balance);
    gatheringsSummary = adjustedByWallet.reduce((acc, curr) => {
      const isUSD = curr.currency === "usd";
      const amount = isUSD ? 0 : curr.gathered;
      const usd_amount = isUSD ? curr.gathered : 0;
      const amount_converted = amount / aquapp_rate;
      const usd_amount_converted = usd_amount * aquapp_rate;

      addToSummary(acc, {
        amount,
        amount_converted,
        usd_amount,
        usd_amount_converted,
        count: isUSD ? 0 : curr.gatherings,
        usd_count: isUSD ? curr.gatherings : 0,
      });

      return acc;
    }, initSummary());
  }

  if (!!search || !!client_id || (!isOwner && !isManager)) {
    sales = await SaleModel.aggregate(salesPipeline);
  }

  if (debtsView) {
    sales = sales.filter(
      (s) =>
        s.amount - s.discounts_amount - s.gathered_amount > 0 ||
        s.usd_amount - s.usd_discounts_amount - s.usd_gathered_amount > 0
    );
  }

  const reports = getSalesReports(sales, workers, aquapp_rate);

  const store = await StoreModel.findById(
    user?.store?._id,
    "allow_sale_color show_permanence allow_workers allow_multi_currency currency"
  );

  const showReports = (daily || weekly || !!client_id) && !search && isOwner;

  let staying_cars = [];

  if (store?.show_permanence) {
    staying_cars = await SaleModel.aggregate(stayingCarsPipeline);
  }
  sales = addUUIDtoFields(sales, ["services", "discounts"]);

  return (
    <div>
      <Card
        className={`bg-white outline-none flex flex-col ${weekly ? "max-h-[50rem] overflow-hidden !no-scrollbar" : ""} rounded-none sm:rounded-xl m-0 mt-0 h-full`}
      >
        <CardHeader className="pb-4">
          <div className="flex  justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <CardTitle className="text-xl">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    {(unfinished ||
                      untaken ||
                      daily ||
                      weekly ||
                      debtsView) && <span>Vehículos ingresados</span>}
                    {!!search && <span>Ventas encontradas</span>}
                    {!!client_id && <span>Historial de ventas</span>}
                    <ViewDropdown count={sales.length} counts={counts} />
                  </div>
                </div>
              </CardTitle>
            </div>

            <div className="flex gap-2">
              <MyFormDialog
                form="client"
                hidden
                dialogToOpen="sale"
                user={user}
              />

              <MyFormDialog
                form="sale"
                user={user}
                defaultDate={
                  !!date && !weekly && isFuture(new Date(+date)) ? date : null
                }
              />
            </div>
            <MyFormDialog
              form="cashflow"
              hidden
              invalidateQueries
              idToFucusAfter="select-wallet"
              user={user}
            >
              <SaleCashflowsTable />
            </MyFormDialog>
            <MyFormDialog form="vehicle" hidden dialogToOpen="sale" />
            <MyFormDialog
              form="service"
              hidden
              dialogToOpen="sale"
              user={user}
            />
          </div>
        </CardHeader>
        <CardContent
          className={
            !weekly
              ? ""
              : "overflow-x-scroll overflow-y-clip flex-1 no-scrollbar"
          }
        >
          {(!!date || weekly || daily) && (
            <div className="relative flex items-center w-full gap-0 sm:gap-2 mt-4">
              <span className="text-md font-light">
                <span className="font-bold underline text-nowrap">
                  {weekly ? "Semana de ingreso" : "Fecha de ingreso"}
                </span>
                :
                <div className="-mt-1 -ml-2 sm:mt-0 sm:ml-0 sm:inline w-auto">
                  <DatePicker
                    id="wash-date-filter"
                    entity="filter"
                    field="date"
                    param="date"
                    placeholder="Filtro de fecha"
                    popoverWidth="w-fit"
                    dateFormat={!weekly ? "EEEE d MMMM yyyy" : null}
                    onlyIcon
                    weekly={weekly}
                    weekStart={weekStart}
                    weekEnd={weekEnd}
                  />
                </div>
              </span>
            </div>
          )}
          {!!search && (
            <div className="flex items-start mt-4 -mb-2">
              {!!search && (
                <div className="flex flex-col sm:flex-row mr-3">
                  <div className="flex">
                    <span className="font-bold underline">Búsqueda</span>:
                  </div>
                  <span className="text-blue-400 font-extralight sm:ml-1 mr-2">
                    {search}
                  </span>
                  <CleanUrlFilters />
                </div>
              )}
            </div>
          )}
          <ClientViewFilter
            client={client}
            sales={sales}
            allowMultiCurrency={store?.allow_multi_currency}
          />
          {debtsView && (
            <DebtsViewFilter
              allowMultiCurrency={store?.allow_multi_currency}
              summary={reports.debtSummary}
            />
          )}
          {(!weekly || debtsView) && (
            <SalesTable sales={sales} isOwner={isOwner} user={user} />
          )}
          {weekly && (
            <WeeklySales
              weekSales={sales}
              staying_cars={staying_cars}
              date={finalDate}
              companyName={user?.company.name}
            />
          )}
        </CardContent>
      </Card>

      {(showReports || isManager) && (
        <DebtReport
          title="Resumen de ventas"
          className="mt-3"
          aquapp_rate={aquapp_rate}
          debts={reports.debtSummary}
          sales={reports.salesSummary}
          gatherings={gatheringsSummary}
          discounts={reports.discountsSummary}
          tips={reports.tipsSummary}
        />
      )}

      {(showReports || isManager) && (
        <div className="flex flex-col sm:flex-row w-full gap-1 sm:gap-2 mt-3">
          {reports.salesByClientType.map((sbc) => (
            <TotalAmount
              title={sbc.name}
              icon={sbc.type}
              key={sbc.type}
              data={sbc}
              className="w-full max-w-full"
              aquappRate={aquapp_rate}
              alwaysShow
            />
          ))}
        </div>
      )}

      {showReports && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row sm:items-start gap-3 mt-3">
            <RankingBars
              items={reports.salesByBrand}
              folder="brands"
              title="Ranking de marcas"
              entityName="cobro"
              preText="Distribución de los"
              afterText="de ventas netas de descuentos"
              exchange_rate={aquapp_rate}
            />
            <WalletsGatherings gatheredByWallet={gatheredByWallet} />
          </div>
          <div className="flex flex-col lg:flex-row lg:items-start gap-3">
            <RankingTexts
              items={reports.salesByVehicleKind}
              title="Ranking de vehículos"
              preText="Distribución de los"
              afterText="de ventas netas de descuentos"
              exchange_rate={aquapp_rate}
            />
            <RankingTexts
              items={reports.salesByService}
              title="Ranking de servicios"
              preText="Distribución de los"
              afterText="de ventas brutas"
              exchange_rate={aquapp_rate}
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start gap-3">
            <WorkersWage
              salaries={reports.salaries}
              cycle={weekly ? "weekly" : "daily"}
            />
          </div>
        </div>
      )}
      {store?.allow_sale_color && showReports && (
        <RankingTexts
          items={reports.salesByColor}
          title="Ranking por colores"
          preText="Distribución de los"
          afterText="cobrados"
          className="mt-3 w-full max-w-full"
          exchange_rate={aquapp_rate}
        />
      )}
    </div>
  );
}
