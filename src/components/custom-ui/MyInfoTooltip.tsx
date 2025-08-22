import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Info, User } from "lucide-react";
import { useStore } from "@/stores";
import { cn } from "@/lib/utils";
import { TooltipPortal } from "@radix-ui/react-tooltip";

const MyInfoTooltip = ({
  id,
  text = "",
  children,
  className = "",
  tinyIcon = false,
  iconText = "",
  icon = "info",
}) => {
  const update = useStore((s) => s.update);
  const tooltipId = useStore((s) => s.tooltipId);

  const ICONS = {
    info: (
      <Info
        className={`${tinyIcon ? "min-w-3 w-3 h-3" : "min-w-3.5 w-3.5 h-3.5"} cursor-pointer hover:text-blue-600`}
        strokeWidth={1.2}
      />
    ),
    user: (
      <User
        className={`${tinyIcon ? "min-w-3 w-3 h-3" : "min-w-3.5 w-3.5 h-3.5"} cursor-pointer text-violet-600 hover:text-violet-800`}
        strokeWidth={1.2}
      />
    ),
  };
  const opened = tooltipId === id;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip
        open={opened}
        onOpenChange={(open) => update("tooltipId", open ? id : "")}
      >
        <TooltipTrigger
          asChild
          onClick={(e) => {
            update("tooltipId", id);
            e.stopPropagation();
          }}
        >
          {iconText ? (
            <span className="text-[0.8rem] ml-1">{iconText}</span>
          ) : (
            ICONS[icon]
          )}
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            className={cn(
              "max-w-72 bg-black py-3 shadow whitespace-pre-line !z-50",
              className
            )}
            align="center"
          >
            <div className="grid grow space-y-1 !z-50">
              {text && (
                <p className="text-[13px] font-semibold text-white">{text}</p>
              )}
              <p
                id={`${id}-description`}
                className="text-xs max-w-72 font-light select-none text-stone-400"
              >
                {children}
              </p>
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MyInfoTooltip;
