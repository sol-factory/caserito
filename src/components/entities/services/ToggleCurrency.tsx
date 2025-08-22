"use client";
import { useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/stores";
import useFlags from "@/hooks/use-falgs";

const staticTranslationClasses = {
  ars: "data-[state=ars]:after:translate-x-0",
  clp: "data-[state=clp]:after:translate-x-0",
  mxn: "data-[state=mxn]:after:translate-x-0",
  usd: "data-[state=usd]:after:translate-x-full",
};
const staticMutedClasses = {
  ars: `group-data-[state=ars]:text-muted-foreground/70`,
  clp: `group-data-[state=clp]:text-muted-foreground/70`,
  mxn: `group-data-[state=mxn]:text-muted-foreground/70`,
  usd: `group-data-[state=usd]:text-muted-foreground/70`,
};

export function ToogleTinyCurrency({ form, field, value1, value2 }) {
  const id = useId();
  const { getFlag } = useFlags();
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[form][field]);

  const muted1 = staticMutedClasses[value2];
  const muted2 = staticMutedClasses[value1];
  const translation1 = staticTranslationClasses[value1];
  const translation2 = staticTranslationClasses[value2];

  return (
    <div className="bg-input/50 inline-flex h-4 text-[0.6rem] rounded-lg p-0.5 w-full mb-1">
      <RadioGroup
        value={value}
        onValueChange={(newValue) => update(form, { [field]: newValue })}
        className={`w-full group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] ${translation1} ${translation2}`}
        data-state={value}
      >
        <label
          className={`flex-1 ${muted1} h-3 text-[0.5rem] relative z-10 inline-flex min-w-8 w-full cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none`}
        >
          {getFlag()} Pesos
          <RadioGroupItem id={`${id}-1`} value={value1} className="sr-only" />
        </label>
        <label
          className={`flex-1 ${muted2} text-[0.5rem] h-3 relative z-10 inline-flex min-w-8 w-full cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none`}
        >
          🇺🇸 Dólares
          <RadioGroupItem id={`${id}-2`} value={value2} className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
export default function ToogleCurrency({ form, field, value1, value2 }) {
  const id = useId();
  const { getFlag } = useFlags();
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[form][field]);

  const muted1 = staticMutedClasses[value2];
  const muted2 = staticMutedClasses[value1];
  const translation1 = staticTranslationClasses[value1];
  const translation2 = staticTranslationClasses[value2];

  return (
    <div className="bg-input/50 inline-flex h-9 rounded-md p-0.5 w-full mb-1">
      <RadioGroup
        value={value}
        onValueChange={(newValue) => update(form, { [field]: newValue })}
        className={`w-full group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-md after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] ${translation1} ${translation2}`}
        data-state={value}
      >
        <label
          className={`flex-1 ${muted1} relative z-10 inline-flex h-full min-w-8 w-full cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none`}
        >
          {getFlag()} Pesos
          <RadioGroupItem id={`${id}-1`} value={value1} className="sr-only" />
        </label>
        <label
          className={`flex-1 ${muted2} relative z-10 inline-flex h-full min-w-8 w-full cursor-pointer items-center justify-center px-2 whitespace-nowrap transition-colors select-none`}
        >
          🇺🇸 Dólares
          <RadioGroupItem id={`${id}-2`} value={value2} className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
