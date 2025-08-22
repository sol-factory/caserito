"use client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useStore } from "@/stores";

export function ToggleInput({ items, defaultValue, form, field }) {
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[form][field]);

  return (
    <ToggleGroup type="single" defaultValue={defaultValue} className="w-full">
      {items.map((i) => {
        const isSelected = value === i.value;
        return (
          <ToggleGroupItem
            variant="outline"
            className={`w-full ${isSelected ? "" : "!text-muted-foreground"}`}
            value={i.value}
            aria-label="Toggle bold"
            key={i.value}
            onClick={() => {
              update(form, { [field]: i.value });
            }}
          >
            {i.name}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
