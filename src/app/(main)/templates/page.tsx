import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import TemplatesTable from "@/components/entities/templates/TemplatesTable";
import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import { verifySession } from "@/helpers/auth";
import { getBooleanRoles } from "@/helpers/permissions";
import { getWorkplace } from "@/helpers/mdb";
import TemplateModel from "@/schemas/template";
import connectDB from "@/lib/connectDB";
import { cleanRegExp, cleanText } from "@/helpers/text";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import ConnectWhatsappDialog from "@/components/entities/templates/ConnectWhatsappDialog";

export default async function Templates({ searchParams }) {
  await connectDB();
  const user = await verifySession();
  const { search } = await searchParams;

  const matchStage = { ...getWorkplace(user, true), deleted: false };
  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    matchStage["name"] = regex;
  }

  const templates = await TemplateModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        name: 1,
        content: 1,
        of: 1,
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
        screens: {
          $map: {
            input: "$screens",
            as: "screen",
            in: {
              _id: {
                $convert: { input: "$$screen._id", to: "string" },
              },
              name: "$$screen.name",
            },
          },
        },
        locked: 1,
      },
    },
  ]);

  const { isOwner } = getBooleanRoles(user);
  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full overflow-scroll no-scrollbar rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">Plantillas de Whatsapp</CardTitle>
            <TutorialBadge
              title="Configurá tus plantillas"
              url="https://youtu.be/jeTi2tjepx8"
              titleFont="font-light"
              custom_id={9}
              tiny
            />
            <TutorialBadge
              title="Mensajes en menos de 1 segundo 🤯⚡️"
              url="https://youtu.be/xe1Q-0HPYKg"
              titleFont="font-light"
              custom_id={11}
              tiny
            />
          </div>

          <div className="flex gap-2 sm:gap-3 items-center">
            <ConnectWhatsappDialog companyId={user.company._id} user={user} />

            <MyFormDialog
              form="template"
              editableId="template-content"
              invalidateQueries
              hidden={!isOwner}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TemplatesTable templates={templates} />
      </CardContent>
    </Card>
  );
}
