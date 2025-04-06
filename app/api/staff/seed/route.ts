import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Check if staff already exist
    const existingStaff = await prisma.staff.findFirst();
    if (existingStaff) {
      return NextResponse.json({ message: "Staff already seeded" }, { status: 200 });
    }

    // Create sample departments
    const emergency = await prisma.department.create({
      data: {
        name: "Emergency",
        description: "Emergency department for urgent care",
      },
    });

    const surgery = await prisma.department.create({
      data: {
        name: "Surgery",
        description: "Surgical department for operations",
      },
    });

    const pediatrics = await prisma.department.create({
      data: {
        name: "Pediatrics",
        description: "Pediatric care department",
      },
    });

    // Create sample staff members
    const staffMembers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        department: emergency.name,
        position: "Doctor",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        phone: "123-456-7891",
        department: surgery.name,
        position: "Surgeon",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@example.com",
        phone: "123-456-7892",
        department: pediatrics.name,
        position: "Pediatrician",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        phone: "123-456-7893",
        department: emergency.name,
        position: "Nurse",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@example.com",
        phone: "123-456-7894",
        department: surgery.name,
        position: "Anesthesiologist",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        phone: "123-456-7895",
        department: pediatrics.name,
        position: "Nurse",
        joinDate: new Date(),
        status: "Active",
      },
    ];

    for (const staff of staffMembers) {
      await prisma.staff.create({
        data: staff,
      });
    }

    return NextResponse.json({ message: "Staff seeded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error seeding staff:", error);
    return NextResponse.json({ error: "Failed to seed staff" }, { status: 500 });
  }
} 