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
import DebtReport from "@/components/entities/reports/DebtReport";
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

  const periodFilter = getPeriodFilter(period);

  const finalDate =
    date === "NaN" || date === "Invalid Date" || !date
      ? getUserDate(user)
      : getUserDate(user, new Date(+date));

  const weekStart = startOfWeek(finalDate, { weekStartsOn: 1 });
  weekStart.setHours(5);
  const weekEnd = endOfWeek(finalDate, { weekStartsOn: 1 });

  if (weekly) {
    dateFilters = {
      $and: [{ date: { $gte: weekStart } }, { date: { $lte: weekEnd } }],
    };

    sortOrders = { date: 1 };
  }
  if (daily) {
    dateFilters = {
      "full_date.day": dateToFilter.getUTCDate(),
      "full_date.month": dateToFilter.getUTCMonth() + 1,
      "full_date.year": dateToFilter.getUTCFullYear(),
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
    kind: 1,
    category: { _id: { $toString: "$category._id" }, name: "$category.name" },
    sub_category: {
      _id: { $toString: "$sub_category._id" },
      name: "$sub_category.name",
    },
    full_date: 1,
    pick_up_date: 1,
    full_pick_up_date: 1,
    creator_id: { $toString: "$creator._id" },
    store_id: { $toString: "$store_id" },
    amount: 1,
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
    gathered_amount: 1,
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

  let cashflowDateFilters, gatheringsSummary;

  const { isOwner, isManager } = getBooleanRoles(user);
  let sales = [];

  if ((isOwner || isManager) && !search) {
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
      const amount_converted = amount;

      addToSummary(acc, {
        amount,
        amount_converted,
        usd_amount,
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

  const reports = getSalesReports(sales, [], 1);

  const store = await StoreModel.findById(
    user?.store?._id,
    "allow_sale_color show_permanence allow_workers allow_multi_currency currency"
  );

  const showReports = (daily || weekly || !!client_id) && !search && isOwner;

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
                    <span>Operaciones</span>
                  </div>
                </div>
              </CardTitle>
            </div>

            <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {(showReports || isManager) && (
        <DebtReport
          title="Resumen de ventas"
          className="mt-3"
          aquapp_rate={1}
          debts={reports.debtSummary}
          sales={reports.salesSummary}
          gatherings={gatheringsSummary}
          discounts={reports.discountsSummary}
          tips={reports.tipsSummary}
        />
      )}

      <div className="flex flex-col sm:flex-row w-full gap-1 sm:gap-2 mt-3">
        {reports.salesByClientType.map((sbc) => (
          <TotalAmount
            title={sbc.name}
            icon={sbc.type}
            key={sbc.type}
            data={sbc}
            className="w-full max-w-full"
            aquappRate={1}
            alwaysShow
          />
        ))}
      </div>
    </div>
  );
}
