import { NextRequest, NextResponse } from "next/server";
import { getPatientById, deletePatient } from "@/lib/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const patient = await getPatientById(id);
    if (!patient) {
      return NextResponse.json({ success: false, error: "Patient not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ok = await deletePatient(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Patient not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Patient removed." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}