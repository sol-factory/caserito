"use client";

import { DatePicker } from "@/components/custom-ui/DatePicker";
import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import useFlags from "@/hooks/use-falgs";
import MyTextArea from "@/components/custom-ui/MyTextArea";

const SecondaryCashflowForm = ({ user, creating, canUpdate, canCreate }) => {
  const { getFlag } = useFlags();
  return (
    <>
      <DatePicker
        id="cashflow-date-picker"
        entity="cashflow"
        field="date"
        disabled={!canUpdate}
        fromDate={new Date(2025, 0, 1)}
        toDate={user.email === "mgesualdo14@gmail.com" ? undefined : new Date()}
        // toDate={addDays(new Date(), 6)}
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
