import LoginForm from "./LoginForm";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import Image from "next/image";
import { Suspense } from "react";
import TutorialVideo from "../tutorials/TutorialVideo";

const LoginSide = ({ ownersPage = false }) => {
  return (
    <div className="flex items-start  justify-center  pb-6 pt-2 sm:pt-10 lg:pb-24 bg-white h-screen">
      <div className="flex flex-col items-center justify-center w-[350px] gap-6">
        <div
          className={`flex items-center gap-2 ${ownersPage ? "pb-3" : "pb-6"} -mb-6 sm:-mb-3`}
        >
          <Image
            src="/logo.png"
            className="rounded-full w-11 sm:w-16"
            alt="Image"
            width={90}
            height={60}
          />
          <h1 className="text-gray-800 text-4xl   sm:text-6xl  font-bold">
            Caserito
          </h1>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl lg:text-3xl font-bold">Iniciar sesión</h1>
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
