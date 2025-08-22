"use client";

import { Button } from "@/components/ui/button";
import { addDays } from "date-fns";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

const ChangeWeek = ({ date }) => {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="hover:underline font-light text-xs cursor-pointer px-1.5 h-6 gap-1"
        onClick={() =>
          router.push(`/washes?date=${+addDays(date, -7)}&view=weekly`)
        }
      >
        <ArrowLeft /> Anterior
      </Button>
      <Button
        variant="outline"
        className="hover:underline font-light text-xs cursor-pointer px-1.5 h-6 gap-1"
        onClick={() =>
          router.push(`/washes?date=${+addDays(date, 7)}&view=weekly`)
        }
      >
        Siguiente <ArrowRight />
      </Button>
    </div>
  );
};

export default ChangeWeek;
