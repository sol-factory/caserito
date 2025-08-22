"use client";
import { useStore } from "@/stores";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showCreatorInfo } from "@/helpers/fmt";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { useQuery } from "@tanstack/react-query";
import api from "@/helpers/api";
import SendingLoader from "../templates/SendingLoader";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import { getFileTypeUrl } from "@/helpers/images";
import { DialogTitle } from "@/components/ui/dialog";

const AttachmentsTable = () => {
  const attachments_entity = useStore((s) => s.attachments_entity) as any;
  const attachments_entity_id = useStore((s) => s.attachments_entity_id);
  const update = useStore((s) => s.update);
  const { data: attachments, isPending } = useQuery({
    queryKey: ["attachments", attachments_entity_id],
    staleTime: 0,
    queryFn: async () => {
      const data = await api(
        { filterId: attachments_entity_id, model: attachments_entity },
        "attachment",
        "getAttachments"
      );
      update(attachments_entity, {
        attachments: data,
      });
      return data.data || [];
    },
    enabled: !!attachments_entity_id,
  });

  if (isPending)
    return (
      <div className="flex items-center justify-center h-20">
        <SendingLoader isSending />
      </div>
    );

  return (
    <div className="flex flex-col mb-3">
      <div className="flex items-center gap-2">
        <DialogTitle>Archivos adjuntos</DialogTitle>
        {attachments.length > 0 && (
          <span className="text-muted-foreground font-light text-sm">
            ({attachments.length})
          </span>
        )}
      </div>
      <div className="flex flex-col w-full max-h-60 overflow-hidden overflow-y-scroll no-scrollbar mt-2">
        {(attachments?.length === 0 || !attachments) && (
          <span className="block text-center text-muted-foreground py-2 text-sm">
            No existen archivos adjuntos
          </span>
        )}
        {Array.isArray(attachments) &&
          attachments?.map((a) => (
            <DropdownRow
              entity="attachment"
              key={a._id}
              item={a}
              className="!cursor-pointer"
            >
              <div
                key={a._id}
                className="flex justify-between py-2 cursor-pointer"
              >
                <div className="flex gap-2">
                  <Image
                    src={getFileTypeUrl(a.mimetype || "image")}
                    width={60}
                    height={60}
                    className="w-5 h-5"
                    alt="Attachment type"
                  />
                  <span>{a.description}</span>
                </div>
                <div className="w-28">
                  <div className="flex flex-col">
                    <span className="text-end text-xs">
                      {" "}
                      {format(new Date(a.date || a.createdAt), "dd MMM HH:mm", {
                        locale: es,
                      })}
                    </span>

                    <span className="text-[0.6rem] text-gray-400 font-light -mt-0.5 text-end">
                      {showCreatorInfo(a.creator, true)}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownRow>
          ))}
      </div>
    </div>
  );
};

export default AttachmentsTable;
