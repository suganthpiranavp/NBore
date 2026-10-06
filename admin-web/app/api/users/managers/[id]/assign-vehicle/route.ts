import { NextResponse } from 'next/server';
import { UserModel } from '../../../../../../models/User';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const vehicleId = body.vehicleId !== undefined ? body.vehicleId : body.vehicle_id;
    const updated = await UserModel.assignVehicle(params.id, vehicleId);
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
