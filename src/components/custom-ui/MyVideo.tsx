"use client";
import YouTube, { YouTubeProps } from "react-youtube";

const MyVideo = ({ videoId, width, height }) => {
  const options = {
    height,
    width,
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  const showClasses = width === 640 ? "xl:flex" : "md:flex xl:hidden";

  return (
    <div
      className={`hidden mx-auto w-fit shadow-lg  shadow-[#0E81A7] overflow-hidden rounded-2xl ${showClasses} items-center justify-center mt-10`}
    >
      <YouTube
        videoId={videoId}
        iframeClassName="rounded-2xl"
        opts={options}
        id="video"
      />
    </div>
  );
};

export default MyVideo;
