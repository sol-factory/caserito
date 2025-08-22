import MultiSelect from "@/components/custom-ui/MultiSelect";
import MyInput from "@/components/custom-ui/MyInput";

const MemberSalary = () => {
  return (
    <div className="flex flex-col gap-3">
      <MultiSelect
        id="payment_type"
        form="member"
        field="payment_type"
        entity="member"
        placeholder="Tipo de liquidación"
        items={[
          { _id: "fixed", name: "Sueldo fijo" },
          { _id: "percent_of_sales", name: "% sobre ventas" },
          {
            _id: "fixed_plus_commission",
            name: "Sueldo fijo + % sobre ventas",
          },
          {
            _id: "fixed_or_commission",
            name: "Sueldo fijo o % sobre ventas (el mayor)",
          },
        ]}
        justOne
      />
      <MultiSelect
        id="pay_cycle"
        form="member"
        field="pay_cycle"
        entity="member"
        placeholder="Frecuencia de liquidación"
        items={[
          { _id: "daily", name: "Diaria" },
          { _id: "weekly", name: "Semanal" },
          { _id: "monthly", name: "Mensual" },
        ]}
        justOne
        idToFocusAfterSelection="fixed_salary"
      />
      <div className="flex items-center w-full gap-2">
        <MyInput
          id="fixed_salary"
          type="number"
          entity="member"
          field="fixed_salary"
          placeholder="Sueldo fijo"
          shouldHideField="payment_type"
          shouldHide={(payment_type) => {
            return payment_type?._id === "percent_of_sales";
          }}
          min={0}
        />
        <MyInput
          id="sales_percentage"
          type="number"
          entity="member"
          field="sales_percentage"
          placeholder="% sobre ventas"
          shouldHideField="payment_type"
          shouldHide={(payment_type) => {
            return payment_type?._id && payment_type?._id === "fixed";
          }}
          min={0}
          max={100}
        />
      </div>
    </div>
  );
};

export default MemberSalary;
