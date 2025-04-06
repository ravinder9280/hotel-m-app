import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface StaffMember {
  department: string;
}

export async function GET() {
  try {
    // Get all staff members
    const staffMembers = await prisma.staff.findMany({
      select: {
        department: true,
      },
    });

    // Convert to array and filter unique departments
    const departments = Array.from(new Set(staffMembers.map((staff: StaffMember) => staff.department)));
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Since we don't have a Department model, we'll just return success
    // The department will be created when staff members are assigned to it
    return NextResponse.json({
      id: body.name,
      name: body.name,
      description: body.description,
      staffCount: 0,
    });
  } catch (error) {
    console.error('Failed to create department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
} 