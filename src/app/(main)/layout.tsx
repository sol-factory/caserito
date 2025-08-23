import type { Metadata } from "next";
import "@/app/globals.css";
import SheetItem from "@/components/custom-ui/SheetItem";
import MySearchBar from "@/components/custom-ui/MySearchBar";
import UserMenu from "@/components/entities/users/UserMenu";
import QueryProvider from "@/components/custom-ui/QueryProvider";
import { verifySession } from "@/helpers/auth";
import MyToaster from "@/components/custom-ui/MyToaster";
import connectDB from "@/lib/connectDB";
import { TeamsMenu } from "@/components/custom-ui/TeamsMenu";
import { MemberModel } from "@/schemas/member";
import SidebarItems from "@/components/custom-ui/SidebarItems";
import ResetSalesDialog from "@/components/entities/sales/ResetSalesDialog";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import ExpirationBanner from "@/components/custom-ui/ExpirationBanner";
import { getRemainingDays } from "@/helpers/subscription";
import CompanyModel from "@/schemas/company";
import { toObjectId } from "@/helpers/mdb";
import { DatePickerRange } from "@/components/custom-ui/DatePickerRange";
import { SocketProvider } from "@/components/entities/templates/SocketProvider";
import { ClickOutsideWrapper } from "@/components/custom-ui/ClickOutsideWrapper";
import HandleErrors from "@/components/custom-ui/HandleErrors";
import StoreModel from "@/schemas/store";
import { SubscriptionModel } from "@/schemas/subscription";
import Welcome from "@/components/entities/companies/Welcome";
import DeleteDialog from "@/components/custom-ui/DeleteDialog";
import { DatePickerPeriod } from "@/components/custom-ui/DatePickerPeriod";
import AttachmentsTable from "@/components/entities/attachments/AttachmentsTable";
import CommentsTable from "@/components/entities/comments/CommentsTable";

export const metadata: Metadata = {
  title: "Caserito",
  description: "App creada para ayudar al gate con las tareas del case.",
};

