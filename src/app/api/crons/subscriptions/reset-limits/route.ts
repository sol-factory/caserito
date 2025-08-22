import connectDB from "@/lib/connectDB";
import { SubscriptionModel } from "@/schemas/subscription";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Hora "ahora" (03:00Z) coincide con 00:00 Argentina por el cron.
    const now = new Date();

    // Reset global: ponemos start_date = now y count = 0 en todos los límites.
    // Si tu esquema difiere, ajustá los paths.
    const update: Record<string, any> = {
      "quotes.limit.start_date": now,
      "quotes.limit.count": 0,

      "files.limit.start_date": now,
      "files.limit.count": 0,

      "messages.limits.minute.start_date": now,
      "messages.limits.minute.count": 0,

      "messages.limits.hour.start_date": now,
      "messages.limits.hour.count": 0,

      "messages.limits.day.start_date": now,
      "messages.limits.day.count": 0,

      "messages.limits.month.start_date": now,
      "messages.limits.month.count": 0,
    };

    const res = await SubscriptionModel.updateMany(
      { status: { $in: ["authorized", "ACTIVE", "paused"] } },
      { $set: update },
      { timestamps: false }
    );
    console.log("Cron reset-subscription-limits result:", res);

    return new Response(
      JSON.stringify({
        ok: true,
        matched: res.matchedCount ?? 0, // según driver
        modified: (res as any).modifiedCount ?? (res as any).nModified,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Cron reset-subscription-limits error:", err);
    return new Response(`Error: ${err?.message || "unknown"}`, { status: 500 });
  }
}
