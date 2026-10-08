import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, role, licenseId, password } = await req.json();

    if (!email || !fullName || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Full Name, Email, Role, and Password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      email,
      fullName,
      role,
      licenseId,
      password,
    });

    const safeUser = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      licenseId: newUser.licenseId,
      status: newUser.status,
    };

    const response = NextResponse.json({
      success: true,
      message: "Account successfully registered.",
      user: safeUser,
    });

    response.cookies.set("smart_triage_session", JSON.stringify({ userId: newUser.id, role: newUser.role }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}