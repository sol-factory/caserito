"use client";
import StoresList from "../stores/StoresList";
import DropdownRow from "@/components/custom-ui/DropdownRow";
import { Badge } from "@/components/ui/badge";
import { Lock, Monitor } from "lucide-react";

const TemplateRow = ({ t }) => {
  return (
    <DropdownRow entity="template" item={t}>
      <div className="flex flex-col sm:flex-row max-h-20 overflow-y-hidden py-3 cursor-pointer border-b-violet-50 text-sm">
        <div className="flex flex-col font-normal w-48">
          <div className="flex items-center font-semibold gap-2 select-none">
            <span translate="no">{t.name}</span>
            {t.locked && <span>🔒</span>}
          </div>
        </div>
        <div className="hidden lg:block pl-6 w-60">
          <StoresList stores={t.stores} />
        </div>
        <div className="hidden lg:block">
          <div className="flex flex-col justify-start items-start gap-1 pl-10">
            {t.screens.map((s) => (
              <div key={s._id} className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />{" "}
                <span className="text-wrap select-none">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DropdownRow>
  );
};

export default TemplateRow;
