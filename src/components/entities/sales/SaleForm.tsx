"use client";

import MultiSelect from "@/components/custom-ui/MultiSelect";
import ToogleCashflowKind from "../cashflows/ToggleCashflowKind";
import { DatePicker } from "@/components/custom-ui/DatePicker";
import MyTimeInput from "@/components/custom-ui/MyTimeInput";
import MyInput from "@/components/custom-ui/MyInput";
import { useStore } from "@/stores";

const SaleForm = ({ canUpdate, user }) => {
  const kind = useStore((s) => s.sale.kind);
  return (
    <>
      <ToogleCashflowKind
        form="sale"
        field="kind"
        value1="egress"
        value2="income"
      />
      <div className="flex items-center gap-2">
        <MultiSelect
          id="select-category"
          form="sale"
          field="category"
          entity="cashflow"
          placeholder="Categoría"
          action="getCategories"
          flag="kind"
          justOne
          autoFocus
          hideSearch
          className="min-w-20"
          idToFocusAfterSelection="select-sub-category"
          resetOnSelect="sub_category"
          disabled={!canUpdate}
        />
        <MultiSelect
          id="select-sub-category"
          form="sale"
          field="sub_category"
          entity="cashflow"
          action="getSubCategories"
          filterIdField="category"
          placeholder="Subcategoría"
          monitorField="category"
          shouldHide={(category) => category?.name === "Retiro"}
          justOne
          autoFocus
          disabled={!canUpdate}
        />
      </div>
      <div className="flex gap-1 w-full">
        <DatePicker
          id="sale-date-picker"
          entity="sale"
          field="date"
          placeholder="Fecha de operación"
          fromDate={user.role === "Socio" ? new Date(2025, 0, 1) : new Date()}
          disabled={!canUpdate}
          // toDate={addDays(new Date(), 6)}
        />
        <MyTimeInput disabled={!canUpdate} form="sale" field="date" />
      </div>

      <MyInput
        id="sale-amount"
        placeholder="Monto"
        entity="sale"
        field="amount"
        type="number"
        disabled={!canUpdate}
      />
      <MyInput
        id="sale-detail"
        placeholder="Aclaraciones..."
        entity="sale"
        field="detail"
        disabled={!canUpdate}
      />
      {kind && (
        <>
          <div className="flex items-center gap-2 mt-10">
            <span className=" underline font-bold">Saldar movimiento </span>
            <span className="font-extralight text-sm">(opcional)</span>
          </div>
          <MultiSelect
            id="select-wallet"
            form="sale"
            field="wallet"
            entity="wallet"
            justOne
            hideSearch
            monitorField="kind"
            placeholder={(kind) =>
              kind === "income"
                ? "¿A dónde ingresó el dinero?"
                : "¿De dónde salió el dinero?"
            }
            disabled={!canUpdate}
          />
        </>
      )}
    </>
  );
};

export default SaleForm;
