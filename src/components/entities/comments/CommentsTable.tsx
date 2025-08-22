"use client";
import { useStore } from "@/stores";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { showCreatorInfo } from "@/helpers/fmt";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { useQuery } from "@tanstack/react-query";
import api from "@/helpers/api";
import SendingLoader from "../templates/SendingLoader";
import { DialogTitle } from "@/components/ui/dialog";

const CommentsTable = () => {
  const comments_entity = useStore((s) => s.comments_entity) as any;
  const comments_entity_id = useStore((s) => s.comments_entity_id);
  const comments_table_subtitle = useStore((s) => s.comments_table_subtitle);

  const { data: comments, isPending } = useQuery({
    queryKey: ["comments", comments_entity_id],
    staleTime: 0,
    queryFn: async () => {
      const data = await api(
        { filterId: comments_entity_id, model: comments_entity },
        "comment",
        "getComments"
      );

      return data.data || [];
    },
    enabled: !!comments_entity_id,
  });

  if (isPending)
    return (
      <div className="flex items-center justify-center h-20">
        <SendingLoader isSending />
      </div>
    );

  return (
    <div className="flex flex-col mb-3">
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <DialogTitle>Comentarios</DialogTitle>
          {comments.length > 0 && (
            <span className="text-muted-foreground font-light text-sm">
              ({comments.length})
            </span>
          )}
        </div>
        <span className="block text-xs font-extralight text-muted-foreground pl-0.5 text-orange-600">
          {comments_table_subtitle}
        </span>
      </div>
      <div className="flex flex-col w-full max-h-60 overflow-hidden overflow-y-scroll no-scrollbar mt-2">
        {(comments?.length === 0 || !comments) && (
          <span className="block text-center text-muted-foreground py-2 text-sm">
            No existen comentarios
          </span>
        )}
        {Array.isArray(comments) &&
          comments?.map((c) => (
            <div
              key={c._id}
              className="flex justify-between py-2 border-b-[1px] border-gray-100 px-2"
            >
              <div className="flex gap-2">
                <span>{c.text}</span>
              </div>
              <div className="w-28">
                <div className="flex flex-col">
                  <span className="text-end text-xs">
                    {" "}
                    {format(new Date(c.date || c.createdAt), "dd MMM HH:mm", {
                      locale: es,
                    })}
                  </span>

                  <span className="text-[0.6rem] text-gray-400 font-light -mt-0.5 text-end">
                    {showCreatorInfo(c.creator, true)}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default CommentsTable;
