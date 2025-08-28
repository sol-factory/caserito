import { toMoney } from "@/helpers/fmt";
import { getWalletUrl } from "@/helpers/ui";
import useFlags from "@/hooks/use-falgs";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";

const SaleCashflowRow = ({ c, selectedId }) => {
  const { isOwner } = usePermissions();
  const { getFlag } = useFlags();
  const sale_id = useStore((s) => s.sale._id);
  const update = useStore((s) => s.update);
  const cashflow_id = useStore((s) => s.cashflow._id);
  const canUpdate = useStore((s) => s.cashflow.canUpdate);

  return (
    <div
      key={c._id}
      className={`relative flex flex-col text-xs cursor-pointer ${
        c._id === cashflow_id ? "bg-gray-100" : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (canUpdate && !c.deleted) {
          const isSelected = selectedId === c._id;

          update("cashflow", {
            _id: isSelected ? "" : c._id,
            wallet: isSelected ? "" : c.wallet,
            sale_id: c.sale_id,
            amount: isSelected ? "" : Math.abs(c.amount),
            exchange_rate: isSelected ? "" : c.exchange_rate,
          });
          update("creating", isSelected);
        }
      }}
    >
      <div className="flex justify-between w-full">
        <div className="flex w-full min-w-40">
          <div className="flex gap-2">
            <div className="flex flex-col justify-center w-5">
              <Image
                src={getWalletUrl(c.wallet)}
                alt="Logo marca"
                width={20}
                height={20}
                className={`w-5`}
              />
            </div>
            <div className="flex flex-col ml-1">
              <span>{c.wallet.name}</span>
              <div className="flex items-center text-[0.5rem] font-extralight -mt-0.5 text-muted-foreground">
                <span className="text-[0.5rem] text-gray-600 font-extralight mr-2">
                  {format(new Date(c.date), "EE dd/MM HH:mm", {
                    locale: es,
                  })}
                </span>
              </div>
              <div className="flex items-center text-[0.5rem] font-extralight -mt-0.5 text-muted-foreground">
                <span className="text-[0.5rem] text-orange-600 font-extralight mr-2">
                  {c.detail}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end w-fit text-nowrap text-center align-top">
          <span>{toMoney(c.amount)} </span>
          {canUpdate && !c.deleted && (
            <div className="flex items-center font-light justify-center hover:cursor-pointer">
              <span
                className="text-[0.5rem] text-red-600 hover:underline -mt-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  update("deletion_id", c._id);
                  update("deletion_entity", "cashflow");
                  update("openSecondaryDialog", "delete");
                  update("deletion_query_refetch", ["cashflows", sale_id]);
                }}
              >
                Eliminar
              </span>
            </div>
          )}
        </div>
      </div>
      {c.deleted && c.deletor_email && isOwner && (
        <span className="text-[0.5rem] l-2  font-light text-gray-700 text-nowrap">
          Eliminado por{" "}
          <span className="text-red-600 font-extralight">
            {c.deletor_email.split("@")[0]}
          </span>{" "}
          el{" "}
          <span className="text-red-600 font-extralight">
            {format(c.deleted_at, "EE dd MMM H:mm", {
              locale: es,
            })}
          </span>
        </span>
      )}
    </div>
  );
};

export default SaleCashflowRow;
