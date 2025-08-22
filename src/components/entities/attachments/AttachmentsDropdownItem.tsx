import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useStore } from "@/stores";
import { Paperclip } from "lucide-react";

const AttachmentsDropdownItem = ({ mongoose_model, model_id }) => {
  const update = useStore((s) => s.update);

  return (
    <DropdownMenuItem
      className="flex gap-3 cursor-pointer w-auto"
      onClick={(e) => {
        e.stopPropagation();
        update("creating", true);
        update("openDialog", "attachment");
        update("openDialogIndex", 0);
        update("attachments_entity", mongoose_model);
        update("attachments_entity_id", model_id);
        update("attachment", {
          kind: "image",
          description: "",
          model: mongoose_model,
          model_id,
          canCreate: true,
        });
        update("creating", true);
      }}
    >
      <Paperclip size={21} strokeWidth={1.5} />
      Archivos adjuntos
    </DropdownMenuItem>
  );
};

export default AttachmentsDropdownItem;
