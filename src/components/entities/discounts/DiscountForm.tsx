"use client";

import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";
import { ToggleInput } from "@/components/custom-ui/ToggleInput";
import { useStore } from "@/stores";

const DiscountForm = () => {
  const kind = useStore((s) => s.discount?.kind);
  const max = kind === "%" ? 100 : undefined;
  const placeholder = kind === "%" ? "% Pocentaje" : "$ Monto";

  return (
    <>
      <MyInput
        id="discount-name"
        entity="discount"
        field="name"
        placeholder="Nombre del descuento"
        autoFocus
      />
      <MultiSelect
        form="discount"
        field="stores"
        entity="store"
        placeholder="¿En qué sucursal/es se utiliza?"
        prefetch
      />

      <ToggleInput
        items={[
          { name: "% Porcentaje", value: "%" },
          { name: "$ Monto", value: "$" },
        ]}
        form="discount"
        field="kind"
        defaultValue={kind}
      />

      <MyInput
        entity="discount"
        field="value"
        type="number"
        min={0}
        max={max}
        placeholder={placeholder}
      />
    </>
  );
};

export default DiscountForm;
