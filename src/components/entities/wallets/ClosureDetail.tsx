"use client";
import { CardFooter } from "@/components/ui/card";
import { CONFIG } from "@/config/constanst";
import { toMoney } from "@/helpers/fmt";
import { notify } from "@/helpers/notify";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  Calculator,
  Eye,
  EyeClosed,
  MessageCircle,
  Pencil,
  Trash,
  WalletMinimal,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const ClosureDetail = ({
  w,
  closure,
  closureAllowed,
  dayFilters,
  current_balance,
  currenctSign,
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const { user_email } = usePermissions();
  const update = useStore((s) => s.update);
  if (!closure) return null;
  return (
    <CardFooter className={`flex flex-col items-start mt-5`}>
      <div className="flex items-center justify-between w-full font-light text-xs">
        <div className="flex items-center gap-1 ">
          <Calculator className="w-4 h-4" strokeWidth={1.8} />
          <div className="flex flex-col">
            <span className="font-bold text-base text-gray-900">
              CIERRE DEL DÍA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {closureAllowed && showDetail && (
            <Trash
              className="w-3.5 h-3.5 hover:text-red-600 cursor-pointer"
              strokeWidth={1.3}
              onClick={() => {
                if (user_email !== closure.closed_by_email) {
                  notify({
                    ok: false,
                    message:
                      "No puedes eliminar el cierre de caja de otro usuario",
                  });
                  return;
                }
                update("openSecondaryDialog", "delete");
                update("deletion_id", closure._id);
                update("deletion_action_name", "removeWalletClosure");
                update("deletion_entity", "wallet");
              }}
            />
          )}
          {closureAllowed && showDetail && (
            <Pencil
              className="w-3.5 h-3.5 hover:text-blue-600 cursor-pointer"
              strokeWidth={1.3}
              onClick={() => {
                if (user_email !== closure.closed_by_email) {
                  notify({
                    ok: false,
                    message:
                      "No puedes editar el cierre de caja de otro usuario",
                  });
                  return;
                }
                update("openDialog", "wallet");
                update("openDialogIndex", 1);
                update("creating", false);
                update("wallet", {
                  ...w,
                  date: new Date(
                    closure.full_date.year,
                    closure.full_date.month - 1,
                    closure.full_date.day
                  ),
                  counted_closing: closure.counted_closing,
                  closure_comment: closure.notes,
                  dayFilters,
                  current_balance,
                });
              }}
            />
          )}
          {showDetail ? (
            <Eye
              className="w-[1.1rem] h-[1.1rem] hover:text-blue-600 cursor-pointer"
              strokeWidth={1.25}
              onClick={() => setShowDetail(false)}
            />
          ) : (
            <EyeClosed
              className="w-[1.1rem] h-[1.1rem] hover:text-blue-600 cursor-pointer"
              strokeWidth={1.25}
              onClick={() => setShowDetail(true)}
            />
          )}
        </div>
      </div>
      {showDetail && (
        <div className="w-full">
          <div className=" flex items-center justify-between w-full gap-1 font-light text-xs mt-4 mb-2">
            <div className="flex gap-1 items-center font-light text-gray-800">
              <WalletMinimal
                className="text-gray-800 w-2.5 h-2.5"
                strokeWidth={1.7}
              />
              <span>Saldo al inicio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-col text-end">
                <span className="block">
                  {toMoney(closure.day_opening, false, true, currenctSign)}
                </span>
              </div>
            </div>
          </div>
          <div className=" flex items-center justify-between w-full font-light text-sm">
            <div className="flex items-center gap-1 text-xs">
              <ArrowUp className="text-chart-2 w-3 h-3" strokeWidth={1.7} />
              <span>Ingresos</span>
              {closure.gatherings > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.6rem] mt-[2px] ">
                  ({closure.gatherings})
                </span>
              )}
            </div>
            <div className="flex flex-col text-end text-xs">
              <span>
                {toMoney(closure.gathered, false, true, currenctSign)}
              </span>
            </div>
          </div>

          <div className=" flex items-center justify-between w-full font-light text-xs mb-2">
            <div className="flex items-center gap-1">
              <ArrowDown className="text-chart-3 w-3 h-3" strokeWidth={1.7} />
              <span>Egresos</span>
              {closure.spents > 0 && (
                <span className="text-muted-foreground font-extralight ml-0.5 text-[0.6rem] mt-[2px]">
                  ({closure.spents})
                </span>
              )}
            </div>
            <div className="flex flex-col text-end text-xs font-light">
              <span>{toMoney(closure.spent, false, true, currenctSign)}</span>
            </div>
          </div>
          <hr className="w-full" />
          <div className=" flex items-center justify-between w-full gap-1 font-light text-xs mt-2 mb-2">
            <div className="flex gap-1 items-center font-light text-gray-800">
              <WalletMinimal
                className="text-gray-800 w-2.5 h-2.5"
                strokeWidth={1.7}
              />
              <span>Saldo esperado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-col text-end text-md">
                <span className="block">
                  {toMoney(closure.expected_closing, false, true, currenctSign)}
                </span>
              </div>
            </div>
          </div>
          <div className=" flex items-center justify-between w-full gap-1 font-light text-xs mt-4">
            <div className="flex gap-1 items-center font-light text-gray-800">
              <WalletMinimal
                className="text-gray-800 w-2.5 h-2.5"
                strokeWidth={1.7}
              />
              <span>Saldo según usuario</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex flex-col text-end text-md">
                <span className="block">
                  {toMoney(closure.counted_closing, false, true, currenctSign)}
                </span>
              </div>
            </div>
          </div>
          <div className=" flex justify-between gap-1 font-light  text-xs mt-7 mb-5">
            <div className=" flex flex-col w-full gap-1 font-light text-xs">
              <div
                className="flex items-center gap-1 group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  update("creating", true);
                  update("openDialog", "comment");
                  update("openDialogIndex", 0);
                  update("comments_table_subtitle", "Sobre el cierre de caja");
                  update("comments_entity", "WalletClosure");
                  update("comments_entity_id", closure._id);
                  update("comment", {
                    model: "WalletClosure",
                    model_id: closure._id,
                    canCreate: true,
                  });
                  update("creating", true);
                }}
              >
                <MessageCircle className="w-3.5 h-3.5   " strokeWidth={1.3} />
                <span className="group-hover:underline">Comentarios</span>{" "}
                <span className="text-muted-foreground font-extralight">
                  ({closure.comments_count || 0})
                </span>
              </div>

              <div
                className="flex items-center gap-1.5 group cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  update("creating", true);
                  update("openDialog", "attachment");
                  update("openDialogIndex", 0);
                  update(
                    "attachments_table_subtitle",
                    "Sobre el cierre de caja"
                  );
                  update("attachments_entity", "WalletClosure");
                  update("attachments_entity_id", closure._id);
                  update("attachment", {
                    model: "WalletClosure",
                    model_id: closure._id,
                    canCreate: true,
                  });
                  update("creating", true);
                }}
              >
                <Image
                  src={`${CONFIG.blob_url}/attachment.png`}
                  alt="Logo de un clip de papel"
                  width={30}
                  height={30}
                  className="w-3 h-3 mt-0.5"
                />
                <span className="group-hover:underline">Adjuntos</span>{" "}
                <span className="text-muted-foreground font-extralight">
                  ({closure.attachments_count || 0})
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end w-full">
              <div className="flex items-center justify-end  gap-1">
                <div className="flex items-center  gap-1 ">
                  {closure.diff < 0 && (
                    <>
                      <ArrowDown className="text-chart-3 w-3 h-3" />
                      <span className="font-semibold">Faltaron</span>
                    </>
                  )}
                  {closure.diff > 0 && (
                    <>
                      <ArrowUp className="text-chart-2 w-3 h-3" />
                      <span className="font-semibold">Sobraron</span>
                    </>
                  )}
                </div>
                {Math.abs(closure.diff) === 0 && (
                  <div className=" font-semibold">
                    No existieron diferencias ✅
                  </div>
                )}
                {Math.abs(closure.diff) > 0 && (
                  <div className="flex flex-col text-end text-md">
                    <span className="block">
                      {toMoney(closure.diff, false, true, currenctSign)}
                    </span>
                  </div>
                )}
              </div>
              <div className="font-extralight text-[0.5rem] text-muted-foreground">
                Realizado por
                <span className="text-violet-600 ml-0.5">
                  {closure.closed_by_email.split("@")[0]}
                </span>{" "}
                el{" "}
                {format(new Date(closure.createdAt), "dd MMM HH:mm", {
                  locale: es,
                })}
              </div>
              <div className="font-extralight text-[0.5rem] text-muted-foreground -mt-1.5">
                Última act. el{" "}
                {format(new Date(closure.updatedAt), "dd MMM HH:mm", {
                  locale: es,
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </CardFooter>
  );
};

export default ClosureDetail;
