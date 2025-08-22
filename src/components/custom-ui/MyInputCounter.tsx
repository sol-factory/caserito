import { useStore } from "@/stores";
import { Minus, Plus } from "lucide-react";
import React from "react";

const MyInputCounter = ({ entity, field }) => {
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[entity][field]);

  return (
    <div className="flex flex-col items-center h-12">
      <Plus className="w-3" />
      <span>{value}</span>
      <Minus className="w-3" />
    </div>
  );
};

export default MyInputCounter;
