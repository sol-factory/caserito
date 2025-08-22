"use client";
import { TableRow } from "@/components/ui/table";
import { useStore } from "@/stores";
import React, { ReactNode } from "react";

const MyRow = ({
  children,
  dialog,
  state,
  form,
}: {
  children: ReactNode;
  state;
  dialog;
  form;
}) => {
  const update = useStore((s) => s.update);
  return (
    <div
      className="cursor-pointer"
      onClick={async () => {
        update(form, state);
        update("openDialog", dialog);
        update("creating", false);
      }}
    >
      {children}
    </div>
  );
};

export default MyRow;
