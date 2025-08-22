"use client";
import { CONFIG } from "@/config/constanst";
import { getFileTypeUrl } from "@/helpers/images";
import { notify } from "@/helpers/notify";
import { useStore } from "@/stores";
import Image from "next/image";
import { useRef } from "react";

const FileUploadInput = ({
  name,
  form,
  field,
  text = "Logo de la empresa",
  acceptedTypes = "image/*",
  acceptedDescription = "PNG, JPG, GIF hasta 1MB",
}) => {
  const url = useStore((s) => s[form][field]);
  const update = useStore((s) => s.update);

  const previousUrl = useRef(null);

  const isImage = acceptedTypes === "image/*";

  return (
    <div className="flex items-center justify-center w-full relative">
      <label
        htmlFor={name}
        className="flex items-center justify-center w-full py-2 h-fit px-4 transition-colors border-[1px] border-dashed rounded-md cursor-pointer text-muted-foreground hover:border-primary hover:bg-primary/5"
      >
        <div className="text-center">
          <span className="text-gray-800 font-bold block mb-2">
            {url
              ? `${isImage ? "Imagen seleccionada" : "Archivo seleccionado"}`
              : text}
          </span>

          {!url ? (
            <svg
              className="w-12 h-12 mx-auto text-muted-foreground"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <div className="flex items-center justify-center text-center mb-2">
              <Image
                src={url}
                width={70}
                height={70}
                alt="Imagen seleccionada"
                className="min-w-28"
              />
            </div>
          )}
          <div className="flex text-sm text-muted-foreground !mt-1">
            <span className="relative cursor-pointer outline-none ring-0 rounded-md font-medium text-primary focus-within:outline-none hover:underline">
              <span>Subir {isImage ? "imagen" : "archivo"}</span>
              <input
                id={name}
                type="file"
                name={name}
                className="sr-only"
                accept={acceptedTypes}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const maxSize = isImage ? 1 * 1024 * 1024 : 2 * 1024 * 1024;

                  if (file.size > maxSize) {
                    notify({
                      ok: false,
                      message: `El archivo supera el tamaño permitido de ${
                        isImage ? "1MB para imágenes" : "2MB"
                      }.`,
                    });
                    return;
                  }

                  if (previousUrl.current) {
                    URL.revokeObjectURL(previousUrl.current);
                  }

                  if (isImage) {
                    const image = new window.Image();
                    image.onload = () => {
                      const { width, height } = image;

                      if (
                        (height <= 500 && width >= height) ||
                        form !== "company"
                      ) {
                        const newUrl = URL.createObjectURL(file);
                        previousUrl.current = newUrl;
                        update(form, {
                          [field]: newUrl,
                        });
                      } else {
                        notify({
                          ok: false,
                          message: `Tu logo debe cumplir estas condiciones:
          1️⃣ Máximo 500px de alto
          2️⃣ Ancho mayor al alto

          Tu imagen tiene ${width}px x ${height}px.`,
                        });
                      }
                    };

                    image.onerror = () => {
                      notify({
                        ok: false,
                        message:
                          "No se pudo cargar la imagen. Asegurate de que sea un archivo válido.",
                      });
                    };

                    image.src = URL.createObjectURL(file);
                  } else {
                    const url = getFileTypeUrl(file.type);

                    update(form, {
                      [field]: url,
                    });
                  }
                }}
              />
            </span>
            <p className="pl-1">o arrastra y suelta</p>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {acceptedDescription}
          </p>
        </div>
      </label>
    </div>
  );
};

export default FileUploadInput;
