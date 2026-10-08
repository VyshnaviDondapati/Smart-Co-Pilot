import { NextRequest, NextResponse } from "next/server";
import { validateUserCredentials, findUserByEmail, UserRecord } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await validateUserCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // Role check warning / auto-alignment
    if (role && user.role !== role && user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: `Account registered as ${user.role.toUpperCase()}. Please select the ${user.role.toUpperCase()} tab to sign in.`,
        },
        { status: 403 }
      );
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      licenseId: user.licenseId,
      status: user.status,
    };

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: safeUser,
    });

    // Set secure auth session cookie
    response.cookies.set("smart_triage_session", JSON.stringify({ userId: user.id, role: user.role }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}