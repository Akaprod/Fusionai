import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/session-debug — shows what's in the current session (for debugging admin button)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      message: "No session. Please sign in first.",
    });
  }

  // Show session structure (without sensitive data)
  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.user?.email,
      name: session.user?.name,
      image: session.user?.image,
      // Show all custom fields
      id: (session.user as { id?: string }).id,
      credits: (session.user as { credits?: number }).credits,
      plan: (session.user as { plan?: string }).plan,
      role: (session.user as { role?: string }).role,
    },
    expires: session.expires,
    hint:
      (session.user as { role?: string }).role === "admin"
        ? "You are admin! The admin button should appear in the header."
        : "Your session does NOT contain role=admin. The session callback may not be deployed yet, or you need to re-login.",
  });
}
