"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useStore } from "@/stores";
import api from "@/helpers/api";
import { queryClient } from "./QueryProvider";
import { notify } from "@/helpers/notify";
import { LoadingSpinner } from "./Spinner";

const DeleteDialog = () => {
  const update = useStore((s) => s.update);
  const deleting = useStore((s) => s.deleting);
  const deletion_id = useStore((s) => s.deletion_id);
  const openSecondaryDialog = useStore((s) => s.openSecondaryDialog);
  const deletion_entity = useStore((s) => s.deletion_entity) as any;
  const deletion_query_refetch = useStore((s) => s.deletion_query_refetch);
  const attachments_entity = useStore((s) => s.attachments_entity);
  const deletion_action_name = useStore((s) => s.deletion_action_name);

  const resetState = () => {
    update("deletion_id", "");
    update("deletion_action_name", "");
  };
  return (
    <Dialog
      open={!!deletion_id && openSecondaryDialog === "delete"}
      onOpenChange={(open) => {
        if (!open) {
          resetState();
        }
      }}
    >
      <DialogContent style={{ top: "15rem" }}>
        <DialogHeader>
          <DialogTitle>¿Seguro deseas eliminar?</DialogTitle>
          <DialogDescription>
            Esta acción no puede volver atrás. Eliminarás permanentemente este
            registro de tu base de datos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              resetState();
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={async (e) => {
              e.stopPropagation();
              if (deletion_id) {
                update("deleting", true);
                const result = await api(
                  { _id: deletion_id, model: attachments_entity },
                  deletion_entity,
                  deletion_action_name || "remove"
                );
                if (deletion_query_refetch) {
                  queryClient.invalidateQueries();
                }
                await notify(result);
                update("deletion_id", "");
                update("deletion_entity", "");
                update("deletion_action_name", "");
                update("deletion_query_refetch", "");
                update("deleting", false);
                update("openSecondaryDialog", "");

                // update(deletion_entity, ENTITIES[deletion_entity].new());
              }
            }}
          >
            {deleting ? <LoadingSpinner /> : "Sí, eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
