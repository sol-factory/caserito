"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createQueryString } from "@/helpers/url";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const items = [
  { id: "radio-14-r1", value: "day", label: "Diaria" },
  { id: "radio-14-r2", value: "week", label: "Semanal" },
];

export default function RadioOptions() {
  const searchParams = useSearchParams();
  const group_by = searchParams.get("group_by") || "day";

  const pathname = usePathname();
  const router = useRouter();

  return (
    <RadioGroup className="flex flex-wrap gap-2" defaultValue={group_by}>
      {items.map((item) => (
        <div
          key={item.id}
          className="relative flex flex-col items-start gap-4 rounded-lg border border-input px-3 py-[0.55rem] shadow-sm shadow-black/5 has-[[data-state=checked]]:border-ring"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem
              onClick={() => {
                // Necesio que respete los demás params que ya existían en la URL
                router.push(
                  `${pathname}?${createQueryString(searchParams, "group_by", item.value, pathname)}`
                );
              }}
              id={item.id}
              value={item.value}
              className="after:absolute after:inset-0"
            />
            <Label htmlFor={item.id}>{item.label}</Label>
          </div>
        </div>
      ))}
    </RadioGroup>
  );
}
