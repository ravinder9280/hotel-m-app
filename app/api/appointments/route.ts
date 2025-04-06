import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const appointments = await prisma.appointment.findMany({
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
            type: { contains: search, mode: 'insensitive' },
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
        dateTime: 'desc',
      },
    });

    const formattedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      dateTime: appointment.dateTime,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
    }));

    return NextResponse.json(formattedAppointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, dateTime, type, notes } = body;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        dateTime: new Date(dateTime),
        status: 'Scheduled',
        type,
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

    const formattedAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
      dateTime: appointment.dateTime,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes,
    };

    return NextResponse.json(formattedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 