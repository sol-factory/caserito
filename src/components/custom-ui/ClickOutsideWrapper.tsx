"use client";
import { useStore } from "@/stores";

export const ClickOutsideWrapper = ({ children }) => {
  const update = useStore((s) => s.update);

  return (
    <div
      onClick={(e: any) => {
        if (e.target?.localName === "header") {
          update("openDatePicker", "");
        }
        // e.target.ariaLabel.includes("month")
      }}
    >
      {children}
    </div>
  );
};
