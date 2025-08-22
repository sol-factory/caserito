"use client";

import { useStore } from "@/stores";
import { Cake } from "lucide-react";
import {
  DateField,
  DateInput,
  DateSegment,
  I18nProvider,
} from "react-aria-components";

export default function BirthdayInput({ entity = "client" }) {
  const update = useStore((s) => s.update);
  const defaultDOB = useStore((s) => s[entity].defaultDOB);

  return (
    <I18nProvider locale="es-AR">
      <DateField
        className="relative"
        defaultValue={defaultDOB}
        onChange={(e) => {
          update("client", {
            dob: e ? { day: e.day, month: e.month, year: e.year } : {},
          });
        }}
      >
        <Cake
          className="absolute z-10 top-2 md:top-[0.45rem] lg:top-[0.4rem] start-3 text-muted-foreground"
          size={20}
          strokeWidth={1.5}
        />
        <DateInput className="relative cursor-text inline-flex pl-10 h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50"
            />
          )}
        </DateInput>
      </DateField>
    </I18nProvider>
  );
}

const BirthdayPart = ({ segment }) => {
  return (
    <DateSegment
      segment={segment}
      className="inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50"
    />
  );
};
