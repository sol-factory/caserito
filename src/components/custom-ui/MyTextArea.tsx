"use client";
import { tackArrayField, useStore, type StateStore } from "@/stores";
import type {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";
import { Textarea } from "../ui/textarea";
import { userPressed } from "@/helpers/ui";

interface Props<E extends keyof StateStore> {
  id?: string | number | undefined;
  type?: HTMLInputTypeAttribute;
  entity: E;
  field: keyof StateStore[E];
  index?: number;
  rows?: number;
  arrayField?: string;
  idToFilterArray?: string;
  idField?: string;
  placeholder?: string;
  autocomplete?: HTMLInputAutoCompleteAttribute;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}
const MyTextArea = <E extends keyof StateStore>({
  id,
  entity,
  field,
  arrayField,
  idToFilterArray,
  idField = "_id",
  placeholder,
  rows = 6,
  autocomplete = "off",
  required,
  index,
  disabled = false,
  autoFocus,
}: Props<E>) => {
  const value = useStore((s) => s[entity][field]) as string;
  const arrayValue = useStore((s) =>
    tackArrayField({
      s,
      entity,
      field,
      arrayField,
      index,
      idToFilterArray,
      idField,
    })
  );
  const update = useStore((s) => s.update);
  const updateArray = useStore((s) => s.updateArray);

  return (
    <div className="relative">
      {!!value && (
        <span
          className={`absolute text-[8px] left-2 !-top-[0.25rem] !sm:-top-[0.35rem]  rounded-sm px-1  bg-white text-gray-500 z-10 `}
        >
          {placeholder}
        </span>
      )}

      <Textarea
        id={String(id)}
        name={field as string}
        className="placeholder:text-zinc-400 placeholder:font-light !-line"
        placeholder={placeholder}
        disabled={disabled}
        value={arrayField ? arrayValue || "" : value}
        autoComplete={autocomplete}
        onKeyDown={(e) => {
          if (userPressed("Enter", e.code)) {
            e.stopPropagation();
          }
        }}
        rows={rows}
        required={required}
        autoFocus={autoFocus}
        onChange={(e) => {
          if (!arrayField) {
            update(entity, {
              [field]: e.target.value,
            });
          } else {
            updateArray(
              entity,
              e.target.value,
              field,
              arrayField,
              index,
              idToFilterArray,
              idField
            );
          }
        }}
      />
    </div>
  );
};

export default MyTextArea;
