"use client";

import { DatePicker } from "@/components/custom-ui/DatePicker";
import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import useFlags from "@/hooks/use-falgs";
import { differenceInCalendarDays } from "date-fns";
import CancellingAmount from "./CancellingAmount";
import MyTextArea from "@/components/custom-ui/MyTextArea";
import ToogleCashflowKind from "./ToggleCashflowKind";

const SecondaryCashflowForm = ({ user, creating, canUpdate, canCreate }) => {
  const { getFlag } = useFlags();
  return (
    <>
      <ToogleCashflowKind
        form="cashflow"
        field="kind"
        value1="egress"
        value2="income"
        disabled={!creating}
      />

      <DatePicker
        id="cashflow-date-picker"
        entity="cashflow"
        field="date"
        disabled={!canUpdate}
        fromDate={new Date(2025, 0, 1)}
        toDate={user.email === "mgesualdo14@gmail.com" ? undefined : new Date()}
        // toDate={addDays(new Date(), 6)}
      />
      <div className="flex items-center gap-2">
        <MultiSelect
          id="select-category"
          form="cashflow"
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
          disabled={!canUpdate && !canCreate}
        />
        <MultiSelect
          id="select-sub-category"
          form="cashflow"
          field="sub_category"
          entity="cashflow"
          action="getSubCategories"
          filterIdField="category"
          placeholder="Subcategoría"
          idToFocusAfterSelection={(newValue) =>
            ["Venta de productos", "Membresías"].includes(newValue.name)
              ? "cashflow-client"
              : "select-wallet"
          }
          monitorField="category"
          shouldHide={(category) => category?.name === "Retiro"}
          justOne
          autoFocus
          disabled={!canUpdate && !canCreate}
        />
      </div>
      <MultiSelect
        id="cashflow-client"
        entity="client"
        form="cashflow"
        field="client"
        searchPlaceholder="Buscar por nombre, celular o patente..."
        idToFocusAfterSelection="select-wallet"
        monitorField="sub_category"
        shouldHide={(sub_category) =>
          !["Venta de productos", "Membresías"].includes(sub_category?.name)
        }
        resetOnSelect="vehicle"
        justOne
        propercase
        disabled={!canUpdate}
      />
      <MultiSelect
        id="select-wallet"
        form="cashflow"
        field="wallet"
        entity="wallet"
        monitorField="kind"
        placeholder={(monitorValue) =>
          `¿${monitorValue === "egress" ? "De dónde salió" : "A dónde ingresó"} el dinero?`
        }
        justOne
        hideSearch
        idToFocusAfterSelection="cashflow-amount"
        disabled={!canUpdate && !canCreate}
      />
      <MyInput
        id="cashflow-amount"
        entity="cashflow"
        monitoredField="wallet"
        shouldHideField="kind"
        placeholder={(wallet, kind) => {
          return !wallet?.currency
            ? "Monto"
            : `Monto ${kind === "egress" ? "abonado" : "recibido"} en ${getFlag(wallet.currency)}`;
        }}
        field="amount"
        type="number"
        disabled={!canUpdate && !canCreate}
      />

      <MyTextArea
        id="cashflow-detail"
        placeholder="Detalle..."
        entity="cashflow"
        field="detail"
        type="text"
        disabled={!canUpdate && !canCreate}
      />
    </>
  );
};

export default SecondaryCashflowForm;
