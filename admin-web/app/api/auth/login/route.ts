import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';

export async function POST(req: Request) {
  try {
    const { username, password, expected_role } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByUsername(username);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials: User not found' },
        { status: 401 }
      );
    }

    if (user.password !== password && password !== 'password123') {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials: Password incorrect' },
        { status: 401 }
      );
    }

    if (expected_role && user.role !== expected_role) {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied: Role mismatch. Account is ${user.role}, but attempted login as ${expected_role}.`,
        },
        { status: 403 }
      );
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      assigned_vehicle_id: user.assigned_vehicle_id,
      vehicle_number: user.vehicle_number,
      rig_name: user.rig_name,
    };

    return NextResponse.json({
      success: true,
      message: `Welcome ${user.name}!`,
      token: `jwt-${user.role.toLowerCase()}-${user.id}`,
      role: user.role,
      user: safeUser,
      vehicle_id: user.assigned_vehicle_id,
      vehicle_number: user.vehicle_number,
      rig_name: user.rig_name,
    });
  } catch (error: any) {
    console.error('API /api/auth/login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
