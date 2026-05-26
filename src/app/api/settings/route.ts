import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getWorkspacesForEmail } from "@/lib/langdock-db";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const refresh = request.nextUrl.searchParams.get("refresh");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { workspaceId: true },
  });

  // Fetch all available workspaces from Langdock DB
  const allWorkspaces = await getWorkspacesForEmail(session.user.email);

  // Auto-set workspace if not set yet (or on refresh)
  if ((!user?.workspaceId || refresh) && allWorkspaces.length > 0) {
    const targetId = user?.workspaceId || allWorkspaces[0].id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { workspaceId: targetId },
    });
  }

  const currentWorkspace = allWorkspaces.find(
    (w) => w.id === (user?.workspaceId ?? allWorkspaces[0]?.id)
  );

  return NextResponse.json({
    workspace: currentWorkspace ?? null,
    allWorkspaces,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workspaceId } = await request.json();

  await prisma.user.update({
    where: { id: session.user.id },
    data: { workspaceId },
  });

  return NextResponse.json({ ok: true });
}
