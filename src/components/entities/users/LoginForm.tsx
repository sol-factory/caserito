"use client";
import { Button } from "@/components/ui/button";
import { useStore } from "@/stores";
import { LoadingSpinner } from "@/components/custom-ui/Spinner";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MyInput from "@/components/custom-ui/MyInput";
import { focusAfter, userPressed } from "@/helpers/ui";
import { isValidEmail } from "@/helpers/validations";
import { notify } from "@/helpers/notify";
import api from "@/helpers/api";
import useCheckParam from "@/hooks/use-check-param";

export default function LoginForm() {
  const router = useRouter();
  const [showCodeInput, setShowCodeInput] = useState(false);
  useCheckParam();
  const update = useStore((s) => s.update);
  const reset = useStore((s) => s.reset);
  const loading = useStore((s) => s.loading);
  const email = useStore((s) => s.login.email);
  const code = useStore((s) => s.login.code);

  const handleLoginCode = async () => {
    update("loading", "code");

    const response = await api(
      {
        email,
      },
      "user",
      "getLoginCode"
    );
    console.log({ response });
    if (response?.ok) {
      setShowCodeInput(true);
    }
    update("loading", "");
  };

  const handleLogin = async () => {
    update("loading", "login");

    const res: any = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), code }),
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    const result = await res.json();

    console.log({ result });

    if (result?.ok) {
      router.push(result.redirectTo);
      reset("company");
      update("creating", true);
      setTimeout(() => {
        update("login", { code: "", email: "" });
      }, 3000);
    } else {
      update("loading", "");
      notify(result);
    }
  };

  const handleAlreadyHasCode = () => {
    setShowCodeInput(true);
    focusAfter("code", 15);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoplayDemo") === "true") {
      update("openDialog", "tutorial");
      update("tutorial", { videoId: "id4hoDr4pro" });
    }
  }, []);

  return (
    <div id="login" className="grid gap-4 px-4">
      <div className="flex flex-col gap-3">
        <MyInput
          id="email"
          entity="login"
          field="email"
          type="email"
          placeholder="Correo electrónico"
          required
          trim
          toLowerCase
          cleanWhiteSpaces
          autocomplete="email"
          autoFocus
        />

        {showCodeInput && (
          <MyInput
            id="code"
            entity="login"
            field="code"
            placeholder="Código de verificación"
            required
            autoFocus
          />
        )}
      </div>
      {!showCodeInput && (
        <div className="flex flex-col justify-center items-center">
          <Button
            form="login"
            translate="no"
            onClick={handleLoginCode}
            disabled={loading === "code" || !isValidEmail(email)}
            className="w-full"
          >
            {loading === "code" ? <LoadingSpinner /> : "Obtener código"}
          </Button>
          <p
            id="already-has-code"
            className="hover:opacity-80 hover:underline focus:underline outline-none hover:cursor-pointer text-sm mt-3"
            tabIndex={0}
            translate="no"
            onClick={handleAlreadyHasCode}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (userPressed("Enter", e.code)) {
                handleAlreadyHasCode();
              }
            }}
          >
            Ya tengo un código
          </p>
        </div>
      )}
      {showCodeInput && (
        <div className="flex flex-col  justify-center items-center">
          <Button
            id="login-btn"
            type="button"
            translate="no"
            onClick={handleLogin}
            disabled={loading === "login" || !code || String(code).length !== 6}
            className="w-full"
          >
            {loading === "login" ? <LoadingSpinner /> : "Iniciar sesión"}
          </Button>
          <p
            id="new-code"
            tabIndex={0}
            className="hover:opacity-80 hover:underline focus:underline outline-none hover:cursor-pointer text-sm mt-3"
            onClick={handleLoginCode}
            translate="no"
            onKeyDown={(e) => {
              e.stopPropagation();
              if (userPressed("Enter", e.code)) {
                handleLoginCode();
              }
            }}
          >
            {loading === "code" ? <LoadingSpinner /> : "Solicitar nuevo código"}
          </p>
        </div>
      )}
    </div>
  );
}
