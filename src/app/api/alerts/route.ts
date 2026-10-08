import { NextRequest, NextResponse } from "next/server";
import { getAllAlerts, createEmergencyAlert } from "@/lib/db";

export async function GET() {
  try {
    const alerts = await getAllAlerts();
    return NextResponse.json({
      success: true,
      total: alerts.length,
      alerts,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { patientName, category, notes } = await req.json();

    const nameToUse = patientName?.trim() || "Emergency Code Red Patient";
    const catToUse = category || "Accident / Severe Trauma";

    const { alert, patient } = await createEmergencyAlert(nameToUse, catToUse, notes);

    return NextResponse.json({
      success: true,
      message: "Emergency Code Red successfully triggered and dispatched.",
      alert,
      patient,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}