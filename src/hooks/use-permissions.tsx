import { useStore } from "@/stores";

const usePermissions = () => {
  const user_member = useStore((s) => s.user_member);

  const hasHerarchy = user_member?.isOwner || user_member?.isManager;

  return {
    isOwner: !!user_member?.isOwner,
    isManager: !!user_member?.isManager,
    isDeveloper: user_member?.email === "mgesualdo14@gmail.com",
    user_email: user_member?.email,
    can_view_quote: hasHerarchy || user_member?.can_view_quote,
    can_view_cashflow: hasHerarchy || user_member?.can_view_cashflow,
    can_view_amount_quote: hasHerarchy || user_member?.can_view_amount_quote,
    can_view_client: hasHerarchy || user_member?.can_view_client,
    can_edit_client: hasHerarchy || user_member?.can_edit_client,
    can_view_phone_client: hasHerarchy || user_member?.can_view_phone_client,
    can_view_service: hasHerarchy || user_member?.can_view_service,
    can_view_amount_service:
      hasHerarchy || user_member?.can_view_amount_service,
    can_view_amount_sale: hasHerarchy || user_member?.can_view_amount_sale,
  };
};

export default usePermissions;
