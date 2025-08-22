"use client";
import { useStore } from "@/stores";
import WalletRow from "./WalletRow";
import NoRecordsFound from "@/components/custom-ui/NoRecordsFound";

export default function WalletsTable({ wallets }) {
  const current_store = useStore((s) => s.current_store);

  const local = current_store?.currency?.toLowerCase?.() ?? "ars";
  const rank = (w: any) => {
    if (w.name === "Efectivo" && w.currency?.toLowerCase?.() === local)
      return 0; // Efectivo local
    if (w.name === "Efectivo" && w.currency?.toLowerCase?.() === "usd")
      return 1; // Efectivo USD
    return 2; // resto
  };
  return (
    <>
      {wallets.length > 0 ? (
        <div
          className={`flex flex-col mt-5 ${
            wallets.length > 5 ? "overflow-y-scroll no-scrollbar" : ""
          }`}
        >
          {wallets
            ?.filter((w) => {
              if (
                w.name === "Efectivo" &&
                w.stores[0]._id !== current_store?._id
              )
                return false;
              return true;
            })
            .sort(
              (a, b) =>
                rank(a) - rank(b) || (a.name || "").localeCompare(b.name || "")
            )
            .map((w) => <WalletRow key={w._id} w={w} />)}
        </div>
      ) : (
        <NoRecordsFound text="No se encontró ninguna billetera" />
      )}
    </>
  );
}
