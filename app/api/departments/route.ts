import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    // Get all staff members
    const staffMembers = await prisma.staff.findMany({
      select: {
        department: true,
      },
    });

    // Extract unique departments
    const uniqueDepartments = [...new Set(staffMembers.map(staff => staff.department))];
    
    // Count staff in each department
    const departmentsWithCount = uniqueDepartments.map(dept => {
      const staffCount = staffMembers.filter(staff => staff.department === dept).length;
      return {
        id: dept, // Use department name as ID since we don't have a separate table
        name: dept,
        description: `${dept} department`,
        staffCount,
      };
    });

    return NextResponse.json(departmentsWithCount);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
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