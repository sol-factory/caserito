import {
  Select,
  SelectItem,
  SelectContent,
  SelectGroup,
  SelectTrigger,
} from "../ui/select";
import { useStore } from "@/stores";
import { focusAfter, userPressed } from "@/helpers/ui";
import { CONFIG, COUNTRIES } from "@/config/constanst";
import Image from "next/image";

const CountrySelector = ({
  placeholder,
  entity,
  field = "country",
  idToFocusAfterSelection = null,
}) => {
  const update = useStore((s) => s.update);
  const openSelect = useStore((s) => s.openSelect);
  const country = useStore((s) => s[entity][field]);

  const isOpen = openSelect === field;

  const handleSelect = (e, c) => {
    e.stopPropagation();
    update(entity, { country: c });
    update("openSelect", "");
    if (!!idToFocusAfterSelection) {
      focusAfter(idToFocusAfterSelection);
    }
  };

  return (
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
      <SelectTrigger
        tabIndex={!country ? 1 : -1}
        className="w-[95px] px-3"
        onKeyDown={(e) => {
          e.stopPropagation();
          if (["Enter", "ArrowDown"].includes(e.code)) {
            update("openSelect", field);
          }
          focusAfter("my-input");
        }}
        onClick={(e) => {
          e.stopPropagation();
          focusAfter("my-input");
          update("openSelect", isOpen ? "" : field);
          update("searchText", "");
        }}
      >
        {!country ? (
          <span className="text-gray-400">{placeholder}</span>
        ) : (
          <Image
            src={`${
              CONFIG.blob_url
            }/countries/${country?.code?.toLowerCase()}.png`}
            alt=""
            width={60}
            height={60}
            className="w-6 cursor-pointer rounded-sm hover:scale-105 transition-transform"
            onClick={() => {}}
          />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {COUNTRIES.map((c) => (
            <SelectItem
              className={`hover:bg-gray-100 focus:bg-blue-100 py-[2px] ${
                false ? "bg-gray-100" : ""
              } !rounded-md outline-none cursor-pointer`}
              key={c.name}
              value={c.name}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(e, c);
              }}
              onKeyDown={(e) => {
                if (userPressed("Enter", e.code)) {
                  handleSelect(e, c);
                }
              }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src={`${
                    CONFIG.blob_url
                  }/countries/${c?.code?.toLowerCase()}.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="w-6 cursor-pointer rounded-sm hover:scale-105 transition-transform"
                  onClick={() => {}}
                />
                <span className="text-[13px]">{c.phone_code}</span>
                <span className="text-[13px] text-muted-foreground">
                  {c.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
