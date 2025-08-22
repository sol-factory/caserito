"use client";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";
import CasfhlowRow from "./CashflowRow";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import { useStore } from "@/stores";
import Image from "next/image";
import { getWalletUrl } from "@/helpers/ui";
import { FunnelX } from "lucide-react";

export default function CasfhlowsTable({ user, cashflows }) {
  const selected_wallet = useStore((s) => s.selected_wallet);

  const reset = useStore((s) => s.reset);

  const finalCashflows = selected_wallet?._id
    ? cashflows.filter((c) => c.wallet._id === selected_wallet._id)
    : cashflows;
  return (
    <>
      {selected_wallet?._id && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <div className="flex items-center ">
            <span className="font-semibold underline">Billetera</span>:
          </div>
          <div className="flex items-center gap-2">
            <Image
              src={getWalletUrl(selected_wallet)}
              alt="Wallet"
              width={24}
              height={24}
              className="rounded-full w-4"
            />
            <span>{selected_wallet?.name}</span>
          </div>
          <FunnelX
            className="w-3.5 h-3.5 text-red-600 cursor-pointer"
            strokeWidth={1.3}
            onClick={() => reset("selected_wallet")}
          />
        </div>
      )}
      {finalCashflows.length > 0 ? (
        <div
          className={`flex flex-col mt-5 overflow-hidden max-h-96  ${
            finalCashflows.length >= 3 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {finalCashflows?.map((c, index) => (
            <CasfhlowRow
              key={c._id}
              c={c}
              companyName={user.company.name}
              isLastOne={index === cashflows.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <NoRecordsFound text="No se encontró ningún egreso" />

          <TutorialBadge
            title="Flujos de dinero del negocio 💰"
            url="https://youtu.be/2Neg8h1dYN0"
            className="-mt-2 mb-4"
            custom_id={12}
            onlyOwners
          />
        </div>
      )}
    </>
  );
}
