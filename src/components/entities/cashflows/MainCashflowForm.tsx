"use client";

import { DatePicker } from "@/components/custom-ui/DatePicker";
import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import useFlags from "@/hooks/use-falgs";
import { differenceInCalendarDays } from "date-fns";
import CancellingAmount from "./CancellingAmount";

const MainCashflowForm = ({ user, canUpdate, state, canCreate }) => {
  const { getFlag } = useFlags();
  return (
    <>
      {user?.role === "Socio" &&
        differenceInCalendarDays(state.sale_created_date, state.sale_date) >
          0 && (
          <DatePicker
            id="gathering-date-picker"
            entity="cashflow"
            field="date"
            disabled={!canUpdate}
            fromDateField={"sale_date"}
            placeholder="Fecha de cobro"
            toDate={new Date()}
          />
        )}

      <div className="flex flex-col gap-2">
        <MultiSelect
          id="select-wallet"
          form="cashflow"
          field="wallet"
          entity="wallet"
          justOne
          autoFocus
          hideSearch
          idToFocusAfterSelection="cashflow-amount"
          disabled={!canUpdate && !canCreate}
        />

        <div className="flex items-center gap-2 w-full">
          <MyInput
            id="cashflow-amount"
            monitoredField="wallet"
            placeholder={(wallet) =>
              !wallet?.currency
                ? "Monto recibido"
                : `Monto recibido en ${getFlag(wallet.currency)}`
            }
            className="w-full"
            inputClassName="w-full"
            entity="cashflow"
            field="amount"
            type="number"
            whole
            disabled={!canUpdate && !canCreate}
          />
        </div>
        <CancellingAmount />
      </div>
    </>
  );
};

export default MainCashflowForm;
