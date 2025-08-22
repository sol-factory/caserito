"use client";

import { useRef, useEffect } from "react";
import { useStore } from "@/stores";
import { useQuery } from "@tanstack/react-query";
import { toMoney } from "@/helpers/fmt";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import api from "@/helpers/api";
import { getRandomId } from "@/helpers/text";

export function MyDropdown({
  openText,
  entity = "sale",
  currency = "ars",
  discountsAmountField = "discounts_amount",
}: {
  openText: string;
  entity: "sale" | "quote";
  currency?: string;
  discountsAmountField?: string;
}) {
  const menuId = `discount-${currency}`;
  const update = useStore((s) => s.update);
  const openMenu = useStore((s) => s.openMenu);
  const setOpen = (val: boolean) => update("openMenu", val ? menuId : "");
  const isOpen = openMenu === menuId;

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: discounts = [] } = useQuery({
    queryKey: ["discount"],
    queryFn: async () => {
      const data = await api({}, "discount", "getItems");
      return data || [];
    },
  });

  // Cerrar si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (d: any) => {
    const { discounts, services } = useStore.getState()[entity];

    const servicesAmount = services
      .filter((s) => s.currency === currency)
      .reduce((prev, curr) => prev + curr.value * curr.quantity, 0);
    const newDiscounts = discounts.concat({
      _id: d._id,
      uuid: getRandomId(),
      kind: d.kind,
      name: d.name,
      value: d.value,
      currency,
      amount:
        d.kind === "$" ? d.value : Math.round((d.value / 100) * servicesAmount),
    });

    update(entity, {
      discounts: newDiscounts,
      [discountsAmountField]: newDiscounts
        .filter((s) => s.currency === currency)
        .reduce((prev, curr) => prev + curr.amount, 0),
    });

    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left ">
      <span
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!isOpen);
        }}
        className="text-[10px] w-fit text-center text-muted-foreground hover:underline hover:cursor-pointer user-select-none"
      >
        {openText}
      </span>

      {isOpen && (
        <div className="absolute z-[100] top-0 translate-y-[-100%] translate-x-[-35%] w-72 rounded-md border bg-white shadow-lg">
          <div className="text-center px-4 py-2 border-b">
            <div className="flex items-center justify-center gap-2">
              <Image
                src={`${CONFIG.blob_url}/discount.png`}
                alt="Logo de descuento"
                width={15}
                height={15}
              />
              <span className="text-sm font-medium">Descuentos</span>
            </div>
          </div>
          <div className="pb-2">
            <div className="max-h-40 overflow-y-auto no-scrollbar overscroll-contain touch-auto [WebkitOverflowScrolling:touch] px-2 py-1">
              {discounts.length > 0 ? (
                discounts.map((d) => (
                  <div
                    key={d._id}
                    className="flex justify-between px-2 py-1 text-sm hover:bg-muted cursor-pointer rounded"
                    onClick={(e) => {
                      handleClick(d);
                    }}
                  >
                    <span>{d.name}</span>
                    <span>
                      {d.kind === "$" ? toMoney(d.value) : `${d.value}%`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-center text-muted-foreground my-4">
                  No hay descuentos creados
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
