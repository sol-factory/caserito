"use client";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import MyInput from "@/components/custom-ui/MyInput";
import { CONFIG, VK_fixedOrder } from "@/config/constanst";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { Repeat2 } from "lucide-react";
import Image from "next/image";
import { ToogleTinyCurrency } from "./ToggleCurrency";

const ServicePrices = ({ canUpdate }) => {
  const { can_view_amount_service } = usePermissions();
  const update = useStore((s) => s.update);
  const current_store = useStore((s) => s.current_store);
  const prices = useStore((s) => s.service.prices);

  if (prices?.length === 0 || !prices || !can_view_amount_service) return <></>;

  let allTheSame = true;

  for (let index = 0; index < prices.length; index++) {
    const price = prices[index];
    const prevPrice = prices[index - 1];
    if (!!prevPrice?.value && price?.value !== prevPrice?.value) {
      allTheSame = false;
      break;
    }
  }

  const usdAllowed =
    current_store?.allow_multi_currency && current_store.currency === "ars";

  return (
    <div
      className={`relative flex flex-col mt-5 mb-2 py-3 px-3 gap-1 border-dashed border rounded ${current_store?.allow_multi_currency ? "pt-5" : ""}`}
    >
      <span
        className={`absolute px-1 !left-[0.5rem] !-top-[0.35rem] !sm:-top-[0.35rem] rounded-sm  bg-white text-gray-500 text-[9px] sm:text-[8px]`}
      >
        Precio para cada clasificación de vehículo
      </span>

      {usdAllowed && (
        <div
          className={`absolute px-1 !right-[0.5rem] !-top-[0.4rem] !sm:-top-[0.4rem] rounded-sm  bg-white text-gray-500 text-[9px] sm:text-[8px]`}
        >
          <ToogleTinyCurrency
            form="service"
            field="currency"
            value1={current_store?.currency}
            value2="usd"
          />
        </div>
      )}

      <div className={`flex flex-col gap-2 ${usdAllowed ? "pt-2" : ""}`}>
        {prices
          .sort((a, b) => {
            const aIndex = VK_fixedOrder.indexOf(a.classification_id);
            const bIndex = VK_fixedOrder.indexOf(b.classification_id);
            return (
              (aIndex === -1 ? Infinity : aIndex) -
              (bIndex === -1 ? Infinity : bIndex)
            );
          })
          .map((p, index) => (
            <div key={p._id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  width={26}
                  height={23}
                  alt={p.classification_id}
                  src={`${CONFIG.blob_url}/vehicles/${p.classification_id}.png`}
                />
                <span
                  translate="no"
                  className="text-sm max-w-48 sm:max-w-48 leading-4 text-ellipsis"
                >
                  {p.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {!allTheSame && (
                  <Repeat2
                    className="w-4 h-4 cursor-pointer hover:text-blue-600"
                    strokeWidth={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      update("service", {
                        prices: prices.map((pr) => ({ ...pr, value: p.value })),
                      });
                    }}
                  />
                )}
                <MyInput
                  type="number"
                  entity="service"
                  field="prices"
                  arrayField="value"
                  placeholder="Precio"
                  disabled={!canUpdate}
                  inputClassName={"!max-w-24"}
                  index={index}
                />
              </div>
              {canUpdate && (
                <DeleteIcon
                  className="!absolute !-right-2 bg-white py-1"
                  tiny
                  onClick={() => {
                    const filteredPrices = prices.filter(
                      (_, idx) => idx !== index
                    );
                    update("service", {
                      prices: filteredPrices,
                    });
                  }}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ServicePrices;
