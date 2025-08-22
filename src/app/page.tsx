import MyToaster from "@/components/custom-ui/MyToaster";
import { MyTutorialDialog } from "@/components/custom-ui/MyTutorialDialog";
import LoginSide from "@/components/entities/users/LoginSide";

export default async function Dashboard() {
  return (
    <body className="pb-48">
      <div className="w-full pt-10">
        <LoginSide tutorialId="PJm3oYU25dk" ownersPage />
      </div>
      <MyTutorialDialog />
      <MyToaster />
    </body>
  );
}
