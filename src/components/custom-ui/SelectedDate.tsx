"use client";

import { useStore } from "@/stores";

const SelectedDate = ({ text, filterIdToOpen = null }) => {
  const update = useStore((s) => s.update);
  return (
    <span
      className="relative inline-block text-blue-600 font-extralight ml-1 hover:underline cursor-pointer"
      onClick={(e) => {
        if (!!filterIdToOpen) {
          e.stopPropagation();
          update("openDatePicker", filterIdToOpen);
          update("openSelect", "");
        }
      }}
    >
      {text}
    </span>
  );
};

export default SelectedDate;
