"use client";
import MyInput from "./MyInput";
import { useStore } from "@/stores";

export default function InputWithBtn({ text, onClick }) {
  const code = useStore((s) => s.subscription["discount_code"]);
  return (
    <div className="flex rounded-lg shadow-sm shadow-black/5 w-full">
      <MyInput
        id={text}
        entity="subscription"
        field="discount_code"
        placeholder="Código de descuento"
        type="text"
        className="w-full"
        inputClassName="flex-1 rounded-e-none shadow-none focus-visible:z-10 border-r-0"
        toUpperCase
      />
      <button
        onClick={(e) => onClick(e, code)}
        className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {text}
      </button>
    </div>
  );
}
