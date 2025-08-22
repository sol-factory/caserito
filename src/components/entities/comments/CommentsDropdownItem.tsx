import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { MessageCircle, Paperclip } from "lucide-react";

const CommentsDropdownItem = ({ mongoose_model, model_id }) => {
  const update = useStore((s) => s.update);

  const table_subtitle = {
    Sale: "Sobre la venta",
    Cashflow: "Sobre el movimiento de caja",
  };

  return (
    <DropdownMenuItem
      className="flex gap-3 cursor-pointer w-auto"
      onClick={(e) => {
        e.stopPropagation();
        update("creating", true);
        update("openDialog", "comment");
        update("openDialogIndex", 0);
        update("comments_entity", mongoose_model);
        update("comments_entity_id", model_id);
        update("comments_table_subtitle", table_subtitle[mongoose_model]);
        update("comment", {
          model: mongoose_model,
          model_id,
          canCreate: true,
        });
        update("creating", true);
      }}
    >
      <MessageCircle size={21} strokeWidth={1.5} />
      Comentarios
    </DropdownMenuItem>
  );
};

export default CommentsDropdownItem;
