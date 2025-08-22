import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/custom-ui/DatePicker";
import connectDB from "@/lib/connectDB";
import { cleanRegExp } from "@/helpers/text";
import { verifySession } from "@/helpers/auth";
import { getBooleanRoles } from "@/helpers/permissions";
import { getCashflowsReports, getWorkplace, toObjectId } from "@/helpers/mdb";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { getPeriodFilter, getUserDate } from "@/helpers/date";
import { CashflowModel } from "@/schemas/cashflow";
import { ClientModel } from "@/schemas/client";
import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import CasfhlowsTable from "@/components/entities/cashflows/CasfhlowsTable";
import { CONFIG } from "@/config/constanst";
import CashflowsSummary from "@/components/entities/reports/CashflowsSummary";
import CashflowsSubCategriesTable from "@/components/entities/cashflows/CashflowsSubCategriesTable";
import WalletsSummary from "@/components/entities/reports/WalletsSummary";
import ViewDropdown from "@/components/entities/sales/ViewDropdown";
import { getAquappExchangeRate } from "@/helpers/mdb";
import SubConceptViewFilter from "@/components/entities/cashflows/SubConceptViewFilter";
import WalletModel, { WalletClosureModel } from "@/schemas/wallet";

export default async function Cashflows({ searchParams }) {
  await connectDB();

  const user = await verifySession();
  const { date, search, client_id, subCategory, view, period } =
    await searchParams;
  const dateToFilter = date
    ? getUserDate(user, new Date(+date))
    : getUserDate(user);

  let matchStage: any = {
    ...getWorkplace(user),
    deleted: false,
  };

  const period_filter = getPeriodFilter(period);

  let summaryMatchStage = { ...matchStage };

  if (user.role === "Técnico") {
    matchStage["creator._id"] = toObjectId(user._id);
  }

  let dayFilters = {
    "full_date.day": dateToFilter.getDate(),
    "full_date.month": dateToFilter.getMonth() + 1,
    "full_date.year": dateToFilter.getFullYear(),
  };

  let walletMatchStage: any = {
    ...getWorkplace(user),
    deleted: false,
  };

  if (subCategory) {
    matchStage["sub_category.name"] = subCategory;
    delete dayFilters["full_date.day"];
    delete dayFilters["full_date.month"];
    dayFilters = { ...dayFilters, ...period_filter };
  }

  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    delete matchStage["full_date"];
    matchStage["detail"] = regex;
    walletMatchStage = null;
  } else {
    matchStage = {
      ...matchStage,
      ...dayFilters,
    };
    summaryMatchStage = {
      ...summaryMatchStage,
      ...dayFilters,
    };
  }

  let client = null;
  if (!!client_id && client_id !== "null") {
    matchStage = {
      ...getWorkplace(user),
      deleted: false,
      client_id: toObjectId(client_id),
    };
    client = await ClientModel.findById(client_id);
  }

  const pipeline: any = [
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        kind: 1,
        createdAt: 1,
        date: 1,
        full_date: 1,
        sale_id: { $toString: "$sale_id" },
        full_sale_date: 1,
        amount: { $abs: "$amount" },
        client: { _id: { $toString: "$client_id" }, name: "$client_name" },
        category: {
          _id: { $toString: "$category._id" },
          name: "$category.name",
        },
        sub_category: {
          _id: { $toString: "$sub_category._id" },
          name: "$sub_category.name",
        },
        detail: 1,
        creator: {
          _id: { $toString: "$creator._id" },
          firstname: "$creator.firstname",
          lastname: "$creator.lastname",
          email: "$creator.email",
          logo_url: "$creator.logo_url",
        },
        wallet: {
          _id: { $toString: "$wallet._id" },
          name: "$wallet.name",
          currency: "$wallet.currency",
          pre_name: "$wallet.logo_url",
          logo_url: "$wallet.logo_url",
        },
        attachments_count: { $size: { $ifNull: ["$attachments", []] } },
        comments_count: { $size: { $ifNull: ["$comments", []] } },
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  if (!!search) {
    pipeline.push({ $limit: 20 });
  }
  let cashflows = [];
  let gatheredByWallet = [];

  const [cashResponse, walletResponse] = await Promise.all([
    await CashflowModel.aggregate(pipeline),
    walletMatchStage &&
      (await CashflowModel.aggregate([
        {
          $match: {
            ...walletMatchStage,
            ...dayFilters,
          },
        },
        {
          $group: {
            _id: "$wallet._id",
            wallet: { $last: "$wallet" },
            gathered: {
              $sum: { $cond: [{ $eq: ["$kind", "Ingreso"] }, "$amount", 0] },
            },
            spent: {
              $sum: {
                $cond: [{ $eq: ["$kind", "Egreso"] }, { $abs: "$amount" }, 0],
              },
            },
            gatherings: {
              $sum: {
                $cond: [{ $eq: ["$kind", "Ingreso"] }, 1, 0],
              },
            },
            spents: {
              $sum: {
                $cond: [{ $eq: ["$kind", "Egreso"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            _id: { $toString: "$_id" },
            name: "$wallet.name",
            url: "$wallet.logo_url",
            currency: "$wallet.currency",
            gathered: 1,
            spent: 1,
            gatherings: 1,
            spents: 1,
          },
        },
        { $sort: { value: -1 } },
      ])),
  ]);
  cashflows = cashResponse;

  gatheredByWallet = walletResponse;

  gatheredByWallet = gatheredByWallet
    ?.map((w) => {
      if (w.name === "Efectivo") {
        return {
          ...w,
          url: `${CONFIG.blob_url}/billetes.png`,
          balance: w.gathered - w.spent,
        };
      } else {
        return { ...w, balance: w.gathered - w.spent };
      }
    })
    .sort((a, b) => a.balance - b.balance);

  const storeWalletsBalances = await WalletModel.find(
    { "stores._id": user.store._id },
    { _id: { $toString: "$_id" }, balance: 1 }
  ).lean();

  const { isOwner, isManager } = getBooleanRoles(user);

  const monthly = !!subCategory && view === "monthly";

  const aquapp_rate = await getAquappExchangeRate(dateToFilter);

  const reports = await getCashflowsReports(cashflows, aquapp_rate);

  let closures = [];
  const lastCashflows = [];
  if (!subCategory && !client && !search) {
    closures = await WalletClosureModel.find(
      {
        ...getWorkplace(user, true),
        deleted: false,
        ...dayFilters,
      },
      {
        _id: { $toString: "$_id" },
        wallet_id: { $toString: "$wallet_id" },
        full_date: 1,
        date: 1,
        day_opening: 1,
        gathered: 1,
        gatherings: 1,
        spent: 1,
        spents: 1,
        balance: 1,
        counted_closing: 1,
        expected_closing: 1,
        attachments_count: { $size: { $ifNull: ["$attachments", []] } },
        comments_count: { $size: { $ifNull: ["$comments", []] } },
        diff: 1,
        notes: 1,
        closed_by: { $toString: "$closed_by" },
        closed_by_email: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    ).lean();
    for (const wallet of gatheredByWallet) {
      const lastCashflow = await CashflowModel.findOne({
        ...getWorkplace(user, true),
        deleted: false,
        "wallet._id": wallet._id,
      })
        .select({
          date: 1,
          wallet_id: { $toString: "$wallet._id" },
          _id: { $toString: "$_id" },
        })
        .lean()
        .sort({ date: -1 })
        .limit(1);
      if (!!lastCashflow) {
        lastCashflows.push(lastCashflow);
      }
    }
  }

  return (
    <div className="pb-40">
      <Card
        x-chunk="dashboard-06-chunk-0"
        className={`outline-none flex flex-col min-h-[20rem] max-h-[50rem] overflow-hidden rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0`}
      >
        <CardHeader className="pb-4">
          <div className="flex  justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <CardTitle className="text-xl">
                {!search && !client && (
                  <div className="flex flex-col">
                    <span className="w-fit">Flujos de dinero</span>
                    <ViewDropdown
                      screen="cashflows"
                      count={cashflows.length}
                      counts={{}}
                    />
                  </div>
                )}
                {!!search && <span>Flujos encontrados </span>}
                {!!client && "Historial de pagos"}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <MyFormDialog
                  form="cashflow-sub-category"
                  invalidateQueries
                  automaticClose={false}
                  variant="secondary"
                  buttonText="Categorías de egresos"
                  icon="shapes"
                >
                  <CashflowsSubCategriesTable />
                </MyFormDialog>
              )}
              <MyFormDialog
                form="cashflow"
                invalidateQueries
                fieldsIndex={1}
                buttonText="Crear movimiento"
                titleName="movimiento"
                user={user}
                onlyShow
              />
              <MyFormDialog
                form="cashflow"
                invalidateQueries
                fieldsIndex={2}
                titleName="movimiento de saldo"
                user={user}
                icon="transfer"
                action="transfer"
                onlyShow
                onlyIcon
              />
              <MyFormDialog
                form="wallet"
                fieldsIndex={1}
                fullTitle="Cierre de caja diario"
                user={user}
                hideActionButton
                hidden
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          {!search && !client && !subCategory && (
            <div className="flex flex-col">
              <div className="relative flex items-center w-full gap-0 sm:gap-2 mt-4">
                <span className="text-md font-light">
                  <span className="font-bold underline text-nowrap">Fecha</span>
                  :
                  <div className="-mt-1 -ml-2 sm:mt-0 sm:ml-0 sm:inline w-auto">
                    <DatePicker
                      id="wash-date-filter"
                      entity="filter"
                      field="date"
                      param="date"
                      monthly={monthly}
                      dateFormat={monthly ? "MMMM yyyy" : "EEEE dd MMMM yyyy"}
                      placeholder="Filtro de fecha"
                      popoverWidth="w-fit"
                      onlyIcon
                    />
                  </div>
                </span>
              </div>

              {!!period && (
                <div className="flex items-center text-md font-light mt-2">
                  <span className="font-bold underline text-nowrap">
                    Período
                  </span>
                  :
                  <div className="ml-2 mr-2 text-sm font-extralight text-orange-600 inline">
                    {period}
                  </div>
                  <CleanUrlFilters />
                </div>
              )}
            </div>
          )}
          {!!subCategory && <SubConceptViewFilter subCategory={subCategory} />}
          {!!search && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex">
                <span className="font-bold underline">Búsqueda</span>:
              </div>
              <span className="text-blue-400 font-light ml-2 mr-2">
                {search}
              </span>
              <CleanUrlFilters />
            </div>
          )}
          {!!client && (
            <div className="flex flex-col sm:flex-row mr-3">
              <div className="flex">
                <span className="font-bold underline">Cliente</span>:
              </div>
              <span className="text-blue-400 font-light ml-2 mr-2">
                {client.firstname} {client.lastname}
              </span>
              <CleanUrlFilters />
            </div>
          )}
          <CasfhlowsTable cashflows={cashflows} user={user} />
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row sm:items-start gap-3 mt-3">
        {isOwner && !search && !client_id && (
          <CashflowsSummary
            cashflowsSummary={reports.cashflowsBySubCategory}
            period={period}
            filter
            aquapp_rate={aquapp_rate}
          />
        )}
        {(isOwner || isManager) && !search && !client_id && (
          <WalletsSummary
            gatheredByWallet={gatheredByWallet}
            closures={closures}
            date={dateToFilter}
            dayFilters={dayFilters}
            lastCashflows={lastCashflows}
            storeWalletsBalances={storeWalletsBalances}
          />
        )}
      </div>
    </div>
  );
}
