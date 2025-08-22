import { API_ROUTER } from "@/actions";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const entity = form.get("entity") as any;
  const action = form.get("action") as any;
  const data = form.get("data") as any;

  const result = await API_ROUTER(
    { data: JSON.parse(data), form },
    entity,
    action
  );
  revalidatePath("/washes", "page");
  return NextResponse.json(result);
}
