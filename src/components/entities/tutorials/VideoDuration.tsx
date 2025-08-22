import { cn } from "@/helpers/ui";
import { Clock } from "lucide-react";

const VideoDuration = ({ duration, iconWidth = "w-3.5", className = null }) => {
  return (
    <div className={cn("sm:flex sm:items-center gap-1 hidden", className)}>
      <Clock className={iconWidth} strokeWidth={1} />
      <div className="flex flex-col">
        <div>
          <span>{duration}</span>
          <span className="text-muted-foreground text-xs font-light"> min</span>
        </div>
      </div>
    </div>
  );
};

export default VideoDuration;
