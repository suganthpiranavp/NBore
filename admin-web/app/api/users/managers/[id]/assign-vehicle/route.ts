import { NextResponse } from 'next/server';
import { UserModel } from '../../../../../../models/User';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { vehicle_id } = await req.json();
    const updated = await UserModel.assignVehicle(params.id, vehicle_id);
    return NextResponse.json({
      success: true,
      message: 'Vehicle assignment updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating vehicle assignment' },
      { status: 400 }
    );
  }
}
