"use client";
import CleanUrlFilters from "@/components/custom-ui/CleanUrlFilters";
import { DatePickerPeriod } from "@/components/custom-ui/DatePickerPeriod";

import React from "react";
import DebtsByCurrency from "./DebtsByCurrency";

const DebtsViewFilter = ({ summary, allowMultiCurrency }) => {
  return (
    <div className="flex flex-col mt-4">
      <div className="flex flex-col sm:flex-row mr-3">
        <DebtsByCurrency
          debts={summary}
          allowMultiCurrency={allowMultiCurrency}
        />
      </div>
      <div className="flex items-center mr-3 mt-6">
        <DatePickerPeriod show btnClassName="mr-2 " />
        <CleanUrlFilters />
      </div>
    </div>
  );
};

export default DebtsViewFilter;
