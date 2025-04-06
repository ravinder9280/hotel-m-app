import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const admissions = await prisma.admission.findMany({
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
            roomNumber: { contains: search, mode: 'insensitive' },
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
        admissionDate: 'desc',
      },
    });

    const formattedAdmissions = admissions.map(admission => ({
      id: admission.id,
      patientId: admission.patientId,
      patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
      roomNumber: admission.roomNumber,
      admissionDate: admission.admissionDate,
      dischargeDate: admission.dischargeDate,
      status: admission.dischargeDate ? 'Discharged' : 'Active',
      notes: admission.notes,
    }));

    return NextResponse.json(formattedAdmissions);
  } catch (error) {
    console.error('Error fetching admissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, roomNumber, notes } = body;

    const admission = await prisma.admission.create({
      data: {
        patientId,
        roomNumber,
        notes,
        admissionDate: new Date(),
        status: 'Active',
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
      status: 'Active',
      notes: admission.notes,
    };

    return NextResponse.json(formattedAdmission);
  } catch (error) {
    console.error('Error creating admission:', error);
    return NextResponse.json(
      { error: 'Failed to create admission' },
      { status: 500 }
    );
  }
} 