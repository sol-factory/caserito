"use client";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores";

const MySlider = ({ form, field, className = "", min = 0, max = 100 }) => {
  const update = useStore((s) => s.update);
  const value = useStore((s) => s[form][field]);

  return (
    <div
      className={cn(
        "*:not-first:mt-4 cursor-grab",
        className,
        "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
      )}
    >
      <Slider
        defaultValue={[value]}
        value={[value]}
        aria-label="Simple slider"
        min={min}
        max={max}
        onValueChange={(values) => {
          update(form, { [field]: values[0] });
        }}
      />
    </div>
  );
};

export default MySlider;
