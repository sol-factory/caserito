import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/stores";

const items = [
  { id: "radio-14-r1", value: "r1", label: "Solo 1", stores: 1 },
  { id: "radio-14-r2", value: "r2", label: "2 a 5", stores: 2 },
  { id: "radio-14-r3", value: "r3", label: "+ de 5", stores: 3 },
];

export default function SelectWithCards() {
  const update = useStore((s) => s.update);
  const stores = useStore((s) => s.subscription.stores);

  return (
    <fieldset className="space-y-4 !mt-5 block">
      <legend className="text-sm font-medium leading-none text-foreground">
        Cantidad de sucursales
      </legend>
      <RadioGroup className="flex flex-wrap gap-2" defaultValue="r1">
        {items.map((item) => (
          <div
            key={item.id}
            className="relative flex flex-col items-start gap-4 rounded-lg border border-input p-3 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
            onClick={() => update("subscription", { stores: item.stores })}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={item.id}
                value={item.value}
                className="after:absolute after:inset-0"
              />
              <Label htmlFor={item.id}>{item.label}</Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
