import { NextRequest, NextResponse } from "next/server";
import { getAllStaffMessages, saveStaffMessage } from "@/lib/db";

export async function GET() {
  try {
    const messages = await getAllStaffMessages();
    return NextResponse.json({
      success: true,
      total: messages.length,
      messages,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sender, role, text } = await req.json();

    if (!sender || !text) {
      return NextResponse.json(
        { success: false, error: "Sender and text are required." },
        { status: 400 }
      );
    }

    const saved = await saveStaffMessage({
      sender,
      role: role || "doctor",
      text,
    });

    return NextResponse.json({
      success: true,
      message: saved,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}