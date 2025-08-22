"use client";
import { tackArrayField, useStore, type StateStore } from "@/stores";
import type {
  HTMLInputAutoCompleteAttribute,
  HTMLInputTypeAttribute,
} from "react";
import { Input } from "../ui/input";
import CountrySelector from "./CountrySelector";
import { validatePhone } from "@/helpers/phones";
import { ENTITIES } from "@/config";
import { cn } from "@/lib/utils";

interface Props<E extends keyof StateStore> {
  id?: string | number | undefined;
  type?: HTMLInputTypeAttribute;
  entity: E;
  field: keyof StateStore[E];
  index?: number;
  min?: number;
  max?: number;
  formIndex?: number;
  maxLength?: number;
  arrayField?: string;
  currency?: string;
  placeholder?:
    | string
    | ((monitoredFieldValue: any, shouldHideFieldValue: any) => string);
  monitoredField?: string;
  autocomplete?: HTMLInputAutoCompleteAttribute;
  required?: boolean;
  idFocusAfterTab?: string;
  idToFilterArray?: string;
  idField?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  trim?: boolean;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  whole?: boolean;
  cleanWhiteSpaces?: boolean;
  shouldHideField?: string;
  shouldHide?: (shouldHideFieldValue: any, monitoredFieldValue: any) => boolean;
  className?: string;
  inputClassName?: string;
  placeholderClassName?: string;
}
const MyInput = <E extends keyof StateStore>({
  id,
  type = "text",
  entity,
  field,
  index,
  formIndex = 0,
  min,
  max,
  arrayField,
  placeholder,
  autocomplete = "off",
  required,
  idToFilterArray = "",
  idField = "_id",
  disabled = false,
  trim = false,
  toLowerCase = false,
  toUpperCase = false,
  whole = false,
  maxLength = null,
  cleanWhiteSpaces = false,
  shouldHide = () => false,
  shouldHideField = "",
  monitoredField = "",
  autoFocus,
  className,
  inputClassName,
  placeholderClassName = null,
}: Props<E>) => {
  const value = useStore((s) =>
    arrayField ? null : s[entity][field]
  ) as string;
  const country = useStore((s) => s[entity].country);
  const shouldHideFieldValue = useStore((s) => s[entity][shouldHideField]);
  const monitoredFieldValue = useStore((s) =>
    monitoredField ? s[entity][monitoredField] : null
  );
  const creating = useStore((s) => s.creating);
  const arrayValue = useStore((s) =>
    tackArrayField({
      s,
      entity,
      arrayField,
      field,
      index,
      idToFilterArray,
      idField,
    })
  );

  const formatted_phone = useStore((s) => s[entity].formatted_number);
  const errorMessage = useStore((s) => s.errors[field]);
  const update = useStore((s) => s.update);
  const updateArray = useStore((s) => s.updateArray);
  const isTel = type === "tel";
  const isNum = type === "number";

  if (shouldHide(shouldHideFieldValue, monitoredFieldValue)) return <></>;

  const finalPlaceholder =
    typeof placeholder === "function"
      ? placeholder(monitoredFieldValue, shouldHideFieldValue)
      : placeholder;

  return (
    <div className={cn("flex items-start gap-2 relative", className)}>
      {(!!value ||
        (typeof value === "number" && value === 0) ||
        (arrayField && !!arrayValue)) && (
        <span
          className={`absolute text-[8px] !-top-[0.25rem] !sm:-top-[0.35rem]  rounded-sm px-1 ${
            isTel ? "start-20 sm:start-24" : "start-1"
          } bg-white ${
            disabled ? "text-muted-foreground" : "text-gray-500"
          } z-10 ${placeholderClassName}`}
        >
          {finalPlaceholder}{" "}
        </span>
      )}

      {isTel && (
        <CountrySelector
          placeholder="País"
          entity={entity}
          field="country"
          idToFocusAfterSelection={String(id)}
        />
      )}
      <div className="w-full relative">
        <Input
          id={String(id)}
          name={field as string}
          readOnly={disabled}
          type={type}
          maxLength={maxLength}
          className={cn(
            `placeholder:text-zinc-400 placeholder:font-light ${
              !!errorMessage ? "ring-1 ring-red-400 outline-none" : ""
            } py-2 ${arrayField ? "text-end w-24" : ""} ${disabled ? "cursor-default select-none" : ""}`,
            inputClassName
          )}
          placeholder={finalPlaceholder}
          value={
            arrayField
              ? arrayValue || ""
              : isTel
                ? formatted_phone || value || ""
                : (value ?? "")
          }
          autoComplete={autocomplete}
          required={required}
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if ([".", ","].includes(e.key) && whole) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            let valueToSet: any = e.target.value;
            let formatted_phone: any = e.target.value;

            if (!!max) {
              valueToSet = Math.min(valueToSet, max);
            }
            if (!!min) {
              valueToSet = Math.max(valueToSet, min);
            }

            if (trim) {
              valueToSet = valueToSet.trim();
            }
            if (toLowerCase) {
              valueToSet = valueToSet.toLowerCase();
            }
            if (toUpperCase) {
              valueToSet = valueToSet.toUpperCase();
            }

            if (cleanWhiteSpaces) {
              valueToSet = valueToSet.replace(/\s+/g, ""); // Elimina todos los espacios y caracteres de espacio \s coincide con cualquier tipo de espacio en blanco (incluyendo \t, \n, y otros).
            }

            const entityShape = ENTITIES[entity as any] || {};
            const hasUpdateSchema = "updateSchema" in entityShape;
            const shouldUseUpdateSchema = hasUpdateSchema && !creating;
            const schema = shouldUseUpdateSchema
              ? "updateSchema"
              : "createSchema";

            const schemaToValidate = entityShape[schema];
            const finalSchema = Array.isArray(schemaToValidate)
              ? schemaToValidate[formIndex]
              : schemaToValidate;

            if (!!schemaToValidate && finalSchema.shape[field] && !arrayField) {
              const { success, error } =
                finalSchema.shape[field]?.safeParse(valueToSet) || {};
              if (!success && !!valueToSet) {
                const error_message = error.issues[0].message;

                update("errors", { [field]: error_message });
              } else {
                update("errors", { [field]: undefined });
              }
            }
            if (!arrayField) {
              if (isTel && !!valueToSet && !!country?.code) {
                const phone: any = validatePhone({
                  number: valueToSet,
                  countryCode: country?.code,
                });
                valueToSet = phone.isValid ? phone?.number : valueToSet;
                formatted_phone =
                  phone.formattedNumber.length > 1
                    ? phone?.formattedNumber
                    : valueToSet;

                update("errors", {
                  [field]: phone.isValid ? "" : "Teléfono inválido",
                });
              }

              if (isNum) {
                valueToSet = !valueToSet ? null : +valueToSet;
              }

              update(entity, {
                [field]: valueToSet,
              });
              if (isTel) {
                update(entity, {
                  formatted_number: formatted_phone,
                });
              }
            } else {
              updateArray(
                entity,
                isNum ? +valueToSet : valueToSet,
                field,
                arrayField,
                index,
                idToFilterArray,
                idField
              );
            }
          }}
        />
        {!!errorMessage && (
          <span className="text-[9px] text-red-600 leading-tight mt-1 pl-1 block">
            {errorMessage}
          </span>
        )}
      </div>
    </div>
  );
};

export default MyInput;
