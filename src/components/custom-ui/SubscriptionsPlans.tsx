"use client";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { useStore } from "@/stores";
import { Button } from "../ui/button";
import Image from "next/image";
import { CONFIG } from "@/config/constanst";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toMoney } from "@/helpers/fmt";
import { useQuery } from "@tanstack/react-query";

import { notify } from "@/helpers/notify";
import { LoadingSpinner } from "./Spinner";
import MyNumberCounter from "./MyNumberCounter";
import { focusAfter } from "@/helpers/ui";
import { useEffect } from "react";
import api from "@/helpers/api";
import TutorialBadge from "./TutorialBadge";
import SendingLoader from "../entities/templates/SendingLoader";
import { Calculator } from "lucide-react";

export default function SubscriptionsPlans({ user, isMP }) {
  const update = useStore((s) => s.update);
  const openDialog = useStore((s) => s.openDialog);
  const subscriptionPlan = useStore((s) => s["subscription-plan"]);
  const subKind = useStore((s) => s.subKind);
  const store = useStore((s) => s.current_store);
  const wspNumber = useStore((s) => s["whatsapp-number"]) as any;
  const subscription = useStore((s) => s.subscription);
  const loading = useStore((s) => s.loading);

  const wspNumberId = wspNumber?._id;

  useQuery({
    queryKey: ["subscription", user.company._id, wspNumber],
    staleTime: 5000,
    queryFn: async () => {
      const data = await api(
        { companyId: user.company._id, wspNumberId },
        "subscription",
        "getByCompanyId"
      );
      update("subscription", data);
      return data || [];
    },
  });

  const { data: plans, isPending } = useQuery({
    queryKey: ["plans", wspNumberId],
    staleTime: 5000,
    queryFn: async () => {
      const data = await api(
        { isMP, wspNumberId, kind: subKind },
        "subscription-plan",
        "getItems"
      );

      return data || [];
    },
    enabled: !!subKind,
  });

  const provider_logo = isMP ? "mp.webp" : "paypal-logo.png";

  const handleBuySub = async () => {
    try {
      update("loading", "buying-sub");
      const res = await fetch(`/api/subscriptions/${isMP ? "mp" : "paypal"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subscriptionPlan,
          stores: subscription.stores,
          wspNumber: wspNumber.number,
          kind: subKind,
        }),
      });

      const result = await res.json();
      update("loading", "");
      if (result.ok) {
        update("openDialog", "");
        window.open(result.data);
      } else {
        notify(result);
      }
    } catch (error) {
      console.log({ error });
    }
  };

  useEffect(() => {
    focusAfter("plans", 50);
  }, [openDialog]);

  useEffect(() => {
    if (Array.isArray(plans)) {
      const monthlyPlan = plans[0];
      update("subscription-plan", monthlyPlan);
      update("subscription", { plan_id: monthlyPlan._id });
    }
  }, [openDialog, plans]);

  return (
    <Dialog
      open={openDialog === "plans"}
      onOpenChange={(open) => {
        if (!open) {
          update("openDialog", "");
          update("showUI", "");
        }
      }}
    >
      <DialogContent
        className={`flex flex-col items-center top-60 w-full sm:w-80 max-w-80`}
      >
        <fieldset className="space-y-4">
          {subKind === "basic" && (
            <>
              <MyNumberCounter
                entity="subscription"
                field="stores"
                isMP={isMP}
              />
              <DialogTitle>Elige tu plan de suscripción</DialogTitle>
            </>
          )}
          {subKind === "whatsapp" && (
            <div className="flex flex-col justify-center mb-4">
              <DialogTitle className="font-bold">
                Mensajes habilitados al mes
              </DialogTitle>
              <div className="flex items-center gap-1">
                <Image
                  src={`${CONFIG.blob_url}/whatsapp.png`}
                  alt=""
                  width={60}
                  height={60}
                  className="w-4 cursor-pointer rounded-sm "
                />
                <span className="font-extralight text-sm text-muted-foreground">
                  {wspNumber.number}
                </span>
              </div>
            </div>
          )}
          {subKind === "quotes" && (
            <div className="flex flex-col justify-center mb-4">
              <DialogTitle className="font-bold">
                Cotizaciones al mes
              </DialogTitle>
              <div className="flex items-center gap-1">
                <Calculator size={10} />
                <span className="font-extralight text-xs text-muted-foreground">
                  Actualmente tienes {store.quotes_limit} habilitadas
                </span>
              </div>
            </div>
          )}

          {isPending && !plans ? (
            <div className="flex w-full items-center justify-center h-10">
              <SendingLoader isSending={true} />
            </div>
          ) : (
            <RadioGroup
              id="plans"
              className="gap-0 -space-y-px !mt-2 rounded-lg shadow-sm shadow-black/5 min-w-[17rem]"
              defaultValue={subscription.plan_id}
              autoFocus
            >
              {Array.isArray(plans) &&
                plans
                  .filter((p) => {
                    if (isMP && subscription.stores > 1) {
                      return p.frequency === 1;
                    }
                    return true;
                  })
                  .map((plan, index) => (
                    <div
                      id={`plan-${index}`}
                      key={plan._id}
                      className="relative flex flex-col gap-4 border border-input p-4 first:rounded-t-lg last:rounded-b-lg has-[[data-state=checked]]:z-10 has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-accent"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            id={plan._id}
                            value={plan._id}
                            checked={subscription.plan_id === plan._id}
                            className="after:absolute after:inset-0"
                            onClick={() => {
                              update("subscription-plan", plan);
                              update("subscription", { plan_id: plan._id });
                            }}
                          />
                          <Label
                            className="flex items-center"
                            htmlFor={plan._id}
                          >
                            <div className="flex flex-col">
                              <span>
                                {plan.frequency === 1 && "Mensual"}
                                {plan.frequency === 12 && "Anual"}
                                {plan.messages > 0 &&
                                  `${plan.messages} mensajes`}
                                {plan.quotes > 0 &&
                                  `${plan.quotes} cotizaciones`}
                              </span>
                            </div>
                            {plan.frequency === 12 && (
                              <span className="ml-3 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-300/15 px-1 py-0.5 text-[10px] font-medium uppercase text-emerald-600">
                                Popular
                              </span>
                            )}
                          </Label>
                        </div>
                        <div
                          id={`${plan._id}-price`}
                          className="text-sm leading-[inherit] text-muted-foreground"
                        >
                          {toMoney(
                            plan.unit_amount *
                              (plan.messages > 0 ? 1 : subscription.stores)
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
            </RadioGroup>
          )}
        </fieldset>

        <DialogFooter className="w-full">
          <Button
            variant="secondary"
            className="hover:bg-gray-200 w-full"
            onClick={handleBuySub}
            disabled={!subscriptionPlan?._id}
          >
            {loading === "buying-sub" ? (
              <LoadingSpinner />
            ) : (
              <>
                Contratar con{" "}
                <Image
                  src={`${CONFIG.blob_url}/${provider_logo}`}
                  alt="Avatar"
                  width={isMP ? 75 : 65}
                  height={25}
                  className="overflow-hidden rounded  object-cover"
                />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
