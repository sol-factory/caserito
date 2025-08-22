import { useStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { DropdownSkeletonComponent } from "./Skeletons";
import { cn, focusAfter, userPressed } from "@/helpers/ui";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import { toProperCase } from "@/helpers/text";
import api from "@/helpers/api";
import { useRouter } from "next/navigation";
import { Building, Eraser, ListChecks, User } from "lucide-react";
import { useEffect } from "react";

const ICONS = {
  person: <User className="w-3.5 h-3.5 text-blue-600" strokeWidth={1.7} />,
  company: <Building className="w-3.5 h-3.5 text-teal-600" strokeWidth={1.7} />,
};

export const PreName = ({ pre_name, tiny = false, icon = null }) => {
  const imageSize = tiny ? 16 : 20;
  const imageSizeRem = tiny ? "!min-w-4" : "!min-w-5";
  const emojiSize = tiny ? "text-lg" : "text-lg";
  if (icon) {
    return <div className="mr-2">{ICONS[icon]}</div>;
  }
  return pre_name ? (
    pre_name.includes("https") ? (
      <div className="mr-2 text-lg">
        <Image
          src={pre_name + "?h=as"}
          width={imageSize}
          height={imageSize}
          alt="Image"
          className={imageSizeRem}
        />
      </div>
    ) : (
      <span className={`${emojiSize} ${tiny ? "mr-2" : "ml-1 mr-3"}`}>
        {pre_name}
      </span>
    )
  ) : null;
};
export const AfterName = ({ after_name, tiny = false, icon = null }) => {
  const imageSize = tiny ? 16 : 20;

  const emojiSize = tiny ? "text-lg" : "text-lg";
  if (icon) {
    return <div className="mr-2">{ICONS[icon]}</div>;
  }
  return after_name ? (
    after_name.includes("https") ? (
      <div className="text-lg ml-1.5 !drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)]">
        <Image
          src={after_name + "?h=as"}
          width={imageSize}
          height={imageSize}
          alt="Image"
          className={cn("!drop-shadow-[0_0.5px_0.3px_rgba(0,0,0,1)]")}
        />
      </div>
    ) : (
      <span className={`${emojiSize} ${tiny ? "mr-2" : "ml-1 mr-3"}`}>
        {after_name}
      </span>
    )
  ) : null;
};

const MultiSelectItems = ({
  entity,
  form,
  flag,
  filterIdField,
  handleSelect,
  selectedItems,
  allSelectedByDefault,
  field,
  isOpen,
  prefetch,
  items,
  action,
  propercase = false,
}) => {
  const update = useStore((s) => s.update);
  const creating = useStore((s) => s.creating);
  const store_country_code = useStore((s) => s.current_store.country_code);
  const searchText = useStore((s) => s.searchText);
  const allow_multi_currency = useStore(
    (s) => s.current_store?.allow_multi_currency
  );
  const filter = useStore((s) => s[form][filterIdField]) as { _id: string };
  const flagValue = useStore((s) => s[form][flag]) as { _id: string };

  const filterId =
    entity === "config" ? field : filter ? filter._id : undefined;

  const enabled = !!filterIdField ? !!filterId && isOpen : isOpen;
  const router = useRouter();

  const { data, isPending } = useQuery({
    queryKey: [entity, form, filterId, flagValue, searchText, action],
    staleTime: 5000,
    queryFn: async () => {
      const data = await api(
        {
          filterId,
          form,
          searchText,
          flag,
          flagValue,
          allow_multi_currency,
          store_country_code,
        },
        entity,
        action,
        router
      );

      return data || [];
    },
    enabled: (enabled || (prefetch && creating)) && !items,
  });

  useEffect(() => {
    if (allSelectedByDefault && creating && data?.length > 0) {
      update(form, { [field]: data });
    }
  }, [data]);

  if (isPending && !items) return <DropdownSkeletonComponent />;

  let finalData = items || data || [];

  if (items && filterId) {
    finalData = items.filter((i) => i.filterId === filterId);
  }

  const noRecordsFoundMessage = {
    client: "No se encontraron clientes",
    vehicle: "El cliente no posee vehículos",
    service: "No se encontraron servicios",
    store: "No se encontraron sucursales",
    "vehicle-kind": "No se encontraron tipos de vehículos",
  };

  const allSelected = selectedItems?.length === finalData?.length;

  if (Array.isArray(finalData) && finalData.length > 0) {
    return (
      <>
        {entity === "vehicle-kind" &&
          !["client", "vehicle"].includes(form) &&
          !allSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                update(form, { [field]: finalData });
              }}
              className="flex py-2 items-center justify-center gap-1.5 hover:text-blue-600 hover:underline w-full text-xs font-extralight"
            >
              <ListChecks className="w-3.5 h-3.5" strokeWidth={1} />
              Seleccionar todos
            </button>
          )}
        {entity === "vehicle-kind" && form !== "client" && allSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              update(form, { [field]: [] });
            }}
            className="flex py-2 items-center justify-center gap-1.5 hover:text-red-600 hover:underline w-full text-xs font-extralight"
          >
            <Eraser className="w-3.5 h-3.5" strokeWidth={1} />
            Borrar selección
          </button>
        )}
        {finalData?.map((i, index) => {
          let isSelected = false;
          if (Array.isArray(selectedItems)) {
            isSelected = selectedItems?.some((si) => si._id === i._id);
          } else {
            isSelected = selectedItems?._id === i._id;
          }

          return (
            <SelectItem
              id={`item-${index}`}
              onKeyDown={(e) => {
                let id;
                if (["ArrowDown"].includes(e.code)) {
                  update("openSelect", field);
                  id = index === data?.length - 1 ? 0 : index + 1;
                }
                if (["ArrowUp"].includes(e.code)) {
                  update("openSelect", field);
                  // const id = index === 0 ? data?.length - 1 : index - 1;
                }
                focusAfter(`item-${id}`, 0);
                if (userPressed("Enter", e.code)) {
                  handleSelect(i);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(i, finalData.length === 1);
              }}
              key={i._id}
              value={`${i._id}`}
              className={`hover:sm:bg-gray-100 focus:bg-blue-100 my-1 ${
                isSelected ? "bg-gray-100" : ""
              } !rounded-md outline-none cursor-pointer`}
            >
              <div className="flex items-center">
                <PreName pre_name={i.pre_name || i.emoji} icon={i.icon} />
                <div className="flex flex-col font-normal max-w-48 sm:max-w-60 md:max-w-80">
                  <div className="flex items-center gap-1">
                    <span>{propercase ? toProperCase(i.name) : i.name}</span>
                    {i.value > 0 && entity === "client" && (
                      <span className="font-extralight text-[11px] text-blue-500">{`(${i.value})`}</span>
                    )}
                  </div>

                  {i.detail && (
                    <span className="text-muted-foreground text-[11px] leading-3 font-extralight">
                      {i.detail}
                    </span>
                  )}
                </div>
                <AfterName after_name={i.after_name} />
              </div>
            </SelectItem>
          );
        })}
      </>
    );
  } else {
    return (
      <div className="flex h-20 w-full items-center justify-center text-muted-foreground font-extralight">
        <span className="max-w-52 text-center text-sm">
          {noRecordsFoundMessage[entity] || "No se encontraron registros"}{" "}
          {searchText ? "para esta búsqueda" : ""}
        </span>
      </div>
    );
  }
};

export default MultiSelectItems;
