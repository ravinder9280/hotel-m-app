import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Check if staff already exist
    const existingStaff = await prisma.staff.findFirst();
    if (existingStaff) {
      return NextResponse.json({ message: "Staff already seeded" }, { status: 200 });
    }

    // Create departments
    const emergency = await prisma.staff.create({
      data: {
        firstName: 'Emergency',
        lastName: 'Department',
        email: 'emergency@hospital.com',
        department: 'Emergency',
        role: 'Department',
        joinDate: new Date(),
        status: 'active'
      }
    });

    const surgery = await prisma.staff.create({
      data: {
        firstName: 'Surgery',
        lastName: 'Department',
        email: 'surgery@hospital.com',
        department: 'Surgery',
        role: 'Department',
        joinDate: new Date(),
        status: 'active'
      }
    });

    const pediatrics = await prisma.staff.create({
      data: {
        firstName: 'Pediatrics',
        lastName: 'Department',
        email: 'pediatrics@hospital.com',
        department: 'Pediatrics',
        role: 'Department',
        joinDate: new Date(),
        status: 'active'
      }
    });

    // Create sample staff members
    const staff = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hospital.com',
        department: 'Emergency',
        role: 'Doctor',
        joinDate: new Date(),
        status: 'active'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@hospital.com',
        department: 'Surgery',
        role: 'Nurse',
        joinDate: new Date(),
        status: 'active'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@hospital.com',
        department: 'Pediatrics',
        role: 'Doctor',
        joinDate: new Date(),
        status: 'active'
      }
    ];

    for (const staffMember of staff) {
      await prisma.staff.create({
        data: staffMember
      });
    }

    return NextResponse.json({ message: 'Staff seeded successfully' });
  } catch (error) {
    console.error('Error seeding staff:', error);
    return NextResponse.json(
      { error: 'Failed to seed staff' },
      { status: 500 }
    );
  }
} 