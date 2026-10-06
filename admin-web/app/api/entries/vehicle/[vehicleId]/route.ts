import { NextResponse } from 'next/server';
import { DailyEntryModel } from '../../../../../models/DailyEntry';

export async function GET(
  req: Request,
  { params }: { params: { vehicleId: string } }
) {
  try {
    const vId = parseInt(params.vehicleId, 10);
    const data = await DailyEntryModel.getByVehicle(vId);

    const summary = data.reduce(
      (acc, curr) => {
        acc.totalDepth += Number(curr.depth) || 0;
        acc.totalDiesel += Number(curr.diesel?.liters) || 0;
        acc.totalRevenue += Number(curr.grossBoreCost) || 0;
        return acc;
      },
      { totalReports: data.length, totalDepth: 0, totalDiesel: 0, totalRevenue: 0 }
    );

    summary.totalDepth = parseFloat(summary.totalDepth.toFixed(2));
    summary.totalDiesel = parseFloat(summary.totalDiesel.toFixed(2));
    summary.totalRevenue = parseFloat(summary.totalRevenue.toFixed(2));

    return NextResponse.json({
      success: true,
      count: data.length,
      summary,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching vehicle entries' },
      { status: 500 }
    );
  }
}
