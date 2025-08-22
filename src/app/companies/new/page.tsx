import { MyForm } from "@/components/custom-ui/MyForm";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import MyToaster from "@/components/custom-ui/MyToaster";
import { MyTutorialDialog } from "@/components/custom-ui/MyTutorialDialog";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import LogoutBtn from "@/components/entities/users/LogoutBtn";
import { verifySession } from "@/helpers/auth";

export default async function Page({ params }) {
  const user = await verifySession();

  return (
    <body className="relative min-h-screen w-full bg-gray-600 flex flex-col items-center sm:pt-5 pb-24">
      <MyForm form="company" user={user} />
      <LogoutBtn user={user} />
      <MyToaster />
      <MyTutorialDialog />
    </body>
  );
}
