import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Configure the API route
export const runtime = 'nodejs' // Specify Node.js runtime
export const dynamic = 'force-dynamic' // Always dynamic
export const revalidate = 0 // No cache

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          orderBy: { dateTime: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json(patients)
  } catch (error) {
    console.error('Failed to fetch patients:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const patient = await prisma.patient.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        email: body.email,
        phone: body.phone,
        address: body.address,
        status: 'Active',
      },
    })

    return NextResponse.json(patient)
  } catch (error) {
    console.error('Failed to create patient:', error)
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    )
  }
}