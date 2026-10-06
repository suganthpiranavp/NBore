import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';

/**
 * NextAuth & Unified Credential API Handler (/api/auth/[...nextauth]/route.ts)
 * Authenticates Admins (6 accounts) and Managers (4 accounts) with vehicle isolation.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await UserModel.findByUsername(username);

    if (!user || user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or credentials' },
        { status: 401 }
      );
    }

    const token = `nbw_jwt_${user.id}_${Date.now()}`;

    // Return authenticated user payload with vehicle lock info
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        assigned_vehicle_id: user.assigned_vehicle_id,
        vehicle_number: user.vehicle_number,
        rig_name: user.rig_name,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error('Auth handler error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  // Session check handler
  return NextResponse.json({
    status: 'active',
    portal: 'Nithya Borewells Fleet & Drilling Management',
  });
}
