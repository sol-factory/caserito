import MyToaster from "@/components/custom-ui/MyToaster";

import LoginSide from "@/components/entities/users/LoginSide";

export default async function AdminLogin() {
  return (
    <body className="pb-40">
      <LoginSide tutorialId="KOBVLltl_nw" />
      <MyToaster />
    </body>
  );
}
