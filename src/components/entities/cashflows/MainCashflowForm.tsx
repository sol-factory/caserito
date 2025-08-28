"use client";

import { DatePicker } from "@/components/custom-ui/DatePicker";
import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import useFlags from "@/hooks/use-falgs";
import { differenceInCalendarDays } from "date-fns";
import { useStore } from "@/stores";

const MainCashflowForm = ({ user, canUpdate, state, canCreate }) => {
  const { getFlag } = useFlags();
  const kind = useStore((s) => s.sale.kind);

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
            placeholder="Fecha de movimiento"
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
          monitorField="sale"
          placeholder={
            kind === "income"
              ? "¿A dónde ingresó el dinero?"
              : "¿De dónde salió el dinero?"
          }
          disabled={!canUpdate && !canCreate}
        />

        <div className="flex items-center gap-2 w-full">
          <MyInput
            id="cashflow-amount"
            monitoredField="wallet"
            placeholder="Monto"
            className="w-full"
            inputClassName="w-full"
            entity="cashflow"
            field="amount"
            type="number"
            whole
            disabled={!canUpdate && !canCreate}
          />
        </div>
        <MyInput
          id="cashflow-amount"
          placeholder="Detalle"
          className="w-full"
          inputClassName="w-full"
          entity="cashflow"
          field="detail"
        />
      </div>
    </>
  );
};

export default MainCashflowForm;
