"use client";

import { useStore } from "@/stores";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { focusAfter } from "@/helpers/ui";
import { cn } from "@/lib/utils";
import MyInfoTooltip from "./MyInfoTooltip";

export default function MyCheckboxField({
  id,
  text,
  entity,
  field,
  children,
  className = null,
}) {
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[entity][field]);
  const handleClick = (e) => {
    e.stopPropagation();
    update(entity, { [field]: !value });
  };

  return (
    <div
      className={cn(
        `flex items-start gap-2 cursor-pointer py-1 rounded`,
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        focusAfter(id, 0, true);
      }}
    >
      <Checkbox
        id={id}
        className="order-1"
        onClick={handleClick}
        checked={value}
        defaultChecked={value}
        aria-describedby={`${id}-description`}
      />

      <Label
        htmlFor={id}
        className="flex items-center text-sm font-light gap-2 cursor-pointer w-full"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        {text}{" "}
        <MyInfoTooltip text={text} id={`${id}-tooltip`}>
          {children}
        </MyInfoTooltip>
      </Label>
    </div>
  );
}
