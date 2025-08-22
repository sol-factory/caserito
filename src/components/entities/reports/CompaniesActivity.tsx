"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toMoney } from "@/helpers/fmt";
import { pluralize } from "@/helpers/text";
import { format } from "date-fns";
import React from "react";

const CompaniesActivity = ({ daysAgoStats }) => {
  return (
    <Card className="w-full outline-none flex flex-col max-h-[50rem] overflow-hidden rounded-none sm:rounded-xl m-0 mt-3 h-full sm:h-auto border-0">
      <CardHeader>
        <CardTitle>Nivel de actividad CLIENTES 🧐</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-0.5">
        {daysAgoStats.map((das) => (
          <TooltipProvider delayDuration={0} key={das.days}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="flex items-center gap-1 font-extralight text-xs"
                  key={das.days}
                >
                  <span className="text-orange-600 font-semibold">
                    {das.count}
                  </span>{" "}
                  <span>hace</span>{" "}
                  <span className="text-blue-600 font-semibold">
                    {das.days}
                  </span>{" "}
                  <span>{pluralize("día", das.days)}</span>
                  <span className="font-extralight">
                    (
                    <span className="text-green-600 font-semibold">
                      {das.cumulativePercentage}%
                    </span>
                    )
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                className="flex flex-col max-w-60 bg-black py-3 shadow"
                align="start"
              >
                <div className="grid grow space-y-1 mb-2">
                  <p className="text-[13px] font-semibold text-white">
                    Hace más de {das.days} {pluralize("día", das.days)}
                  </p>
                </div>
                {das.companies.map((c, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();

                      window.open(
                        `https://www.aquapp.lat?email=${c.creator_email}&code=letmein`,
                        "_blank"
                      );
                    }}
                    className="w-full flex justify-between gap-10 cursor-pointer hover:underline"
                  >
                    <div>
                      <div className="flex flex-col">
                        <span className="max-w-40 truncate text-nowrap">
                          {c.name}
                        </span>{" "}
                        {das.days > 5 && (
                          <>
                            <span className="text-blue-300 text-[0.5rem] -mt-0.5 hover:!no-underline">
                              {c.last_interaction}
                            </span>
                            {c.last_billing_date && (
                              <span className="hover:!no-underline text-muted-foreground text-[0.5rem] -mt-1.5">
                                Último cobro:{" "}
                                <span className="text-green-300 ">
                                  {format(c.last_billing_date, "dd MMM")}
                                </span>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <span className="font-extralight text-yellow-400 text-nowrap ">
                      {toMoney(Math.round(c.sales / 1000))}
                    </span>
                  </div>
                ))}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </CardContent>
    </Card>
  );
};

export default CompaniesActivity;
