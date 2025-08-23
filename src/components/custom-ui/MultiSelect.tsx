"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { StateStore, useStore } from "@/stores";
import { focusAfter } from "@/helpers/ui";
import MultiSelectItems, { AfterName, PreName } from "./MultiSelectItems";
import { cn } from "@/lib/utils";
import { ENTITIES } from "@/config";
import MultiSelectNewItem from "./MultiSelectNewItem";
import MultiSelectSearch from "./MultiSelectSearch";
import { getRandomId } from "@/helpers/text";

type SelectableStates = StateStore;

type Props<E extends keyof SelectableStates> = {
  form: E;
  entity: keyof typeof ENTITIES;
  field: keyof SelectableStates[E];
  filterIdField?: keyof SelectableStates[E];
  resetOnSelect?: keyof SelectableStates["sale" & "cashflow"];
  id?: string;
  items?: {
    _id: string;
    name?: string;
    pre_name?: string;
    value?: any;
    filterId?: string;
  }[];
  idToFocusAfterSelection?: string | ((monitorValue: any) => string);
  filterId?: any;
  flag?: any;
  justOne?: boolean;
  autoFocus?: boolean;
  className?: string;
  containerClassName?: string;
  placeholder?: string | ((monitorValue: any) => void);
  monitorField?: string;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  disabled?: boolean;
  canRepeat?: boolean;
  prefetch?: boolean;
  propercase?: boolean;
  allSelectedByDefault?: boolean;
  action?: string;
  shouldHide?: (state: any) => boolean;
  children?: (selectedItems: any[]) => React.ReactNode;
};

