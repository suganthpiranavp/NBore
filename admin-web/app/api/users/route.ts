import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '../../../models/User';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');

    if (role === 'MANAGER') {
      const managers = await UserModel.getAllManagers();
      return NextResponse.json({ success: true, count: managers.length, data: managers });
    }

    const users = await UserModel.getAllUsers();
    return NextResponse.json({ success: true, count: users.length, data: users });
  } catch (err: any) {
    console.error('API /api/users GET error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, name, phone, email, assigned_vehicle_id } = body;

    if (!username || !name || !phone || !email) {
      return NextResponse.json(
        { success: false, message: 'username, name, phone, and email are required' },
        { status: 400 }
      );
    }

    const created = await UserModel.createManager({
      username,
      name,
      phone,
      email,
      assigned_vehicle_id,
    });

    return NextResponse.json(
      { success: true, message: 'Manager created successfully', data: created },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API /api/users POST error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error creating user' },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { managerId, vehicleId } = body;

    if (!managerId) {
      return NextResponse.json(
        { success: false, message: 'managerId is required' },
        { status: 400 }
      );
    }

    const updated = await UserModel.assignVehicle(managerId, vehicleId);
    return NextResponse.json({
      success: true,
      message: 'Vehicle assigned successfully',
      data: updated,
    });
  } catch (err: any) {
    console.error('API /api/users PUT error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error assigning vehicle' },
      { status: 500 }
    );
  }
}
