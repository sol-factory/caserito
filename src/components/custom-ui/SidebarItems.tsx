import { MENU_ITEMS } from "@/config";
import React from "react";
import AsideItem from "./AsideItem";

export default async function SidebarItems({ user }) {
  return (
    <div className="flex flex-col items-start gap-1 py-4 w-full ml-1">
      {MENU_ITEMS.map((mi: any) => (
        <AsideItem
          key={mi.name}
          icon={mi.icon}
          text={mi.menu_item_name}
          href={mi.href}
        />
      ))}
    </div>
  );
}
