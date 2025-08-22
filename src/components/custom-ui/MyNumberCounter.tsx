"use client";

import { useStore } from "@/stores";
import { Minus, Plus } from "lucide-react";
import {
  Button,
  Group,
  Input,
  Label,
  NumberField,
} from "react-aria-components";

export default function MyNumberCounter({ entity, field, isMP }) {
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[entity][field]);
  return (
    <NumberField
      defaultValue={value}
      onChange={(number) => {
        update(entity, { [field]: number });
        if (number > 1 && isMP) {
          update("subscription", { plan_id: "678ceea2e419003eb3c14566" });
          update("subscription-plan", { _id: "678ceea2e419003eb3c14566" });
        }
      }}
      minValue={1}
      maxValue={5}
    >
      <div className="space-y-2">
        <Label className="text-md text-foreground">
          Cantidad de sucursales
        </Label>
        <Group className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none  data-[focus-within]:ring-ring/20">
          <Button
            slot="decrement"
            className="-ms-px flex aspect-square h-[inherit] items-center justify-center rounded-s-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Minus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
          <Input className="w-full grow bg-background px-3 py-2 text-center tabular-nums text-foreground focus:outline-none" />
          <Button
            slot="increment"
            className="-me-px flex aspect-square h-[inherit] items-center justify-center rounded-e-lg border border-input bg-background text-sm text-muted-foreground/80 transition-shadow hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </Group>
      </div>
    </NumberField>
  );
}
