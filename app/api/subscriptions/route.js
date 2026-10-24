import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchSubscriptions } from "@/lib/pg-search";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get("sort") || "messages"; // relevance | messages | newest | oldest | az
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  const limit = limitParam ? Math.min(200, Math.max(1, parseInt(limitParam, 10))) : 50;

  const result = await searchSubscriptions({
    userId: user.userId,
    search,
    status,
    sort,
    page,
    limit,
  });

  return NextResponse.json(result);
}
