"use client";
import { useStore, type StateStore } from "@/stores";
import {
  genTemplatePlaceholder,
  insertHtmlAtCursorPosition,
  TPossibleTemplates,
} from "@/helpers/ui";
import clsx from "clsx";
import { useEffect, useRef } from "react";

interface Props<E extends keyof StateStore> {
  id?: string | number | undefined;
  entity: E;
  field: keyof StateStore[E];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}

const POSSIBLE_TEAMPLES = [
  {
    name: "Nombre del cliente",
    allowedScreens: ["Ventas", "Clientes", "Cotizaciones"],
  },
  {
    name: "Nombre del integrante",
    allowedScreens: ["Personal"],
  },
  {
    name: "Datos del vehículo",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Fecha de la venta",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Detalle de la venta",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Nombre de la sucursal",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Dirección sucursal",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Código de retiro",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Fecha y hora de retiro",
    allowedScreens: ["Ventas"],
  },
  {
    name: "Nombre de la empresa",
    allowedScreens: ["Ventas", "Clientes", "Personal", "Cotizaciones"],
  },
  {
    name: "Link para ingresar",
    allowedScreens: ["Personal"],
  },
];

const MyTextAreaCE = <E extends keyof StateStore>({
  id,
  entity,
  field,
  placeholder,
  disabled = false,
  autoFocus,
}: Props<E>) => {
  const content = useStore((s) => s[entity][field]) as string;
  const screens = useStore((s) => s.template.screens);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current.innerHTML = content;
  }, [content]);

  const screensNames = screens.map((s) => s.name);

  const handleKeyDown = (e) => {
    // Simular "Shift + Enter" cuando el usuario presiona "Enter"
    if (e.key === "Enter") {
      e.preventDefault(); // Evitar comportamiento predeterminado

      const br = document.createElement("br");
      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        // Insertar el salto de línea (<br>)
        range.deleteContents();
        range.insertNode(br);

        // Mover el cursor a la nueva posición (después del <br>)
        range.setStartAfter(br);
        range.setEndAfter(br);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-1.5 flex-wrap mb-2">
        <div>
          <span className="text-xs underline">Agregar dinámicamente</span>
          <span className="text-xs">:</span>{" "}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POSSIBLE_TEAMPLES.filter((pt: TPossibleTemplates) => {
            const canBeUsed =
              screensNames.every((sn) => pt.allowedScreens.includes(sn)) &&
              screensNames.length > 0;

            return canBeUsed;
          }).map((pt: TPossibleTemplates) => (
            <button
              key={pt.name}
              className="bg-blue-100 select-none cursor-pointer rounded px-1 text-xs"
              onClick={(e) => {
                e.preventDefault();

                insertHtmlAtCursorPosition(
                  ref.current,
                  genTemplatePlaceholder(pt.name)
                );
              }}
            >
              {pt.name}
            </button>
          ))}
        </div>
      </div>

      <div
        id={String(id)}
        ref={ref}
        className={clsx(
          "relative placeholder:text-zinc-400 placeholder:font-light focus:ring-1 focus:ring-gray-800 outline-none focus-visible:ring-1 -line border rounded-md p-2 min-h-[100px] focus:outline-none",
          disabled &&
            "bg-gray-100 cursor-not-allowed text-sm leading-3 max-w-full",
          "whitespace-pre-wrap break-words break-all"
        )}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default MyTextAreaCE;
