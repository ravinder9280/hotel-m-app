import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');

    const claims = await prisma.insuranceClaim.findMany({
      where: {
        OR: [
          { policyNumber: { contains: search, mode: 'insensitive' } },
          { provider: { contains: search, mode: 'insensitive' } },
          { patient: { 
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } }
            ]
          }},
        ],
        ...(status ? { status } : {}),
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
        submissionDate: 'desc',
      },
    });

    const formattedClaims = claims.map(claim => ({
      id: claim.id,
      patientId: claim.patientId,
      patientName: `${claim.patient.firstName} ${claim.patient.lastName}`,
      claimNumber: claim.policyNumber,
      insuranceProvider: claim.provider,
      amount: claim.claimAmount,
      status: claim.status,
      submittedDate: claim.submissionDate.toISOString(),
      processedDate: claim.responseDate?.toISOString(),
      notes: claim.notes,
    }));

    return NextResponse.json(formattedClaims);
  } catch (error) {
    console.error('Error fetching insurance claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insurance claims' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, insuranceProvider, claimNumber, amount, notes } = body;

    const claim = await prisma.insuranceClaim.create({
      data: {
        patientId,
        provider: insuranceProvider,
        policyNumber: claimNumber,
        claimAmount: amount,
        status: 'Pending',
        submissionDate: new Date(),
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

    const formattedClaim = {
      id: claim.id,
      patientId: claim.patientId,
      patientName: `${claim.patient.firstName} ${claim.patient.lastName}`,
      claimNumber: claim.policyNumber,
      insuranceProvider: claim.provider,
      amount: claim.claimAmount,
      status: claim.status,
      submittedDate: claim.submissionDate.toISOString(),
      processedDate: claim.responseDate?.toISOString(),
      notes: claim.notes
    };

    return NextResponse.json(formattedClaim);
  } catch (error) {
    console.error('Error creating insurance claim:', error);
    return NextResponse.json(
      { error: 'Failed to create insurance claim' },
      { status: 500 }
    );
  }
}