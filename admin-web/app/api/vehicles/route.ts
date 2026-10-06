import { NextResponse } from 'next/server';
import { VehicleModel } from '../../../models/Vehicle';

export async function GET() {
  try {
    const list = await VehicleModel.getAllWithStats();
    return NextResponse.json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error: any) {
    console.error('API /api/vehicles error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching fleet vehicles' },
      { status: 500 }
    );
  }
}
