"use client";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

import { LoadingSpinner } from "@/components/custom-ui/Spinner";
import { useStore } from "@/stores";
import { notify } from "@/helpers/notify";
import { ENTITIES } from "@/config";
import { queryClient } from "./QueryProvider";
import { useRouter } from "next/navigation";
import { focusAfter } from "@/helpers/ui";
import { useEffect, useRef } from "react";
import { COUNTRIES } from "@/config/constanst";
import api from "@/helpers/api";

export function MyForm({
  form,
  action = "upsert",
  children = null,
  invalidateQueries = null,
  dialogToOpen = null,
  afterForm = false,
  titleName = null,
  fieldsIndex = 0,
  additionalInfo = null,
  automaticClose = true,
  idToFucusAfter = null,
  editableId = null,
  componentNextToTitle = null,
  onlyChildren = false,
  avoidValidations = false,
  onlyShow = false,
  user = null,
}) {
  const ref = useRef(null);
  const current_store = useStore((s) => s.current_store);
  const creating = useStore((s) => s.creating);
  const loading = useStore((s) => s.loading);
  const canUpdate = useStore((s) => s[form].canUpdate);
  const canCreate = useStore((s) => s[form].canCreate);

  const errors = useStore((s) => s.errors);
  const update = useStore((s) => s.update);
  const reset = useStore((s) => s.reset);
  const router = useRouter();
  const config = ENTITIES[form];

  useEffect(() => {
    if (["company"].includes(form) && creating) {
      const country = COUNTRIES.find((c) => c.code === user?.geo?.country);

      update(form, {
        country,
      });
    }
    update("creating", true);
  }, [creating, form, update, user]);

  const showFormContent =
    canCreate || canUpdate || form !== "cashflow" || onlyShow;

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        update("openSelect", "");
        update("openMenu", "");
        const target = e.target as any;
        // Que se cierre cuando se seleccionó un día del calendario
        if (target?.nodeName === "TD" || target?.role === "dialog") {
          update("openDatePicker", "");
        }
      }}
      className={` bg-white p-5 sm:rounded-md flex flex-col w-full sm:max-w-[425px]`}
    >
      {!afterForm && children}

      <div className="mb-2.5">
        {" "}
        <div className="flex flex-row items-center justify-between">
          <span className="font-bold text-lg">
            {creating ? "Crear" : canUpdate === false ? "Detalle" : "Editar"}{" "}
            {titleName || config.singular}
          </span>
          {!!componentNextToTitle && componentNextToTitle}
        </div>
      </div>

      <form
        action={async (formData: FormData) => {
          const stateData = useStore.getState()[form];

          const logo = formData.get("logo") as File;

          if (logo?.size > 1048576) {
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

          const finalSchema = Array.isArray(ENTITIES[form][schema])
            ? ENTITIES[form][schema][fieldsIndex]
            : ENTITIES[form][schema];

          const editableContent = document.getElementById(editableId);

          const result = await finalSchema.safeParse(stateData);
          const ERRORS = Object.entries(errors).reduce((prev, curr) => {
            const message = curr[1];
            if (message) {
              prev.push({ message });
            }
            return prev;
          }, []);

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

          if (creating) {
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
            const creatingCashflow = form === "cashflow" && creating;
            if (!automaticClose && !creatingCashflow) {
              reset(form, true);
              update("creating", true);
              focusAfter(idToFucusAfter);
            } else {
              update("openDialog", "");
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
        className="flex flex-col gap-2 sm:gap-3"
      >
        {showFormContent &&
          !onlyChildren &&
          config.fields[fieldsIndex]({
            creating,
            state: useStore.getState()[form],
            canUpdate,
            canCreate,
            user,
            store: current_store,
          })}
        <DialogFooter>
          {((canUpdate !== false && !creating) || (canCreate && creating)) && (
            <Button type="submit" disabled={loading === config.loadingKey}>
              {loading === config.loadingKey ? (
                <LoadingSpinner />
              ) : creating ? (
                "Crear"
              ) : (
                "Editar"
              )}
            </Button>
          )}
        </DialogFooter>
      </form>
      {afterForm && !creating && children}
    </div>
  );
}
