import { MapPin } from "lucide-react";
import React from "react";

const StoresList = ({ stores }) => {
  return (
    <div className="hidden lg:flex lg:flex-col gap-1 w-48 ">
      {stores.map((s) => (
        <div key={s._id} className="flex items-center gap-2 ">
          <MapPin className="min-w-4 h-4" />{" "}
          <span className="text-wrap select-none">{s.name}</span>
        </div>
      ))}
    </div>
  );
};

export default StoresList;
