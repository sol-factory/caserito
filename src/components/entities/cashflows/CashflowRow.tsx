"use client";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { getCurrencySign } from "@/helpers/currency";
import { toMoney } from "@/helpers/fmt";
import useFlags from "@/hooks/use-falgs";
import usePermissions from "@/hooks/use-permissions";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowDown, ArrowUp, Clock, MessageCircle, User } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import AttachmentsCounter from "../attachments/AttachmentsCounter";
import MyInfoTooltip from "@/components/custom-ui/MyInfoTooltip";
import { getWalletUrl } from "@/helpers/ui";

const CasfhlowRow = ({ c, companyName, isLastOne = false }) => {
  const { isOwner } = usePermissions();
  const searchParams = useSearchParams();
  const filterByClient = !!searchParams.get("client_id");
  const filterBySearch = !!searchParams.get("search");
  const filterBySubCategory = !!searchParams.get("subCategory");
  return (
    <DropdownRow
      item={c}
      entity="cashflow"
      isLastOne={isLastOne}
      companyName={companyName}
    >
      <div className={`flex py-2 cursor-pointer text-sm`}>
        <div className="flex gap-4">
          <div className="flex flex-col sm:flex-row">
            <div className="flex flex-col items-center sm:min-w-10">
              <Image
                src={getWalletUrl(c.wallet)}
                alt="Logo marca"
                width={25}
                height={25}
                objectFit="cover"
                className={`w-6 h-fit object-contain ${c.wallet.name === "Efectivo" ? "mt-0.5" : ""}`}
              />
              {c.wallet?.currency === "usd" ? (
                <span className="text-lg">🇺🇸</span>
              ) : null}
            </div>
          </div>
          <div className={`flex flex-col max-w-48 sm:w-72 items-start pr-3`}>
            <span
              className={`text-nowrap ${c.category.name === "VENTA" ? "text-chart-2" : "text-chart-3"}`}
            >
              {toMoney(
                c.amount || 0,
                false,
                true,
                getCurrencySign(c.wallet.currency)
              )}
            </span>
            <div className="flex items-center gap-1">
              <Clock
                size={12}
                strokeWidth={1}
                className="text-muted-foreground"
              />
              <span className="text-muted-foreground text-xs font-extralight mt-0.5">
                {format(
                  c.createdAt,
                  filterByClient || filterBySearch || filterBySubCategory
                    ? "EE d MMM HH:mm"
                    : "HH:mm",
                  { locale: es }
                )}
              </span>

              {isOwner && (
                <div className="ml-2">
                  <MyInfoTooltip id={c._id} tinyIcon icon="user">
                    Creador por{" "}
                    <span className="text-yellow-200">{c.creator?.email}</span>
                  </MyInfoTooltip>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end sm:items-start w-full  sm:min-w-48">
          <span className="font-bold text-blue-600">{c.sub_category.name}</span>
          <span className="text-muted-foreground font-light text-nowrap">
            {c.category.name}
          </span>
          {c?.client?.name && (
            <div className="flex items-center gap-1 ">
              <User className="w-3 text-gray-900" strokeWidth={1.5} />
              <span className="text-gray-900 font-extralight text-xs">
                {c.client.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 mt-0.5">
            <AttachmentsCounter count={c.attachments_count} />
            {c.comments_count > 0 && (
              <div className="flex items-center gap-[2px]">
                <MessageCircle className="sm:w-3.5 sm:h-3.5" strokeWidth={1} />
                <span className="text-[12px] font-light">
                  {c.comments_count}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="hidden md:flex flex-col items-start text-xs text-muted-foreground font-light w-full  whitespace-pre-line">
          <span>{c.detail}</span>
        </div>
      </div>
    </DropdownRow>
  );
};

export default CasfhlowRow;
