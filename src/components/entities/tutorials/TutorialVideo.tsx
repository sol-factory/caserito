"use client";
import { addEvent } from "@/helpers/api";
import { useStore } from "@/stores";
import { useState } from "react";

const TutorialVideo = ({ videoId, custom_id, title }) => {
  const [hasClicked, setHasClicked] = useState(false);
  const update = useStore((s) => s.update);

  return (
    <div
      className={`relative transition duration-300 group hover:scale-105 hover:drop-shadow-lg rounded-lg shadow-lg  mb-3 w-[16.8rem] h-[9.3rem] ${custom_id === 1 ? "sm:w-[26.8rem] sm:h-[14.1rem]" : ""} overflow-hidden`}
    >
      <div
        className=" bg-cover bg-center cursor-pointer w-full h-full"
        style={{
          backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
        }}
        onClick={async () => {
          if (hasClicked) return;
          setHasClicked(true);
          update("tutorial", { videoId: videoId });
          update("openDialog", "tutorial");
          await addEvent(navigator.userAgent, "aquapp", title, {
            isTutorial: true,
            tutorial_custom_id: custom_id,
          });
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center transition duration-300 group-hover:brightness-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 68 48"
            className="w-16 h-16"
          >
            <path
              d="M66.52 7.2a8 8 0 0 0-5.64-5.66C56.46 0 34 0 34 0s-22.46 0-26.88 1.54A8 8 0 0 0 1.48 7.2 83.6 83.6 0 0 0 0 24a83.6 83.6 0 0 0 1.48 16.8 8 8 0 0 0 5.64 5.66C11.54 48 34 48 34 48s22.46 0 26.88-1.54a8 8 0 0 0 5.64-5.66A83.6 83.6 0 0 0 68 24a83.6 83.6 0 0 0-1.48-16.8z"
              fill="#f00"
            />
            <path d="M45 24 27 14v20z" fill="#fff" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TutorialVideo;
