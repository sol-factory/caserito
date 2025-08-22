import { CircleCheck, CirclePlus } from "lucide-react";
import React from "react";

const SubscriptionItem = ({ children, plus = false }) => {
  return (
    <div className="flex items-center gap-1">
      {!plus && <CircleCheck className="w-3 h-3 text-white" fill="#42AAD4" />}
      {plus && <CirclePlus className="w-3 h-3 text-white" fill="#16a34a" />}
      <span>{children}</span>
    </div>
  );
};

export default SubscriptionItem;
