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
        role: 'ADMIN',
        joinDate: new Date(),
        status: 'ACTIVE'
      }
    });

    const surgery = await prisma.staff.create({
      data: {
        firstName: 'Surgery',
        lastName: 'Department',
        email: 'surgery@hospital.com',
        department: 'Surgery',
        role: 'ADMIN',
        joinDate: new Date(),
        status: 'ACTIVE'
      }
    });

    const pediatrics = await prisma.staff.create({
      data: {
        firstName: 'Pediatrics',
        lastName: 'Department',
        email: 'pediatrics@hospital.com',
        department: 'Pediatrics',
        role: 'ADMIN',
        joinDate: new Date(),
        status: 'ACTIVE'
      }
    });

    // Create staff members
    const staffMembers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hospital.com',
        department: 'Emergency',
        role: 'DOCTOR',
        joinDate: new Date(),
        status: 'ACTIVE'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@hospital.com',
        department: 'Surgery',
        role: 'NURSE',
        joinDate: new Date(),
        status: 'ACTIVE'
      },
      {
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@hospital.com',
        department: 'Pediatrics',
        role: 'DOCTOR',
        joinDate: new Date(),
        status: 'ACTIVE'
      }
    ];

    for (const staff of staffMembers) {
      await prisma.staff.create({
        data: staff
      });
    }

    return NextResponse.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
} 