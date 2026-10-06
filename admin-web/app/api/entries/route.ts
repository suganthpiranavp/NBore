import { NextResponse } from 'next/server';
import { DailyEntryModel } from '../../../models/DailyEntry';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicle_id = searchParams.get('vehicle_id') || undefined;
    const date = searchParams.get('date') || undefined;
    const search = searchParams.get('search') || undefined;

    const data = await DailyEntryModel.getAll({ vehicle_id, date, search });

    const summary = data.reduce(
      (acc, curr) => {
        acc.totalDepth += Number(curr.depth) || 0;
        acc.totalDiesel += Number(curr.diesel_liters) || 0;
        acc.totalRpmHours += Number(curr.rpm_total) || 0;
        return acc;
      },
      { totalReports: data.length, totalDepth: 0, totalDiesel: 0, totalRpmHours: 0 }
    );

    summary.totalDepth = parseFloat(summary.totalDepth.toFixed(2));
    summary.totalDiesel = parseFloat(summary.totalDiesel.toFixed(2));
    summary.totalRpmHours = parseFloat(summary.totalRpmHours.toFixed(2));

    return NextResponse.json({
      success: true,
      count: data.length,
      summary,
      data,
    });
  } catch (error: any) {
    console.error('API /api/entries GET error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching drilling entries' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    if (!payload.vehicle_id) {
      return NextResponse.json(
        { success: false, message: 'Assigned vehicle_id is required' },
        { status: 400 }
      );
    }
    if (!payload.party_name) {
      return NextResponse.json(
        { success: false, message: 'Party Name is required' },
        { status: 400 }
      );
    }
    if (!payload.village) {
      return NextResponse.json(
        { success: false, message: 'Village is required' },
        { status: 400 }
      );
    }
    if (parseFloat(payload.rpm_end) <= parseFloat(payload.rpm_start)) {
      return NextResponse.json(
        {
          success: false,
          message: `RPM End (${payload.rpm_end}) must be greater than RPM Start (${payload.rpm_start})`,
        },
        { status: 400 }
      );
    }

    const created = await DailyEntryModel.create(payload);
    return NextResponse.json({
      success: true,
      message: 'Daily drilling sheet successfully recorded!',
      data: created,
    }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/entries POST error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating daily entry' },
      { status: 500 }
    );
  }
}
