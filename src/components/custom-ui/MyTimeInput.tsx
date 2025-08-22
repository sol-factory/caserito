"use client";

import { cn, focusAfter } from "@/helpers/ui";
import { useStore } from "@/stores";
import { Time } from "@internationalized/date";
import { useEffect } from "react";
import { DateInput, DateSegment, TimeField } from "react-aria-components";

export default function MyTimeInput({
  disabled = false,
  form = "sale",
  field,
  from_hour_field,
  dateFieldId,
}: {
  field: string;
  form: any;
  from_hour_field?: string;
  disabled?: boolean;
  dateFieldId?: string;
}) {
  const update = useStore((s) => s.update);
  const form_date = useStore((s) => s[form][field]);
  const checkInDate = useStore((s) => s[form][from_hour_field]);
  const date = new Date(form_date);

  const dateHours = date.getHours();
  const dateMinutes = date.getMinutes();

  let timeValue =
    dateHours === 0 || isNaN(dateHours)
      ? new Time(8, 0)
      : new Time(dateHours, dateMinutes);

  const handleChange = (time) => {
    if (!time || !form_date) return;
    date.setHours(time.hour);
    const currentMinutes = date.getMinutes();
    let minutes;

    if (currentMinutes < time.minute) {
      minutes = Math.ceil(time.minute / 5) * 5;
    } else {
      minutes = Math.floor(time.minute / 5) * 5;
    }
    minutes = time.minute === 56 ? 0 : minutes;
    minutes = time.minute === 59 ? 55 : minutes;

    date.setMinutes(minutes === 60 ? 0 : minutes);

    update(form, { [field]: date });
  };

  useEffect(() => {
    if (dateHours === 0) {
      handleChange(timeValue);
    }
  }, [dateHours]);

  if (!form_date) {
    timeValue = null;
  }
  return (
    <TimeField
      id={field}
      className="space-y-2 relative"
      value={timeValue}
      hourCycle={24}
      defaultValue={new Time(date.getHours(), date.getMinutes(), 0, 0)}
      isReadOnly={disabled}
      onChange={handleChange}
      onFocus={(e) => {
        e.stopPropagation();
        if (!form_date) {
          focusAfter(dateFieldId, 0, true);
        }
        update("openSelect", "");
      }}
    >
      <div onPointerDown={(e) => console.log(e)}>
        <DateInput className="!z-100 relative inline-flex h-9 w-full items-center whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
          {(segment) => (
            <>
              {true && (
                <span
                  className={`absolute !-top-[0.3rem] rounded-sm px-1 leading-tight 
              start-0 md:start-2 bg-white text-gray-500 text-[8px] !z-100`}
                >
                  Horario
                </span>
              )}
              <DateSegment
                segment={segment}
                className={cn(
                  "inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50",
                  disabled && "cursor-default"
                )}
              />
            </>
          )}
        </DateInput>
      </div>
    </TimeField>
  );
}
