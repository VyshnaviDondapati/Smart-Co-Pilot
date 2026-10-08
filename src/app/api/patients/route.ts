import { NextRequest, NextResponse } from "next/server";
import { getAllPatients, savePatient, updatePatientStatus, PatientRecord } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const priority = searchParams.get("priority") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    let patients = await getAllPatients();

    if (priority && priority !== "ALL") {
      patients = patients.filter((p) => p.triagePriority === priority);
    }
    if (status) {
      patients = patients.filter((p) => p.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          (p.urgencyReason || "").toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      total: patients.length,
      patients,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Partial<PatientRecord> = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Patient name is required." },
        { status: 400 }
      );
    }

    const saved = await savePatient(body as any);
    return NextResponse.json({
      success: true,
      message: "Patient intake successfully persisted to triage queue.",
      patient: saved,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Both patient id and status are required." },
        { status: 400 }
      );
    }

    const ok = await updatePatientStatus(id, status, notes);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Patient not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Patient status updated successfully.",
      patient: ok,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}