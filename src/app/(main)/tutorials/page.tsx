import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import TutorialsAccordion from "@/components/entities/tutorials/TutorialsAccordion";
import TutorialsTable from "@/components/entities/tutorials/TutorialsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifySession } from "@/helpers/auth";
import { cleanRegExp, cleanText } from "@/helpers/text";
import connectDB from "@/lib/connectDB";

import TutorialModel from "@/schemas/tutorial";

export default async function Members({ searchParams }) {
  await connectDB();
  const user = await verifySession();

  const { search } = await searchParams;

  const matchStage = { roles: user?.role };
  if (!!search) {
    const regex = cleanRegExp(search);
    matchStage["title"] = regex;
  }

  const tutorials = await TutorialModel.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        _id: { $toString: "$_id" },
        url: 1,
        step: 1,
        order: 1,
        kind: 1,
        title: 1,
        roles: 1,
        custom_id: 1,
        duration: 1,
      },
    },
    { $sort: { step: 1 } },
  ]);

  if (user?.role !== "Socio") {
    return (
      <Card
        x-chunk="dashboard-06-chunk-0"
        className="outline-none max-h-full overflow-scroll no-scrollbar rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0"
      >
        <CardHeader className="pb-4">
          <div className="flex gap-4 items-center">
            <CardTitle className="text-xl">Tutoriales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <TutorialsTable tutorials={tutorials} />
        </CardContent>
      </Card>
    );
  } else {
    return (
      <Card
        x-chunk="dashboard-06-chunk-0"
        className="outline-none max-h-full overflow-scroll no-scrollbar rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0"
      >
        <CardHeader className="pb-4">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col">
              <CardTitle className="text-xl">Tutoriales para empezar</CardTitle>
              <span className="font-light text-sm text-muted-foreground">
                Miralos en orden, te van a ayudar <u>mucho</u>
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t) => t.kind === "intro")
                .sort((a, b) => a.order - b.order)}
              title="¿Cuánto te puede ayudar Aquapp? 🤔"
            />
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t) => t.kind === "config")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Aprende a <u>CONFIGURARLA</u> ⚙️
                </span>
              }
              open
            />
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t) => t.kind === "learn")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Aprende a <u>UTILIZARLA</u> 🧠
                </span>
              }
            />
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t) => t.kind === "delegate")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Aprende a <u>DELEGARLA</u> 💆🏻‍♂️
                </span>
              }
            />
            <CardTitle className="text-xl mt-6 mb-2 ml-1">
              Más funcionalidades 🔥
            </CardTitle>
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t, idx) => t.kind === "cashflows")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Controlá los <u>FLUJOS DE DINERO</u> 💰
                </span>
              }
            />
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t, idx) => t.kind === "wsp")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Comunicación <u>PROFESIONAL</u> y <u>ÁGIL</u> 🤖⚡️
                </span>
              }
            />
            <TutorialsAccordion
              tutorials={tutorials
                .filter((t, idx) => t.kind === "sales")
                .sort((a, b) => a.order - b.order)}
              title={
                <span>
                  Autmentá las <u>VENTAS</u> 💸{" "}
                </span>
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  }
}
