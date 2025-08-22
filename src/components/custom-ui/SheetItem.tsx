"use client";
import { PanelLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores";

const SheetItem = ({ children }) => {
  const open = useStore((s) => s.sheetOpen);
  const update = useStore((s) => s.update);

  return (
    <Sheet open={open} onOpenChange={(open) => update("sheetOpen", open)}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="xl:hidden sm:px-5 px-2 !h-8 sm:!h-[2.65rem]"
          onClick={() => update("sheetOpen", true)}
        >
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="sm:max-w-xs max-w-56 py-2 pl-3 overflow-y-auto max-h-[100vh] [&>button]:hidden"
      >
        <SheetTitle></SheetTitle>
        <nav>{children}</nav>
      </SheetContent>
    </Sheet>
  );
};

export default SheetItem;
