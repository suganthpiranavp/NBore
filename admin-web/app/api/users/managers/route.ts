import { NextResponse } from 'next/server';
import { UserModel } from '../../../../models/User';

export async function GET() {
  try {
    const list = await UserModel.getAllManagers();
    return NextResponse.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching managers' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.username) {
      return NextResponse.json(
        { success: false, message: 'Manager name and username are required' },
        { status: 400 }
      );
    }

    const created = await UserModel.createManager(body);
    return NextResponse.json(
      {
        success: true,
        message: `Manager ${created.name} successfully created!`,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed creating manager' },
      { status: 400 }
    );
  }
}
