"use client";

import { meses } from "@/components/custom-ui/DropdownFilter";

const SelectedMonth = ({ month }) => {
  const mes = meses[month];
  return <span className="text-blue-400 font-light ml-2 mr-2">{mes}</span>;
};

export default SelectedMonth;
