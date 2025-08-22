"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { ENTITIES } from "@/config";
import { getFontSize } from "@/helpers/ui";
import usePermissions from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores";

const DropdownRow = ({
  item,
  entity,
  isLastOne = false,
  children,
  colorAllowed = false,
  companyName = null,
  rowItemsCount = 4,
  hover = true,
  className = "",
  preventClick = false,
  style = null,
}) => {
  const { isOwner, isManager } = usePermissions();
  const update = useStore((s) => s.update);
  const click = useStore((s) => s.click);
  const openMenu = useStore((s) => s.openMenu);

  const handleClick = async (e) => {
    if (!ENTITIES[entity].menus || preventClick) return;
    e.preventDefault();
    const fontSize = getFontSize();

    const spaceToRight = window.innerWidth - e.clientX;
    const spaceToBottom = window.innerHeight - e.clientY;

    const menuWidth = (208 * fontSize) / 16;
    const x =
      spaceToRight > 300 ? e.clientX : Math.max(10, e.clientX - menuWidth);

    const maxMove = rowItemsCount * 75;

    const moveUp = Math.max(maxMove - spaceToBottom, 0);
    const y = spaceToBottom < maxMove ? e.clientY - moveUp : e.clientY;
    update("click", { x, y, _id: item._id });
    update("openMenu", entity);
    if (entity !== "attachment") {
      update("creating", false);
    }
  };

  return (
    <div
      className={cn(
        `relative !z-0 cursor-pointer !w-full ${hover ? "hover:bg-accent" : ""} pr-3 sm:px-3 ${
          click._id === item._id ? "bg-accent" : ""
        }  ${!isLastOne ? "border-b-[0.5px]" : ""}`,
        className
      )}
      style={style}
      onClick={handleClick}
      onContextMenu={handleClick}
      onMouseEnter={() => update("hover_id", item._id)}
      onMouseLeave={() => update("hover_id", "")}
    >
      <DropdownMenu
        open={openMenu === entity && click._id === item._id}
        onOpenChange={(open) => {
          if (!open) {
            update("openMenu", "");
            update("click", { _id: "" });
          }
        }}
      >
        {children}

        <DropdownMenuContent
          side="bottom"
          align="start"
          style={
            !!click
              ? {
                  position: "absolute",
                  left: `${click.x}px`,
                  top: `${click.y}px`,
                }
              : null
          }
          className="w-56"
        >
          {ENTITIES[entity].menus?.rowItems(
            item,
            isOwner,
            companyName,
            isManager,
            colorAllowed
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DropdownRow;
