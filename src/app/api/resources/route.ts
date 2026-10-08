import { NextRequest, NextResponse } from "next/server";
import { getResources, updateResources, allocateIcuBed } from "@/lib/db";

export async function GET() {
  try {
    const resources = await getResources();
    return NextResponse.json({
      success: true,
      resources,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { icuBedChange, updates } = body;

    let updated;
    if (typeof icuBedChange === "number") {
      updated = await allocateIcuBed(icuBedChange);
    } else if (updates) {
      updated = await updateResources(updates);
    } else {
      return NextResponse.json({ success: false, error: "No update parameters specified." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      resources: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}