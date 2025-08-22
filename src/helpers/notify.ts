"use client";
import { ReactElement } from "react";
import toast, { ToastPosition, ToastType } from "react-hot-toast";

export const notify = (
  result: { ok: boolean; message: string },
  position?: ToastPosition,
  duration?: number
) => {
  const { ok, message } = result || {};
  const notificationType = ok ? "success" : "error";

  const config = {
    position,
  };

  if (!!duration) {
    config["duration"] = duration;
  }

  toast[notificationType](message, config);
};

export const customNotify = (
  result: { content: ReactElement },
  duration = 2000
) => {
  const { content } = result || {};

  toast(
    (t) => {
      return content;
    },
    { duration }
  );
};
