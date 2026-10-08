import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, updateUserPassword } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "No registered account found with this email." },
        { status: 404 }
      );
    }

    const updated = await updateUserPassword(email, newPassword);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now sign in with your new password.",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
