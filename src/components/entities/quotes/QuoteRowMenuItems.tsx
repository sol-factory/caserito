"use client";

import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import { CircleDollarSign, Download, Eye, History, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import TemplatesMenuItems from "../templates/TemplatesMenuItems";
import DeleteIcon from "@/components/custom-ui/DeleteIcon";
import api from "@/helpers/api";
import { createQuote } from "@/helpers/ui";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AttachmentsDropdownItem from "../attachments/AttachmentsDropdownItem";
import CommentsDropdownItem from "../comments/CommentsDropdownItem";

const QuoteRowMenuItems = ({ q, companyName, isOwner, colorAllowed }) => {
  const update = useStore((s) => s.update);
  const current_store = useStore((s) => s.current_store);
  const current_company = useStore((s) => s.current_company);
  const router = useRouter();

  return (
    <>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();
          update("creating", false);
          update("openDialog", "quote");
          update("openDialogIndex", 0);
          update("quote", {
            ...q,
            date: new Date(
              q.full_date.year,
              q.full_date.month - 1,
              q.full_date.day,
              q.full_date.hour || new Date(q.date).getHours(),
              q.full_date.minute || new Date(q.date).getMinutes()
            ),
            canUpdate: !q.sent,
          });
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Ver detalle
      </DropdownMenuItem>
      <CommentsDropdownItem mongoose_model="Quote" model_id={q._id} />
      <AttachmentsDropdownItem mongoose_model={"Quote"} model_id={q._id} />
      {!q.sent && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-3 cursor-pointer w-auto"
            onClick={async (e) => {
              e.stopPropagation();
              const result = await api(
                { data: { _id: q._id } },
                "quote",
                "markAsSent"
              );
              notify(result);
            }}
          >
            <Send size={21} strokeWidth={1.5} />
            Marcar como enviada
          </DropdownMenuItem>
        </>
      )}
      {!q.sold && q.sent && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-3 cursor-pointer w-auto"
            onClick={async (e) => {
              e.stopPropagation();
              const now = new Date();
              router.push(`/washes?date=${+now}`);
              update("creating", true);
              update("sale", {
                ...q,
                _id: "",
                date: now,
                quote_id: q._id,
                quote_identifier: q.identifier,
                canUpdate: true,
                canCreate: true,
              });
              update("openDialog", "sale");
              update("openDialogIndex", 0);
            }}
          >
            <CircleDollarSign size={21} strokeWidth={1.5} />
            Iniciar venta
          </DropdownMenuItem>
        </>
      )}

      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/quotes?client_id=${q.client._id}`);
        }}
      >
        <History size={21} strokeWidth={1.5} />
        Historial cliente
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={async (e) => {
          e.stopPropagation();
          try {
            const pdf = await createQuote(q, current_company, current_store);

            const blob = pdf.output("blob");
            const blobUrl = URL.createObjectURL(blob);
            window.open(blobUrl);
          } catch (error) {
            await api(
              {
                data: {
                  entity: "quote",
                  action: "visualize pdf",
                  body: q,
                  error_type: error.name || "UnknownError",
                  error_message: error.message,
                  stack: error.stack,
                  metadata: {
                    keyPattern: error.keyPattern || null,
                    keyValue: error.keyValue || null,
                  },
                },
              },
              "user",
              "createError"
            );
          }
        }}
      >
        <Eye size={21} strokeWidth={1.5} />
        Visualizar PDF
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex gap-3 cursor-pointer w-auto"
        onClick={async (e) => {
          e.stopPropagation();
          try {
            const pdf = await createQuote(q, current_company, current_store);

            await pdf.save(
              `Presupuesto ${q.client.firstname} (${format(q.date, "dd MMM yyyy", { locale: es })}).pdf`
            );
          } catch (error) {
            await api(
              {
                data: {
                  entity: "quote",
                  action: "download pdf",
                  body: q,
                  error_type: error.name || "UnknownError",
                  error_message: error.message,
                  stack: error.stack,
                  metadata: {
                    keyPattern: error.keyPattern || null,
                    keyValue: error.keyValue || null,
                  },
                },
              },
              "user",
              "createError"
            );
          }
        }}
      >
        <Download size={21} strokeWidth={1.5} />
        Descargar PDF
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <TemplatesMenuItems
        c={{
          ...q,
          ...q.client,
          vehicle: q.vehicle,
          quote_date: new Date(
            q.full_date.year,
            q.full_date.month - 1,
            q.full_date.day,
            q.full_date.hour || new Date(q.date).getHours(),
            q.full_date.minute || new Date(q.date).getMinutes()
          ),
        }}
        entity="quote"
        screen="Cotizaciones"
        services={q.services}
        discounts={q.discounts}
        quoteId={q._id}
      />

      {isOwner && !q.sent && (
        <>
          <DropdownMenuSeparator />
          <div
            className="p-2 hover:bg-gray-100 rounded-sm cursor-pointer flex gap-3"
            key={q._id}
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", q._id);
              update("deletion_entity", "quote");
              update("openSecondaryDialog", "delete");
            }}
          >
            <DeleteIcon text="Eliminar" className="w-full" />
          </div>
        </>
      )}
    </>
  );
};

export default QuoteRowMenuItems;
