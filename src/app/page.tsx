import MyToaster from "@/components/custom-ui/MyToaster";
import LoginSide from "@/components/entities/users/LoginSide";

export default async function Dashboard() {
  return (
    <body className="pb-48">
      <div className="w-full pt-10">
        <LoginSide ownersPage />
      </div>

      <MyToaster />
    </body>
  );
}
