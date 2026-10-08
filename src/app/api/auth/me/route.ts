import { NextRequest, NextResponse } from "next/server";
import { findUserById, getAllUsers } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get("smart_triage_session")?.value;
    if (!cookie) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const parsed = JSON.parse(cookie);
    const user = await findUserById(parsed.userId);

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        licenseId: user.licenseId,
        status: user.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}