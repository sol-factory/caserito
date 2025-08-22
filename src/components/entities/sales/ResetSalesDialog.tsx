"use client";
import { useStore } from "@/stores";

import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

import { notify } from "@/helpers/notify";
import api from "@/helpers/api";

const ResetSalesDialog = () => {
  const update = useStore((s) => s.update);
  const deleting = useStore((s) => s.deleting);
  const deletion_id = useStore((s) => s.deletion_id);
  return (
    <Dialog
      open={"sale-reset" === deletion_id}
      onOpenChange={(open) => {
        if (!open) {
          update("deletion_id", "");
        }
      }}
    >
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>¿Seguro deseas resetear las ventas?</DialogTitle>
          <DialogDescription>
            Eliminarás permanentemente las ventas, cobros, pagos y cotizaciones
            que creaste hasta el momento. Esta acción solo puede ser realizada
            durante el período de prueba.
          </DialogDescription>
        </AlertDialogHeader>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              update("deletion_id", "");
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={async (e) => {
              e.stopPropagation();

              update("deleting", true);
              const result = await api({}, "sale", "resetSales");

              await notify(result);
              update("deletion_id", "");
              update("deleting", false);
            }}
          >
            {deleting && deletion_id === "sale-reset" ? (
              <LoadingSpinner />
            ) : (
              "Sí, eliminar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetSalesDialog;
