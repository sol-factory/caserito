"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const HandleErrors = ({ user }) => {
  const pathname = usePathname();

  const avoidedErrors = [
    "ResizeObserver loop completed with undelivered notifications.",
    "ResizeObserver loop limit exceeded",
    "Script error.",
    "TypeError: Cannot read properties of undefined (reading 'call')",
    "TypeError: Cannot read properties of undefined (reading 'ok')",
  ];
  useEffect(() => {
    if (typeof window !== "undefined") {
      const reportError = (errorData) => {
        if (avoidedErrors.includes(errorData.message)) return;

        fetch("/api/errors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...errorData,
            user_email: user?.email,
            pathname,
            href: window.location.href,
          }),
        }).catch((err) => console.error("Error al enviar el log:", err));
      };

      window.onerror = function (message, source, lineno, colno, error) {
        reportError({
          type: "onerror",
          message,
          source,
          lineno,
          colno,
          error: error ? error.toString() : "No disponible",
          stack: error?.stack || "No disponible", // 👈 GUARDALO EN EL SERVIDOR
          userAgent: navigator.userAgent,
        });
      };

      //   window.addEventListener("error", (event) => {
      //     console.error("Error de recurso:", event);

      //     reportError({
      //       type: "resource-error",
      //       message: event.message || "Error en un recurso",
      //       source: event.filename,
      //       lineno: event.lineno,
      //       colno: event.colno,
      //       error: event.error ? event.error.toString() : "No disponible",
      //       userAgent: navigator.userAgent,
      //     });
      //   });

      window.addEventListener("unhandledrejection", (event) => {
        console.error("Promesa rechazada sin catch:", event.reason);

        reportError({
          type: "unhandledrejection",
          message: event.reason
            ? event.reason.toString()
            : "Promesa rechazada sin detalles",
          stack: event.reason?.stack || "No disponible", // 👈 Agregalo acá
          event,
          userAgent: navigator.userAgent,
        });
      });
    }
  }, []);
  return <></>;
};

export default HandleErrors;
