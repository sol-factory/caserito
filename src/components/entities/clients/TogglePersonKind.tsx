"use client";
import { useId } from "react";
import { Building, User } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useStore } from "@/stores";

export default function TooglePersonKind({ form, field, value1, value2 }) {
  const id = useId();
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[form][field]);

  const muted1 = `group-data-[state=${value2}]:text-muted-foreground/70`;
  const muted2 = `group-data-[state=${value1}]:text-muted-foreground/70`;
  const translation1 = `data-[state=person]:after:translate-x-0`;
  const translation2 = `data-[state=company]:after:translate-x-full`;

  return (
    <div className="bg-input/50 inline-flex h-9 rounded-md p-0.5 w-full">
      <RadioGroup
        value={value}
        onValueChange={(newValue) => update(form, { [field]: newValue })}
        className={`w-full group after:bg-background has-focus-visible:after:border-ring has-focus-visible:after:ring-ring/50 relative inline-grid grid-cols-[1fr_1fr] items-center gap-0 text-sm font-medium after:absolute after:inset-y-0 after:w-1/2 after:rounded-sm after:shadow-xs after:transition-[translate,box-shadow] after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] has-focus-visible:after:ring-[3px] ${translation1} ${translation2}`}
        data-state={value}
      >
        <label
          className={`flex-1 ${muted1} relative z-10 inline-flex h-full min-w-8 w-full cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none`}
        >
          <User className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Persona
          <RadioGroupItem id={`${id}-1`} value={value1} className="sr-only" />
        </label>
        <label
          className={`flex-1 ${muted2} relative z-10 inline-flex h-full min-w-8 w-full cursor-pointer items-center justify-center px-4 whitespace-nowrap transition-colors select-none`}
        >
          <Building className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Empresa
          <RadioGroupItem id={`${id}-2`} value={value2} className="sr-only" />
        </label>
      </RadioGroup>
    </div>
  );
}
