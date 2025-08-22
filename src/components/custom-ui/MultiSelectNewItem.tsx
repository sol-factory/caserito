import { ENTITIES } from "@/config";
import { useStore } from "@/stores";

const MultiSelectNewItem = ({ entity, form }) => {
  const update = useStore((s) => s.update);

  return (
    <div className="w-full items-start flex text-sm mb-2 mt-2">
      <span
        className="text-xs text-blue-500 hover:cursor-pointer hover:underline text-center w-full"
        onClick={(e) => {
          e.stopPropagation();
          ENTITIES[entity].ui.selects.handleNewItem(update, useStore, form);
        }}
      >
        {ENTITIES[entity].ui.selects.newItemText}
      </span>
    </div>
  );
};

export default MultiSelectNewItem;
