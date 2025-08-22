import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import MembersTable from "@/components/entities/users/MembersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/helpers/auth";
import { toObjectId } from "@/helpers/mdb";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import { MemberModel } from "@/schemas/member";

export default async function Members({ searchParams }) {
  await connectDB();
  const user = await verifySession();

  const { search } = await searchParams;

  const matchStage = {
    "company._id": toObjectId(user?.company?._id),
    deleted: false,
  };
  if (!!search) {
    const regex = cleanRegExp(search);
    matchStage["search_field"] = regex;
  }

  const members = await MemberModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        email: "$user.email",
        firstname: "$user.firstname",
        lastname: "$user.lastname",
        avatar_url: "$user.avatar_url",
        country: "$user.phone.country",
        can_view_quote: "$permissions.quote.can_view",
        can_view_amount_quote: "$permissions.quote.can_view_amount",
        can_view_client: "$permissions.client.can_view",
        can_edit_client: "$permissions.client.can_edit",
        can_view_phone_client: "$permissions.client.can_view_phone",
        can_view_service: "$permissions.service.can_view",
        can_view_amount_service: "$permissions.service.can_view_amount",
        can_view_amount_sale: "$permissions.sale.can_view_amount",
        country_code: "$user.phone.country_code",
        phone: { $ifNull: ["$user.phone.phone", ""] },
        formatted_number: { $ifNull: ["$user.phone.formatted_number", ""] },
        company: { _id: { $toString: "$company._id" }, name: "$company.name" },
        stores: {
          $map: {
            input: "$stores",
            as: "store",
            in: {
              _id: {
                $convert: { input: "$$store._id", to: "string" },
              },
              name: "$$store.name",
            },
          },
        },
        attachments_count: { $size: { $ifNull: ["$attachments", []] } },
        sales_percentage: "$payment_scheme.sales_percentage",
        fixed_salary: "$payment_scheme.fixed_salary",
        payment_type: "$payment_scheme.payment_type",
        pay_cycle: "$payment_scheme.pay_cycle",
        role: { _id: { $toString: "$role._id" }, name: "$role.name" },
        user_id: { $toString: "$user._id" },
      },
    },
  ]);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none flex flex-col relative max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-hidden"
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Personal</CardTitle>
          <MyFormDialog form="member" user={user} />
          <MyFormDialog
            form="member"
            user={user}
            fieldsIndex={1}
            hidden
            titleName="sueldo"
          />
          <MyFormDialog
            form="member"
            user={user}
            fieldsIndex={2}
            hidden
            titleName="permisos"
          />
        </div>
      </CardHeader>
      <CardContent className="overflow-y-auto flex-1">
        <MembersTable members={members} user={user} />
      </CardContent>
    </Card>
  );
}
