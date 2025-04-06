import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const admission = await prisma.admission.update({
      where: { id },
      data: {
        dischargeDate: new Date(),
        status: 'Discharged',
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

    const formattedAdmission = {
      id: admission.id,
      patientId: admission.patientId,
      patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
      roomNumber: admission.roomNumber,
      admissionDate: admission.admissionDate,
      dischargeDate: admission.dischargeDate,
      status: 'Discharged',
      notes: admission.notes,
    };

    return NextResponse.json(formattedAdmission);
  } catch (error) {
    console.error('Error discharging patient:', error);
    return NextResponse.json(
      { error: 'Failed to discharge patient' },
      { status: 500 }
    );
  }
} 