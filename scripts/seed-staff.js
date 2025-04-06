// This script seeds the database with sample staff members
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to seed staff data...');

    // Check if staff already exist
    const existingStaff = await prisma.staff.findFirst();
    if (existingStaff) {
      console.log('Staff already seeded');
      return;
    }

    // Create sample staff members
    console.log('Creating staff members...');
    const staffMembers = [
      {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "Doctor",
        department: "Emergency",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
        role: "Surgeon",
        department: "Surgery",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Michael",
        lastName: "Johnson",
        email: "michael.johnson@example.com",
        role: "Pediatrician",
        department: "Pediatrics",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Sarah",
        lastName: "Williams",
        email: "sarah.williams@example.com",
        role: "Nurse",
        department: "Emergency",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "David",
        lastName: "Brown",
        email: "david.brown@example.com",
        role: "Anesthesiologist",
        department: "Surgery",
        joinDate: new Date(),
        status: "Active",
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        role: "Nurse",
        department: "Pediatrics",
        joinDate: new Date(),
        status: "Active",
      },
    ];

    for (const staff of staffMembers) {
      await prisma.staff.create({
        data: staff,
      });
    }

    console.log('Staff members created successfully');
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding staff:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 