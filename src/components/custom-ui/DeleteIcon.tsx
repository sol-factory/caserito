"use client";
import { Trash2 } from "lucide-react";
import { cn } from "@/helpers/ui";

interface Props {
  className?: string;
  text?: string;
  tiny?: boolean;
  onClick?: (e) => void;
}

const DeleteIcon = ({ className, tiny, text, onClick }: Props) => {
  return (
    <div
      tabIndex={-1}
      className={cn("flex items-center cursor-pointer", className)}
      onClick={(e) => {
        if (typeof onClick === "function") {
          onClick(e);
        }
      }}
    >
      <div className="flex items-center justify-center gap-4" tabIndex={-1}>
        <Trash2
          tabIndex={-1}
          strokeWidth={tiny ? 1.75 : 2}
          className={`text-red-700 hover:text-red-500 hover:cursor-pointer outline-none focus:outline-none ${
            tiny ? "h-4 w-4" : "h-5 w-5 -ml-0.5"
          }`}
        />
        {text && <span className="-ml-[2px] select-none">{text}</span>}
      </div>
    </div>
  );
};

export default DeleteIcon;
