import { MyFormDialog } from "@/components/custom-ui/MyFormDialog";
import TutorialBadge from "@/components/custom-ui/TutorialBadge";
import WalletsTable from "@/components/entities/wallets/WalletsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CONFIG } from "@/config/constanst";
import { verifySession } from "@/helpers/auth";
import { getWorkplace } from "@/helpers/mdb";
import { cleanRegExp } from "@/helpers/text";
import connectDB from "@/lib/connectDB";
import WalletModel from "@/schemas/wallet";

export default async function Wallets({ searchParams }) {
  const { search } = await searchParams;
  await connectDB();
  const user = await verifySession();

  const pipeline: any = [
    {
      $match: {
        ...getWorkplace(user, true),
        deleted: false,
      },
    },
    {
      $project: {
        _id: { $convert: { input: "$_id", to: "string" } },
        name: 1,
        institution: 1,
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
        currency: 1,
        balance: 1,
        logo_url: "$institution.logo_url",
      },
    },
  ];

  if (!!search) {
    let regex;
    try {
      regex = cleanRegExp(search);
    } catch (error) {
      regex = search;
    }
    pipeline.unshift({ $match: { name: regex } });
  } else {
    pipeline.push({ $limit: 10 });
  }
  const wallets = await WalletModel.aggregate(pipeline);

  return (
    <Card
      x-chunk="dashboard-06-chunk-0"
      className="outline-none max-h-full rounded-none sm:rounded-xl m-0 mt-0 h-full sm:h-auto border-0 overflow-auto"
    >
      <CardHeader className={wallets.length === 1 ? "pb-8" : "pb-4"}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Billeteras</CardTitle>
          </div>
          <MyFormDialog form="wallet" />
        </div>
      </CardHeader>
      <CardContent>
        <WalletsTable
          wallets={wallets.map((w) => {
            if (w.name === "Efectivo") {
              return { ...w, logo_url: `${CONFIG.blob_url}/billetes.png` };
            } else {
              return w;
            }
          })}
        />
      </CardContent>
    </Card>
  );
}
