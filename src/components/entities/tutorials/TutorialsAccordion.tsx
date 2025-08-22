import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import TutorialsTable from "./TutorialsTable";
import VideoDuration from "./VideoDuration";
import { Video } from "lucide-react";
import { addEvent } from "@/helpers/api";

export const getDurationAsText = (tutorials) => {
  const duration = tutorials.reduce(
    (acc, curr) => {
      const [minutes, seconds] = curr.duration.split(":");

      return {
        minutes: acc["minutes"] + +minutes,
        seconds: acc["seconds"] + +seconds,
      };
    },
    { minutes: 0, seconds: 0 }
  );
  const minutesFromSeconds = Math.floor(duration.seconds / 60);
  const totalMinutes = duration.minutes + minutesFromSeconds;
  const remainingSeconds = duration.seconds - minutesFromSeconds * 60;

  return `${totalMinutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

export default function TutorialsAccordion({
  tutorials,
  title,
  showStep = false,
  open = false,
}) {
  const durationAsText = getDurationAsText(tutorials);

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        className="w-full space-y-2 "
        defaultValue={open ? title : ""}
      >
        <AccordionItem
          value={title}
          key={title}
          className="rounded-lg border bg-background px-4 py-1 sm:py-2"
        >
          <AccordionTrigger className="relative py-0 text-[15px] leading-6 hover:no-underline">
            <div className="flex flex-col">
              <span>{title}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-light">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-[1.2rem]" strokeWidth={0.7} />
                    <span className="font-bold">{tutorials.length}</span>{" "}
                  </div>
                </span>
                <VideoDuration
                  duration={durationAsText}
                  iconWidth="w-3.5"
                  className="flex items-center"
                />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <TutorialsTable tutorials={tutorials} showStep={showStep} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
