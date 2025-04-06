import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bill = await prisma.bill.findUnique({
      where: {
        id: params.id,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
          },
        },
      },
    });

    if (!bill) {
      return NextResponse.json(
        { error: 'Bill not found' },
        { status: 404 }
      );
    }

    const formattedBill = {
      id: bill.id,
      patientId: bill.patientId,
      patientName: `${bill.patient.firstName} ${bill.patient.lastName}`,
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString(),
      status: bill.status,
      notes: bill.notes,
      createdAt: bill.createdAt.toISOString(),
      payments: bill.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        notes: payment.notes,
      })),
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error('Error fetching bill details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    const bill = await prisma.bill.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payments: {
          orderBy: {
            paymentDate: 'desc',
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
      notes: bill.notes,
      createdAt: bill.createdAt.toISOString(),
      payments: bill.payments.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toISOString(),
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        notes: payment.notes,
      })),
    };

    return NextResponse.json(formattedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
} 