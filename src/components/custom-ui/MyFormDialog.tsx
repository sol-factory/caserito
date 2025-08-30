"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpDown, Cog, PlusCircle, Shapes } from "lucide-react";

import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { useStore } from "@/stores";
import { notify } from "@/helpers/notify";
import { ENTITIES } from "@/config";
import { queryClient } from "./QueryProvider";
import { useRouter } from "next/navigation";
import { focusAfter, getCountry } from "@/helpers/ui";
import { useEffect, useRef } from "react";
import api from "@/helpers/api";
import usePermissions from "@/hooks/use-permissions";

const ICONS = {
  plus: <PlusCircle className="h-3.5 w-3.5" />,
  shapes: <Shapes className="h-3.5 w-3.5" />,
  cog: <Cog className="h-3.5 w-3.5" />,
  transfer: <ArrowUpDown className="h-3.5 w-3.5" />,
};

export function MyFormDialog({
  form,
  action = "upsert",
  hidden = false,
  children = null,
  invalidateQueries = null,
  dialogToOpen = null,
  afterForm = false,
  titleName = null,
  fieldsIndex = 0,
  alwaysOpen = false,
  additionalInfo = null,
  automaticClose = true,
  idToFucusAfter = null,
  editableId = null,
  componentNextToTitle = null,
  variant = null,
  icon = "plus",
  disabledMessage = null,
  buttonText = null,
  description = null,
  hideClose = false,
  onlyChildren = false,
  avoidValidations = false,
  onlyShow = false,
  startMode = "creating",
  user = null,
  defaultDate = null,
  onlyIcon = false,
  fullTitle = null,
  hideActionButton = false,
}) {
  const ref = useRef(null);
  const { can_view_phone_client } = usePermissions();
  const openDialogSubtitle = useStore((s) => s.openDialogSubtitle);
  const openDialog = useStore((s) => s.openDialog);
  const openDialogIndex = useStore((s) => s.openDialogIndex);
  const openDatePicker = useStore((s) => s.openDatePicker);
  const current_company = useStore((s) => s.current_company);
  const current_store = useStore((s) => s.current_store);
  const creating = useStore((s) => s.creating);
  const loading = useStore((s) => s.loading);
  const canUpdate = useStore((s) => s[form].canUpdate);
  const avoid_close = useStore((s) => s[form].avoid_close);
  const canCreate = useStore((s) => s[form].canCreate);
  const avoidClosingModal = useStore((s) => s.avoidClosingModal);

  const errors = useStore((s) => s.errors);
  const update = useStore((s) => s.update);
  const reset = useStore((s) => s.reset);
  const router = useRouter();
  const config = ENTITIES[form];

  useEffect(() => {
    if (alwaysOpen) {
      // Porque una vez quedó en false al crear company, revisar, no debería ser necesario
      update("creating", true);
    }
  }, [creating, form, update, user, current_store]);

  const showFormContent =
    canCreate || canUpdate || form !== "cashflow" || onlyShow;

  const cannotCreate = () => {
    notify({ ok: false, message: disabledMessage }, "top-right", 5000);
  };
  console.log({ form, dialogToOpen });

  return (
    <Dialog
      open={
        (openDialog === form && openDialogIndex === fieldsIndex) || alwaysOpen
      }
      onOpenChange={(open) => {
        if (!open && !avoid_close) {
          update("openDialog", "");
        }
        reset("errors");
      }}
    >
      <DialogTrigger asChild className={hidden && "hidden"}>
        <Button
          size="default"
          variant={variant || "default"}
          className={`gap-2 px-2.5 sm:px-3`}
          onClick={() => {
            if (form === "quote" && !current_company.logo_url) {
              notify({
                ok: false,
                message:
                  "Debes agregar un logo a tu empresa para crear cotizaciones",
              });
              return;
            }
            if (disabledMessage) {
              cannotCreate();
              return;
            }
            if (startMode === "editing") {
              update(form, {
                quotes_observations: current_store.quotes_observations,
                quotes_valid_days: current_store.quotes_valid_days,
                quotes_dark_mode: current_store.quotes_dark_mode,
                quotes_primary_color: current_store.quotes_primary_color,
                quotes_secondary_color: current_store.quotes_secondary_color,
                quotes_tax: current_store.quotes_tax,
                quotes_payment_conditions:
                  current_store.quotes_payment_conditions,
                canUpdate: true,
              });
            } else {
              reset(form);
              const country = getCountry(current_store, form);
              update(form, {
                ...config.new(current_store),
                country,
                date: ["sale", "cashflow"].includes(form)
                  ? defaultDate
                    ? new Date(+defaultDate)
                    : new Date()
                  : undefined,

                observations: ["quote"].includes(form)
                  ? current_store.quotes_observations
                  : undefined,
                tax: ["quote"].includes(form)
                  ? current_store.quotes_tax
                  : undefined,
                valid_days: ["quote"].includes(form)
                  ? current_store.quotes_valid_days
                  : undefined,
                canUpdate: true,
                canCreate: true,
              });
            }
            update("openDialog", form);
            update("openDialogIndex", fieldsIndex);
            update("creating", startMode === "creating");
            update("avoidClosingModal", false);
          }}
        >
          {ICONS[icon]}
          {!onlyIcon && (
            <span className="sr-only md:not-sr-only sm:whitespace-nowrap">
              {buttonText || `Crear ${config.singular}`}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        ref={ref}
        onClick={(e) => {
          e.stopPropagation();
          update("openSelect", "");
          // update("openMenu", "");
          const target = e.target as any;
          // Que se cierre cuando se seleccionó un día del calendario
          if (target?.nodeName === "TD" || target?.role === "dialog") {
            update("openDatePicker", "");
          }
        }}
        className={`sm:max-w-[425px] top-0 sm:top-10 translate-y-0 overflow ${openDatePicker !== "" ? "" : "overflow-y-auto"}  no-scrollbar max-h-[95vh] ${
          hideClose ? "[&>button]:hidden" : ""
        }`}
      >
        {!afterForm && children}

        <DialogHeader className={!showFormContent && "hidden"}>
          <div className="flex flex-row justify-between">
            {!fullTitle && (
              <DialogTitle>
                {creating || alwaysOpen
                  ? "Crear"
                  : canUpdate === false
                    ? "Detalle"
                    : "Editar"}{" "}
              </DialogTitle>
            )}
            {fullTitle && <DialogTitle>{fullTitle}</DialogTitle>}
            {!!componentNextToTitle && componentNextToTitle}
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
          {!!openDialogSubtitle && (
            <DialogDescription>{openDialogSubtitle}</DialogDescription>
          )}
        </DialogHeader>

        <form
          action={async (formData: FormData) => {
            const stateData = useStore.getState()[form];

            const logo = formData.get("logo") as File;

            if (logo?.size > 3145728) {
              notify({
                ok: false,
                message: "Imagen demasiado grande. Máximo 1 MB.",
              });
              update(form, { avatar_url: "", logo_url: "" });
              return;
            }

            const hasUpdateSchema = "updateSchema" in ENTITIES[form];
            const shouldUseUpdateSchema = hasUpdateSchema && !creating;
            const schema = shouldUseUpdateSchema
              ? "updateSchema"
              : "createSchema";

            const editableContent = document.getElementById(editableId);

            const finalSchema = Array.isArray(ENTITIES[form][schema])
              ? ENTITIES[form][schema][fieldsIndex]
              : ENTITIES[form][schema];

            const result = await finalSchema.safeParse(stateData);
            const ERRORS = Object.entries(errors).reduce((prev, curr) => {
              const message = curr[1];
              if (message) {
                prev.push({ message });
              }
              return prev;
            }, []);

            console.log({ result, creating, hasUpdateSchema });
            if (result.error && !avoidValidations) {
              result.error.issues.forEach((issue) => {
                const alreadyIncluded = ERRORS.some(
                  (e) => e.message === issue.message
                );
                if (!alreadyIncluded) {
                  ERRORS.push({ message: issue.message });
                }
              });
            }
            if (ERRORS.length > 0 && !avoidValidations) {
              const error_message = ERRORS.reduce((prev, curr) => {
                return prev + curr.message + "\n";
              }, "");

              notify({ ok: false, message: error_message });
              return;
            }

            if (creating || alwaysOpen) {
              delete stateData._id;
            }

            update("loading", config.loadingKey);
            const response = await api(
              {
                data: {
                  ...stateData,
                  ...additionalInfo,
                  content: editableContent?.innerHTML,
                },
                form: formData,
              },
              form,
              action,
              router,
              fieldsIndex
            );

            notify(response);
            if (response.ok) {
              if (!automaticClose) {
                reset(form, true);
                update("creating", true);
                focusAfter(idToFucusAfter);
              } else {
                if (!avoidClosingModal) {
                  update("openDialog", "");
                } else {
                  update("avoidClosingModal", false);
                  update(form, config.new(current_store, stateData));
                  update("creating", true);
                }
              }
              if (!!invalidateQueries) {
                queryClient.invalidateQueries();
              }

              if (!!dialogToOpen) {
                update("openDialog", dialogToOpen);
                update("creating", dialogToOpen !== "sale");
              }
              if (config.onSuccess) {
                config.onSuccess({
                  state: stateData,
                  update,
                  dialogToOpen,
                  useStore,
                  response,
                });
              }
              if (creating && form === "quote") {
                queryClient.invalidateQueries({ queryKey: ["subscription"] });
              }
            }
            const delay = form === "company" ? 3000 : 0;
            setTimeout(() => update("loading", ""), delay);
          }}
          className="flex flex-col gap-2 sm:gap-2"
        >
          {showFormContent &&
            !onlyChildren &&
            config.fields[fieldsIndex]({
              creating,
              state: useStore.getState()[form],
              canUpdate,
              canCreate,
              can_view_phone_client,
              user,
              store: current_store,
            })}
          <DialogFooter>
            {((canUpdate !== false && !creating) || (canCreate && creating)) &&
              !hideActionButton && (
                <Button type="submit" disabled={loading === config.loadingKey}>
                  {loading === config.loadingKey ? (
                    <LoadingSpinner />
                  ) : creating || alwaysOpen ? (
                    "Crear"
                  ) : (
                    "Editar"
                  )}
                </Button>
              )}
          </DialogFooter>
        </form>
        {afterForm && !creating && children}
      </DialogContent>
    </Dialog>
  );
}