export default async function AppLayout({ children }) {
  await connectDB();
  const user = await verifySession();

  const memberships = await MemberModel.aggregate([
    {
      $match: {
        "user.email": user?.email,
        deleted: false,
      },
    },
    { $unwind: "$stores" },
    {
      $project: {
        _id: { $toString: "$_id" },
        company: {
          _id: {
            $toString: "$company._id",
          },
          name: "$company.name",
          logo_url: "$company.logo_url",
        },
        store: { _id: { $toString: "$stores._id" }, name: "$stores.name" },
        role: { _id: { $toString: "$role._id" }, name: "$role.name" },
      },
    },
    { $match: { "store._id": { $ne: user?.store?._id } } },
  ]);

  const [company] = await CompanyModel.aggregate([
    { $match: { _id: toObjectId(user?.company?._id) } },
    {
      $project: {
        _id: { $toString: "$_id" },
        name: 1,
        country: { code: "$country" },
        phone: "$phone.formatted_number",
        formatted_number: "$phone.formatted_number",
        phone_for_url: "$phone.phone",
        logo_url: 1,
        fiscal_id: 1,
        fiscal_category: 1,
        subscription: {
          _id: { $toString: "$subscription._id" },
          stores: "$subscription.stores",
          status: "$subscription.status",
          active: "$subscription.active",
          provider: "$subscription.provider",
          provider_id: "$subscription.provider_id",
        },
        trial_start_date: 1,
      },
    },
  ]);

  const remainingDays = getRemainingDays(company?.trial_start_date);
  let store = await StoreModel.findById(user?.store?._id, {
    name: 1,
    address: 1,
    country: 1,
    country_code: 1,
    allow_workers: 1,
    currency: 1,
    allow_multi_currency: 1,
    allow_vehicle_insurance: 1,
    allow_client_address: 1,
    allow_client_email: 1,
    allow_client_fiscal_id: 1,
    allow_pick_up_date: 1,
    allow_check_in_date: 1,
    track_services_time: 1,
    allow_sale_color: 1,
    show_permanence: 1,
    usd_exchange_rate: 1,
    quotes_observations: 1,
    quotes_dark_mode: 1,
    quotes_valid_days: 1,
    quotes_primary_color: 1,
    quotes_secondary_color: 1,
    quotes_limit: 1,
    quotes_count: 1,
    quotes_limit_start_date: 1,
    quotes_tax: 1,
    quotes_payment_conditions: 1,
    whatsapp_number: "$whatsapp.number",
    createdAt: 1,
  });
  store = store ? { ...store.toObject(), _id: store._id.toString() } : {};

  const storeSub: any = await SubscriptionModel.findOne(
    {
      store_id: user?.store?._id,
    },
    {
      status: 1,
      subscription_id: 1,
      amount: 1,
      messages: 1,
      quotes: 1,
      files: 1,
    }
  );

  const [member] = await MemberModel.aggregate([
    {
      $match: {
        "user.email": user?.email,
        deleted: false,
      },
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        can_view_quote: "$permissions.quote.can_view",
        can_view_amount_quote: "$permissions.quote.can_view_amount",
        can_view_cashflow: "$permissions.cashflow.can_view",
        can_view_client: "$permissions.client.can_view",
        can_edit_client: "$permissions.client.can_edit",
        can_view_phone_client: "$permissions.client.can_view_phone",
        can_view_service: "$permissions.service.can_view",
        can_view_amount_service: "$permissions.service.can_view_amount",
        can_view_amount_sale: "$permissions.sale.can_view_amount",
        email: "$user.email",
        isManager: { $eq: ["$role.name", "Encargado"] },
        isOwner: { $eq: ["$role.name", "Socio"] },
      },
    },
  ]);
  let activeStoreSub = null;

  if (["authorized", "ACTIVE"].includes(storeSub?.status)) {
    activeStoreSub = storeSub;
  }

  return (
    <QueryProvider>
      <SocketProvider
        user={user}
        store={store}
        company={company}
        member={member}
      >
        <body className="!p-0  sm:!pb-20 bg-gray-500 h-screen">
          <ClickOutsideWrapper>
            <div className="flex justify-center w-100 h-screen  md:!max-w-[94vw] lg:!w-[1200px] mx-auto rounded-none overflow-hidden w-full shadow bg-muted/40 relative">
              <aside className="abosolute inset-y-0 left-0 z-10 hidden w-auto  flex-col border-r bg-background xl:flex">
                <nav className="flex flex-col items-start gap-2 px-3 py-4 md:!min-w-48">
                  <TeamsMenu
                    user={user}
                    company={company}
                    memberships={memberships}
                    id="memberships"
                  />
                  <SidebarItems user={user} />
                </nav>
              </aside>
              <div className="flex flex-col sm:gap-4 sm:py-4  sm:pl-5 w-full max-h-full  bg-gray-200">
                <header className="fixed top-0 z-10 w-full flex h-11 items-center justify-between gap-2 sm:gap-4 border-b bg-background pr-2 sm:static sm:h-auto sm:border-0 sm:bg-transparent pl-2 sm:pl-0 sm:pr-6">
                  <SheetItem>
                    <TeamsMenu
                      user={user}
                      company={company}
                      memberships={memberships}
                      id="memberships-sheet"
                    />
                    <SidebarItems user={user} />
                  </SheetItem>
                  <DatePickerRange id="filtro-informe" />
                  <DatePickerPeriod btnClassName="!h-8 !py-3 sm:!py-5 w-full" />
                  <MySearchBar />

                  <UserMenu user={user} />
                </header>
                {!activeStoreSub && !(storeSub?.status === "paused") && (
                  <ExpirationBanner remainingDays={remainingDays} />
                )}

                <main
                  className="w-full mt-14 sm:mt-0 min-h-[40rem] sm:pr-6 md:pb-6 overflow-y-auto"
                  style={{ scrollbarWidth: "none" }}
                >
                  {children}
                  <DeleteDialog />
                  <MyFormDialog
                    form="attachment"
                    hidden
                    automaticClose={false}
                    invalidateQueries
                  >
                    <AttachmentsTable />
                  </MyFormDialog>
                  <MyFormDialog
                    form="comment"
                    hidden
                    automaticClose={false}
                    invalidateQueries
                  >
                    <CommentsTable />
                  </MyFormDialog>
                  <ResetSalesDialog />
                  <MyToaster />
                  <Welcome />
                </main>
              </div>
            </div>
            <MyFormDialog form="company" hidden />
          </ClickOutsideWrapper>
          <HandleErrors user={user} />
        </body>
      </SocketProvider>
    </QueryProvider>
  );
}
