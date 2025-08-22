import CompaniesTable from "@/components/entities/companies/CompaniesTable";
import CompaniesActivity from "@/components/entities/reports/CompaniesActivity";
import EvolutionChart from "@/components/entities/reports/EvolutionChart";
import SubsEvolutionChart from "@/components/entities/reports/SubsEvolutionChart";
import SubsIndicatorsEvolutionChart from "@/components/entities/reports/SubsIndicatorsEvolutionChart";
import { TotalAmount } from "@/components/entities/reports/TotalAmount";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUNTRIES } from "@/config/constanst";
import { verifySession } from "@/helpers/auth";

import { getDateRange } from "@/helpers/date";
import { groupCompaniesByInactivity } from "@/helpers/mdb";
import { cleanRegExp, cleanText, pluralize } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import CompanyModel from "@/schemas/company";
import StatsModel from "@/schemas/stats";
import { SubscriptionModel } from "@/schemas/subscription";
import { addDays, endOfDay, startOfDay } from "date-fns";

export default async function AdminPage({ searchParams }) {
  const { since, to, group_by, search } = await searchParams;

  await connectDB();
  const user = await verifySession();
  const { sinceDate, toDate } = getDateRange({
    user,
    since,
    to,
    startDaysAgo: 20,
  });

  const matchStage = {
    $and: [
      { createdAt: { $gt: startOfDay(sinceDate) } },
      { createdAt: { $lt: endOfDay(toDate) } },
    ],
    deleted: false,
    "subscription.active": false,
    "creator.email": { $ne: "mgesualdo14@gmail.com" },
  };

  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    matchStage["search_field"] = regex;
    delete matchStage["subscription.active"];
    delete matchStage["$and"];
  }

  let project, group, sort;

  if (group_by === "week") {
    group = {
      $group: {
        _id: {
          week: "$full_creation_date.week",
          year: "$full_creation_date.year",
        },
        count: { $sum: 1 },
        sales: { $sum: "$statistics.sales" },
        services: { $sum: "$statistics.services" },
      },
    };
    project = {
      $project: {
        date: {
          $concat: [
            { $toString: "$_id.week" },
            "-",
            { $toString: "$_id.year" },
          ],
        },
        week: "$_id.week",
        year: "$_id.year",
        count: 1,
        sales: 1,
        services: 1,
      },
    };
    sort = { $sort: { year: 1, week: 1 } };
  } else {
    group = {
      $group: {
        _id: {
          day: "$full_creation_date.day",
          month: "$full_creation_date.month",
          year: "$full_creation_date.year",
        },
        count: { $sum: 1 },
        sales: { $sum: "$statistics.sales" },
        services: { $sum: "$statistics.services" },
      },
    };

    project = {
      $project: {
        date: {
          $concat: [
            { $toString: "$_id.year" },
            "-",
            { $toString: "$_id.month" },
            "-",
            { $toString: "$_id.day" },
          ],
        },
        day: "$_id.day",
        month: "$_id.month",
        year: "$_id.year",
        count: 1,
        sales: 1,
        services: 1,
      },
    };
    sort = { $sort: { year: 1, month: 1, day: 1 } };
  }

  const companiesEvolution = await CompanyModel.aggregate([
    { $match: matchStage },
    group,
    project,
    sort,
  ]);
  const companies = await CompanyModel.aggregate([
    { $match: { ...matchStage } },
    {
      $project: {
        _id: { $toString: "$_id" },
        name: 1,
        logo_url: 1,
        statistics: 1,
        country: 1,
        city: 1,
        lat: 1,
        lng: 1,
        province: 1,
        creator_email: "$creator.email",
        origin_event_name: 1,
        whatsapp: 1,
        phone: 1,
        subscription: { status: "$subscription.status" },
        createdAt: 1,
        trial_start_date: 1,
        updatedAt: 1,
      },
    },
    { $sort: { updatedAt: -1 } },
  ]);

  const [subsSummary] = await SubscriptionModel.aggregate([
    { $match: { active: true } },
    {
      $project: {
        amount: {
          $cond: [
            { provider: "mp" },
            { $divide: ["$amount", { $max: ["$frequency", 1] }] },
            { $multiply: ["$amount", 1200] },
          ],
        },
        whatsapp_amount: {
          $cond: [
            { provider: "mp" },
            { $divide: ["$messages.amount", { $max: ["$frequency", 1] }] },
            { $multiply: ["$messages.amount", 1200] },
          ],
        },
        quotes_amount: {
          $cond: [
            { provider: "mp" },
            { $divide: ["$quotes.amount", { $max: ["$frequency", 1] }] },
            { $multiply: ["$quotes.amount", 1200] },
          ],
        },
        files_amount: {
          $cond: [
            { provider: "mp" },
            { $divide: ["$files.amount", { $max: ["$frequency", 1] }] },
            { $multiply: ["$files.amount", 1200] },
          ],
        },
        messages: 1,
        quotes: 1,
        files: 1,
        company_id: 1,
        provider: 1,
        frequency: 1,
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
        whatsapp_amount: { $sum: "$whatsapp_amount" },
        quotes_amount: { $sum: "$quotes_amount" },
        files_amount: { $sum: "$files_amount" },
      },
    },
  ]);

  const weeklyGroup = group_by === "week";
  const totalSubsAmount =
    subsSummary.amount +
    subsSummary.whatsapp_amount +
    subsSummary.quotes_amount +
    subsSummary.files_amount;

  const companiesStats = companies.reduce((acc, company) => {
    const country = company.country;
    const stats = company.statistics;
    const activated = stats.sales > 0 ? 1 : 0;
    const using = stats.sales > 5 ? 1 : 0;

    if (!acc[country]) {
      const countryFlag = COUNTRIES.find((c) => c.code === country)?.flag;

      acc[country] = { count: 1, flag: countryFlag, activated, using };
    } else {
      acc[country].count += 1;
      acc[country].activated += activated;
      acc[country].using += using;
    }

    for (const key in stats) {
      const value = stats[key];

      // Solo sumar si es número y no es 'tutorials_clicked' ni 'last_interaction'
      if (
        typeof value === "number" &&
        key !== "tutorials_clicked" &&
        key !== "last_interaction"
      ) {
        acc[country][key] = (acc[country][key] || 0) + value;
      }
    }

    return acc;
  }, {});

  function calcSubsStats(data, arpu = 23100, usd = 1180) {
    const cumulative = {
      ad_spent: 0,
      support_spent: 0,
      activated: 0,
      canceled: 0,
      base_at_start: 0,
    };

    const resultados = [];

    data.forEach((item) => {
      const ads = item.marketing?.ad_spent || 0;
      const activated = item.subscriptions?.activated || 0;
      const canceled = item.subscriptions?.canceled || 0;
      const base = item.subscriptions?.total_at_start || 0;

      cumulative.ad_spent += ads;
      cumulative.support_spent += 1000;
      cumulative.activated += activated;
      cumulative.canceled += canceled;
      cumulative.base_at_start += base;

      const avg_churn =
        cumulative.base_at_start > 0
          ? cumulative.canceled / cumulative.base_at_start
          : 0;

      const ltv = avg_churn > 0 ? arpu / avg_churn : null;

      const activated_cum = cumulative.activated - cumulative.canceled;

      const cac =
        activated_cum > 0 ? (cumulative.ad_spent / activated_cum) * usd : null;
      const support_cac =
        activated_cum > 0
          ? (cumulative.support_spent / activated_cum) * usd
          : null;

      const total_cac = cac + support_cac;

      const ltv_vs_cac = ltv && cac ? ltv / cac : null;
      const adjusted_ltv_vs_cac = ltv && total_cac ? ltv / total_cac : null;

      const day = 1;
      const month = item.month;
      const year = item.year;

      resultados.push({
        _id: { day, month, year },
        day,
        month,
        year,
        date: `${year}-${month}-${day}`,
        activated,
        canceled,
        churn_rate: item.subscriptions.churn_rate,
        ad_spent_cum: +(cumulative.ad_spent * usd).toFixed(0),
        support_spent_cum: +(cumulative.support_spent * usd).toFixed(0),
        activated_cum,
        canceled_cum: cumulative.canceled,
        avg_churn: +(+avg_churn.toFixed(4) * 100).toFixed(2),
        ltv: ltv ? +ltv.toFixed(0) : 0,
        cac: cac ? +cac.toFixed(0) : 0,
        support_cac: support_cac ? +support_cac.toFixed(0) : 0,
        total_cac: +total_cac.toFixed(0),
        ltv_vs_cac: ltv_vs_cac ? +ltv_vs_cac.toFixed(2) : 0,
        adjusted_ltv_vs_cac: adjusted_ltv_vs_cac
          ? +adjusted_ltv_vs_cac.toFixed(2)
          : 0,
      });
    });

    return resultados;
  }
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const stats = await StatsModel.find({
    $or: [
      { year: { $lt: year } },
      { $and: [{ month: { $lte: month } }, { year }] },
    ],
  });
  const subsEvolution = calcSubsStats(
    stats,
    +(totalSubsAmount / subsSummary.count).toFixed(2)
  );

  const unusedCompanies = await CompanyModel.aggregate([
    {
      $match: {
        "subscription.active": true,
        updatedAt: { $lt: addDays(new Date(), 0) },
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        name: 1,
        logo_url: 1,
        creator_email: "$creator.email",
        sales: "$statistics.sales_amount",
        last_interaction: "$statistics.last_interaction",
        last_billing_date: "$last_billing_date",
        updatedAt: 1,
      },
    },
  ]);
  const daysAgoStats = groupCompaniesByInactivity(unusedCompanies);

  const subAmountMean = subsSummary.amount / subsSummary.count;

  return (
    <div>
      <EvolutionChart
        companies={companiesEvolution}
        weeklyGroup={weeklyGroup}
      />

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 mt-3 w-full">
        <TotalAmount
          title="Total"
          data={{
            total_amount: Math.round(totalSubsAmount),
            total_count: (
              +totalSubsAmount / Math.max(subAmountMean, 23100)
            ).toFixed(2),
          }}
          blob_name="logo"
          className="w-full !max-w-full sm:min-w-60"
        />
        <TotalAmount
          title="Aquapp"
          data={{
            total_amount: subsSummary.amount,
            total_count: subsSummary.count,
          }}
          blob_name="logo"
          className="w-full !max-w-full sm:min-w-52"
        />
        <TotalAmount
          title="Whatsapp"
          data={{
            total_amount: Math.round(subsSummary.whatsapp_amount),
            total_count: +(subsSummary.whatsapp_amount / subAmountMean).toFixed(
              2
            ),
          }}
          blob_name="whatsapp"
          className="w-full !max-w-full sm:min-w-60"
        />
        <TotalAmount
          title="PDFs"
          data={{
            total_amount: Math.round(subsSummary.quotes_amount),
            total_count: +(subsSummary.quotes_amount / subAmountMean).toFixed(
              2
            ),
          }}
          blob_name="pdf2"
          className="w-full !max-w-full sm:min-w-40"
        />
        <TotalAmount
          title="Adjuntos"
          data={{
            total_amount: Math.round(subsSummary.files_amount),
            total_count: +(subsSummary.files_amount / subAmountMean).toFixed(2),
          }}
          blob_name="attachment"
          className="w-full !max-w-full sm:min-w-40"
        />
      </div>
      <div className="flex flex-col md:flex-row md:gap-2">
        <SubsEvolutionChart subs={subsEvolution} />
        <SubsIndicatorsEvolutionChart subs={subsEvolution} />
      </div>
      <div className="flex flex-col sm:flex-row items-start gap-2">
        <CompaniesActivity daysAgoStats={daysAgoStats} />
        <Card
          x-chunk="dashboard-06-chunk-0"
          className="w-full outline-none flex flex-col max-h-[50rem] overflow-hidden rounded-none sm:rounded-xl m-0 mt-3 h-full sm:h-auto border-0"
        >
          <CardHeader className="text-xl font-semibold flex flex-row items-center justify-between w-full py-2">
            <span>Empresas</span>
            <span>{companies.length}</span>
          </CardHeader>
          <CardContent>
            {Object.keys(companiesStats).map((key) => {
              const c = companiesStats[key];

              return (
                <div key={key} className="flex flex-col">
                  <div className="flex items-center w-full justify-between ">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{c.flag}</span>
                      <div className="flex flex-col text-sm">
                        <span className="font-extralight ml-1 text-muted-foreground">
                          <span className="text-blue-600 font-semibold">
                            {c.activated}
                          </span>{" "}
                          <span className="text-[0.6rem]">con</span>{" "}
                          <span className="font-semibold text-black">+1</span>{" "}
                          <span
                            className={
                              "font-extralight text-blue-600 text-xs ml-1"
                            }
                          >
                            {((c.activated / c.count) * 100).toFixed(2)}%
                          </span>
                          <span className="mx-4 font-semibold text-black">
                            |
                          </span>
                          <span className="text-blue-600 font-semibold">
                            {c.using}
                          </span>{" "}
                          <span className="text-[0.6rem]">con</span>{" "}
                          <span className="font-semibold text-black">+5</span>{" "}
                          <span
                            className={
                              "font-extralight text-blue-600 text-xs ml-1"
                            }
                          >
                            {((c.using / c.count) * 100).toFixed(2)}%
                          </span>
                        </span>
                      </div>
                    </div>
                    <span>{c.count}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card
        x-chunk="dashboard-06-chunk-0"
        className="outline-none flex flex-col max-h-[50rem] overflow-hidden rounded-none sm:rounded-xl m-0 mt-3 h-full sm:h-auto border-0"
      >
        <CardHeader className="py-0">
          <CardTitle className="text-xl"></CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <CompaniesTable companies={companies} />
        </CardContent>
      </Card>
    </div>
  );
}