const MultiSelect = <E extends keyof SelectableStates>({
  id,
  idToFocusAfterSelection,
  field,
  filterIdField,
  flag,
  form = null,
  entity = null,
  resetOnSelect,
  items = null,
  placeholder,
  monitorField,
  searchPlaceholder,
  justOne = false,
  autoFocus = false,
  canRepeat = false,
  allSelectedByDefault = false,
  disabled = false,
  className,
  hideSearch = false,
  prefetch = false,
  action = "getItems",
  containerClassName = "",
  shouldHide = () => false,
  propercase = false,
  children,
}: Props<E>) => {
  const update = useStore((s) => s.update);
  const openSelect = useStore((s) => s.openSelect);
  const monitorValue = useStore((s) => s[form][monitorField]);

  const selectedItems = useStore((s) => s[form][field]) as any;

  const filter = useStore((s) => s[form][filterIdField]) as { _id: string };

  const isMultiSelect = Array.isArray(selectedItems);

  const { singular, plural } = ENTITIES[entity] as any;

  let finalPlaceholder;
  if (typeof placeholder === "function") {
    finalPlaceholder = placeholder(monitorValue);
  } else {
    finalPlaceholder = placeholder || (ENTITIES[entity] as any)?.placeholder;
  }

  const isOpen = openSelect === field;

  const handleItemSelection = (
    item: { _id: string; name: string; value?: number },
    onlyOneOption
  ) => {
    let isSelected = false;
    let newValue;
    if (isMultiSelect) {
      isSelected = selectedItems?.some((si) => si._id === item._id);
      const newItem = {
        ...item,
        uuid: getRandomId(),
      };
      newValue =
        isSelected && !canRepeat
          ? selectedItems.filter((si) => si._id !== item._id)
          : selectedItems.concat(newItem);
    }

    if (justOne) {
      isSelected = selectedItems?._id === item._id;
      newValue = isSelected ? undefined : item;
    }

    update(form, { [field]: newValue });

    if (justOne || onlyOneOption) {
      update("openSelect", "");
      update("searchText", "");
    }
    if (!!resetOnSelect) {
      const value = resetOnSelect === "services" ? [] : undefined;
      update(form, { [resetOnSelect]: value });
    }

    if (field === "services") {
      const totalAmount = newValue
        .filter((s) => !s.currency || s.currency === "ars")
        .reduce((p: number, c) => p + (c.value ?? 0), 0);
      const totalAmountUSD = newValue
        .filter((s) => s.currency === "usd")
        .reduce((p: number, c) => p + (c.value ?? 0), 0);
      update(form, { amount: totalAmount, usd_amount: totalAmountUSD });
    }

    if (!!idToFocusAfterSelection && !isSelected && !shouldHide(monitorValue)) {
      let finalIdtoFocus = idToFocusAfterSelection as string;
      if (idToFocusAfterSelection instanceof Function) {
        finalIdtoFocus = idToFocusAfterSelection(newValue) as string;
      }
      focusAfter(finalIdtoFocus, 100, justOne);
    }
  };

  const quantitySelected = isMultiSelect
    ? selectedItems?.length
    : !selectedItems?._id
      ? 0
      : 1;

  if (shouldHide(monitorValue)) return <></>;

  return (
    <div className={cn("w-full", containerClassName)}>
      <Select
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            update("openDatePicker", "");
          }
          setTimeout(() => {
            let dialog = document.querySelector(
              "div[role=dialog]"
            ) as HTMLDivElement;
            if (!!dialog) {
              dialog.style.pointerEvents = "auto";
              dialog = document.querySelector(
                "div[role=dialog]"
              ) as HTMLDivElement;
            }
          }, 150);
        }}
      >
        <div className="relative">
          {(selectedItems?.length > 0 ||
            (!isMultiSelect && !!selectedItems?._id)) && (
            <span className="absolute z-10 !-top-[0.25rem] sm:!-top-[0.35rem] rounded-sm px-1 start-2 bg-white text-gray-500 text-[8px]">
              {finalPlaceholder}
            </span>
          )}
          <SelectTrigger
            id={id}
            autoFocus={autoFocus}
            className={cn("!w-full", className, disabled && "cursor-default")}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (!disabled) {
                if (["Enter", "ArrowDown"].includes(e.code)) {
                  update("openSelect", field);
                }
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) {
                focusAfter("my-input", 220);
                update("openSelect", isOpen ? "" : field);
                update("searchText", "");
              }
            }}
          >
            {quantitySelected === 0 || !quantitySelected ? (
              <span className="text-gray-400  font-light">
                {finalPlaceholder}
              </span>
            ) : (
              <div className="flex items-start gap-2 max-w-[250px] overflow-hidden">
                {!isMultiSelect && (
                  <div className="flex items-center">
                    <PreName
                      pre_name={selectedItems.pre_name || selectedItems.emoji}
                      tiny
                      icon={selectedItems?.icon}
                    />
                    {field !== "emoji" ? selectedItems.name : ""}
                    {selectedItems.detail && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({selectedItems.detail.toLowerCase()})
                      </span>
                    )}
                    <AfterName after_name={selectedItems.after_name} />
                  </div>
                )}
                {isMultiSelect &&
                  quantitySelected <= 1 &&
                  !children &&
                  selectedItems?.map((fv) => (
                    <span key={fv?._id}>{fv?.name}</span>
                  ))}
                {(quantitySelected > 1 || children) && (
                  <span>
                    {quantitySelected}{" "}
                    {quantitySelected > 1 ? plural : singular} seleccionad
                    {["vehicle-kind", "screen"].includes(entity) ? "a" : "o"}
                    {quantitySelected > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            )}
          </SelectTrigger>
        </div>
        <SelectContent
          className={
            "min-w-0  w-auto max-h-[50vh] sm:max-h-[20rem] overflow-y-auto"
          }
          onEscapeKeyDown={(e) => {
            e.stopPropagation();
            update("openSelect", "");
          }}
        >
          <SelectGroup>
            {!hideSearch && (
              <>
                <MultiSelectSearch
                  singular={singular}
                  placeholder={searchPlaceholder}
                />
                <Separator className="my-1 w-full" />
              </>
            )}

            <MultiSelectItems
              entity={entity}
              field={field}
              form={form}
              allSelectedByDefault={allSelectedByDefault}
              handleSelect={handleItemSelection}
              flag={flag}
              filterIdField={filterIdField}
              selectedItems={selectedItems}
              isOpen={isOpen}
              prefetch={prefetch}
              items={items}
              action={action}
              propercase={propercase}
            />

            {ENTITIES[entity]["ui"]?.selects &&
              ENTITIES[entity]["ui"]?.selects?.newItemInForm(form) &&
              (!filterIdField || (!!filterIdField && filter?._id)) && (
                <MultiSelectNewItem entity={entity} form={form} />
              )}
          </SelectGroup>
          {!justOne && (
            <div className="sticky -bottom-1 w-full bg-white rounded-none">
              <Separator className="my-1 w-full" />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-600 shadow-none"
                  onClick={() => {
                    update("openSelect", "");
                    update("searchText", "");
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
      {!!children && <div> {children(selectedItems)}</div>}
    </div>
  );
};

export default MultiSelect;
