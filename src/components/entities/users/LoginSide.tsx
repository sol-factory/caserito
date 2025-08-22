import LoginForm from "./LoginForm";
import Image from "next/image";
import { Suspense } from "react";

const LoginSide = ({ ownersPage = false }) => {
  return (
    <div className="flex items-start  justify-center  pb-6 pt-2 sm:pt-10 lg:pb-24 bg-white h-screen">
      <div className="flex flex-col items-center justify-center w-[280px] gap-6">
        <div
          className={`flex items-center gap-2 ${ownersPage ? "pb-3" : "pb-6"} -mb-6 sm:-mb-3`}
        >
          <Image
            src="/logo.png"
            className="rounded-full w-40"
            alt="Image"
            width={90}
            height={60}
          />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold mt-4">
            Iniciar sesión
          </h1>
        </div>
        <div className="grid gap-4 w-full">
          <div className="grid gap-2">
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSide;
