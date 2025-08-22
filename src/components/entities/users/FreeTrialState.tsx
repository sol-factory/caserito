import { getRemainingDays } from "@/helpers/subscription";
import { cn } from "@/helpers/ui";

const FreeTrialState = ({ trial_start_date, className = "", activeSub }) => {
  const remainingDays = getRemainingDays(trial_start_date);

  if (remainingDays > 0 && !activeSub) {
    return (
      <>
        <span
          className={cn(
            "text-[10px] font-light -mt-1 text-muted-foreground",
            className
          )}
        >
          Resta{remainingDays === 1 ? " " : "n "}
          <span className="text-blue-500">
            {remainingDays} {remainingDays === 1 ? "día" : "días"}
          </span>{" "}
          de prueba
        </span>
      </>
    );
  }

  if (remainingDays <= 0 && !activeSub) {
    return (
      <span
        className={cn(
          "text-[10px] -mt-1 text-muted-foreground font-light",
          className
        )}
      >
        Período de prueba <span className="text-red-500">expirado</span>{" "}
      </span>
    );
  }
};

export default FreeTrialState;
