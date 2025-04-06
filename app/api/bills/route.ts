import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const bills = await prisma.bill.findMany({
      where: {
        OR: [
          {
            patient: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
          {
            status: { contains: search, mode: 'insensitive' },
          },
        ],
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedBills = bills.map(bill => ({
      id: bill.id,
      patientId: bill.patientId,
      patientName: `${bill.patient.firstName} ${bill.patient.lastName}`,
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString(),
      status: bill.status,
      createdAt: bill.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, amount, dueDate, notes } = body;

    const bill = await prisma.bill.create({
      data: {
        patientId,
        amount,
        dueDate: new Date(dueDate),
        status: 'Pending',
        notes,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const formattedBill = {
      id: bill.id,
      patientId: bill.patientId,
      patientName: `${bill.patient.firstName} ${bill.patient.lastName}`,
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString(),
      status: bill.status,
      createdAt: bill.createdAt.toISOString(),
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
} 