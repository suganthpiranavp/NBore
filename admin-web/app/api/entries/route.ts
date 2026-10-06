import { NextRequest, NextResponse } from 'next/server';
import { DailyEntryModel } from '../../../models/DailyEntry';
import { dailyEntrySchema } from '../../../lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');

    let entries;
    if (vehicleId) {
      entries = await DailyEntryModel.getByVehicle(vehicleId);
    } else {
      entries = await DailyEntryModel.getAll();
    }

    return NextResponse.json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (err: any) {
    console.error('API /api/entries GET error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Error fetching entries' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Validate 22 comprehensive fields using Zod
    const validated = dailyEntrySchema.parse(rawBody);

    const saved = await DailyEntryModel.create(validated);

    return NextResponse.json(
      {
        success: true,
        message: 'Daily drilling entry created successfully',
        data: saved,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('API /api/entries POST error:', err);

    if (err.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed on drilling entry fields',
          errors: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || 'Error saving drilling entry' },
      { status: 500 }
    );
  }
}
