"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import { MyDropdown } from "@/components/entities/sales/DropdownDiscounts";
import MyInput from "@/components/custom-ui/MyInput";
import MyTextArea from "@/components/custom-ui/MyTextArea";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import useFlags from "@/hooks/use-falgs";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { Edit, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Separator } from "react-aria-components";

const SaleServices = ({ services, currency }) => {
  const amountField = currency === "usd" ? "usd_amount" : "amount";
  const discountsAmountField =
    currency === "usd" ? "usd_discounts_amount" : "discounts_amount";
  const { can_view_amount_sale } = usePermissions();
  const { getFlag, country } = useFlags();
  const update = useStore((s) => s.update);
  const discounts = useStore((s) => s.sale.discounts);
  const allow_multi_currency = useStore(
    (s) => s.current_store?.allow_multi_currency
  );
  const finished = useStore((s) => s.sale.finished);
  const canUpdate = useStore((s) => s.sale.canUpdate);
  const amount = useStore((s) => s.sale[amountField] || 0);
  const discounts_amount = useStore((s) => s.sale[discountsAmountField] || 0);

  const [editIds, setEditIds] = useState([]);

  useEffect(() => {
    const newSaleAmount = services
      .filter((s) => s.currency === currency)
      .reduce((prev, curr) => curr.value * curr.quantity + prev, 0);

    const updatedDiscounts = discounts.map((d, index) => {
      const isSameCurrency = d.currency === currency;
      if (isSameCurrency) {
        return {
          ...d,
          base_amount: newSaleAmount,
          amount:
            d.kind === "$"
              ? d.amount
              : Math.round((d.value / 100) * newSaleAmount),
        };
      } else {
        return d;
      }
    });

    update("sale", {
      [amountField]: newSaleAmount,
      discounts: updatedDiscounts,
      [discountsAmountField]: updatedDiscounts
        .filter((s) => s.currency === currency)
        .reduce((prev, curr) => prev + curr.amount, 0),
    });
  }, [services]);

  useEffect(() => {
    update("sale", {
      [discountsAmountField]: discounts
        .filter((s) => s.currency === currency)
        .reduce((prev, curr) => prev + curr.amount, 0),
    });
  }, [discounts]);

  const finalServices = services.filter((s) => s.currency === currency);
  const finalDiscounts = discounts.filter((d) => d.currency === currency);
  if (finalServices.length === 0) return <></>;

  return (
    <div className="relative mt-5 mb-2 flex flex-col py-3 px-3 gap-1 border-dashed border rounded">
      <span
        className={`absolute px-1 !left-[0.5rem] !-top-[0.35rem] !sm:-top-[0.35rem] rounded-sm  bg-white text-gray-500 text-[9px] sm:text-[8px]`}
      >
        Resumen de la venta
      </span>

      <div className="flex flex-col gap-2">
        {finalServices.map((s, index) => (
          <div
            key={`${s.uuid}${index}`}
            className="flex flex-col gap-1 relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span
                  translate="no"
                  className="text-sm max-w-48 sm:max-w-48 leading-4 text-ellipsis"
                >
                  {s.name}
                </span>

                {s.detail && (
                  <span className="text-muted-foreground  text-[10px]  font-extralight ">
                    {s.detail}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {s.description && (
                    <span className="max-w-32 text-orange-600 whitespace-nowrap text-[10px] overflow-hidden text-ellipsis font-extralight ">
                      {s.description}
                    </span>
                  )}
                  {!!s.description && !editIds.includes(s.uuid) && (
                    <Edit
                      size={10}
                      strokeWidth={1}
                      className="cursor-pointer hover:text-blue-600"
                      onClick={() => setEditIds([...editIds, s.uuid])}
                    />
                  )}
                  {!s.description && !editIds.includes(s.uuid) && (
                    <span
                      className="text-[10px] text-blue-600 font-extralight cursor-pointer hover:underline"
                      onClick={() => setEditIds([...editIds, s.uuid])}
                    >
                      Agregar detalle
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {s.allow_quantity && can_view_amount_sale && (
                  <MyInput
                    id={`service-quantity-${currency}`}
                    type="number"
                    entity="sale"
                    field="services"
                    arrayField="quantity"
                    idToFilterArray={s.uuid}
                    idField="uuid"
                    placeholder="Cant."
                    max={200}
                    disabled={!canUpdate}
                    inputClassName="!max-w-10 pl-2"
                  />
                )}
                {can_view_amount_sale && (
                  <MyInput
                    id={`service-price-${currency}`}
                    type="number"
                    entity="sale"
                    field="services"
                    arrayField="value"
                    idToFilterArray={s.uuid}
                    idField="uuid"
                    placeholder="Precio"
                    disabled={!canUpdate}
                    whole
                    inputClassName={"!max-w-28 w-28"}
                  />
                )}
              </div>
              {canUpdate && (
                <DeleteIcon
                  className="!absolute !-right-5 bg-white py-1"
                  tiny
                  onClick={() => {
                    const filteredServices = services.filter(
                      (ss) => ss.uuid !== s.uuid
                    );
                    update("sale", {
                      services: filteredServices,
                      [amountField]: filteredServices.reduce(
                        (prev, curr) => prev + curr.value,
                        0
                      ),
                    });
                  }}
                />
              )}
            </div>
            {editIds.includes(s.uuid) && (
              <div className="mt-2">
                <MyTextArea
                  entity="sale"
                  field="services"
                  arrayField="description"
                  idToFilterArray={s.uuid}
                  idField="uuid"
                  placeholder="Aclaraciones del servicio"
                  rows={2}
                />
                <X
                  size={22}
                  strokeWidth={2}
                  className="cursor-pointer text-gray-600 hover:text-gray-800 !absolute !-right-[1.45rem] top-[3.5rem] bg-white py-0.5 z-10"
                  onClick={() =>
                    setEditIds(editIds.filter((id) => id !== s.uuid))
                  }
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-0.5 mt-3">
        {finalDiscounts?.length > 0 &&
          finalDiscounts.map((d, index) => (
            <div
              className="flex items-center justify-between relative"
              key={index}
            >
              <div className="flex items-center gap-1">
                <span className="text-sm">{d.name} </span>
                <Image
                  src={`${CONFIG.blob_url}/discount.png`}
                  alt="Logo de descuento"
                  width={13}
                  height={13}
                />
                {d.kind === "%" && (
                  <span className="text-muted-foreground font-extralight text-xs">
                    (%{d.value})
                  </span>
                )}
              </div>
              {(d.name !== "De monto variable" || finished) &&
                can_view_amount_sale && (
                  <div className={`flex items-center text-sm mr-3`}>
                    <span>{toMoney(d.amount * -1)}</span>
                  </div>
                )}
              {d.name === "De monto variable" &&
                !finished &&
                can_view_amount_sale && (
                  <MyInput
                    id="discount-discretional-amount"
                    type="number"
                    entity="sale"
                    field="discounts"
                    arrayField="amount"
                    idToFilterArray={d.uuid}
                    idField="uuid"
                    placeholder="Monto"
                    disabled={!canUpdate}
                  />
                )}

              {canUpdate && (
                <DeleteIcon
                  className="!absolute !-right-5 bg-white py-1 !focus:outline-none !focus:ring-0"
                  tiny
                  onClick={() => {
                    const filteredDiscounts = discounts.filter(
                      (dd) => dd.uuid !== d.uuid
                    );

                    update("sale", {
                      discounts: filteredDiscounts,
                      [discountsAmountField]: filteredDiscounts.reduce(
                        (prev, curr) => prev + curr.amount,
                        0
                      ),
                    });
                  }}
                />
              )}
            </div>
          ))}
      </div>

      {canUpdate && can_view_amount_sale && (
        <div className="flex items-center justify-center">
          <MyDropdown
            openText="Agregar descuento"
            entity="sale"
            currency={currency}
            discountsAmountField={discountsAmountField}
          />
        </div>
      )}

      {can_view_amount_sale && (
        <div>
          <Separator />
          <div className="flex items-center justify-between text-sm mt-1">
            <span>
              Total a pagar
              {country?.code === "AR" && allow_multi_currency && (
                <span className="ml-1">en {getFlag(currency)}</span>
              )}
            </span>
            <div className={`flex items-center text-sm mr-3`}>
              <span>{toMoney(amount - discounts_amount)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleServices;
