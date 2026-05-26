import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTask } from "@/lib/verification/engine";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;

  try {
    const result = await verifyTask(taskId, session.user.id);
    return NextResponse.json({ ...result, taskId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json(
      { verified: false, message, taskId },
      { status: 500 }
    );
  }
}
