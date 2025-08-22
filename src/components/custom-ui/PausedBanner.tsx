"use client";

import { Button } from "@/components/ui/button";
import api from "@/helpers/api";
import { notify } from "@/helpers/notify";
import usePermissions from "@/hooks/use-permissions";
import { useStore } from "@/stores";
import { AlertCircle, X } from "lucide-react";
import { LoadingSpinner } from "./Spinner";
// Define the sale end date - eg: new Date('2024-12-31T23:59:59');
// Setting 9h 45m 24s from now for demo purposes

export default function PausedBanner({ subscription_id, debt }) {
  const { isOwner } = usePermissions();
  const update = useStore((s) => s.update);
  const loading = useStore((s) => s.loading);

  const isReactivating = loading === "reactivating";

  return (
    <div
      className={`dark bg-gray-500 px-4  sm:mr-6 sm:rounded-xl py-3 text-foreground mt-16 sm:mt-0 sm:mb-0 -mb-5`}
    >
      <div className="flex gap-2 md:items-center">
        <div className="flex grow gap-3 md:items-center">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 max-md:mt-0.5"
            aria-hidden="true"
          >
            <AlertCircle className="opacity-80" size={16} strokeWidth={2} />
          </div>
          <div className="flex grow flex-col justify-between gap-3 md:flex-row md:items-center">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">
                Suscripción pausada por falta de pago
              </p>
              <p className="text-xs font-extralight !-mt-[0.5px]">
                Regularice su situación para seguir utilizando Aquapp
              </p>
            </div>
            <div className="flex gap-3 max-md:flex-wrap">
              {isOwner && (
                <Button
                  size="sm"
                  className="text-sm min-w-28"
                  onClick={async (e) => {
                    e.stopPropagation();
                    update("loading", "reactivating");
                    const result = await api(
                      { _id: subscription_id, amount: debt },
                      "subscription",
                      "reactivate"
                    );
                    update("loading", "");

                    if (!result.ok) {
                      notify(result);
                      return;
                    }
                    window.open(result.data);
                  }}
                >
                  {isReactivating ? <LoadingSpinner /> : "Abonar deuda"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
