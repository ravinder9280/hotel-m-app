import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface ShiftInput {
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const department = searchParams.get('department')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      date: new Date(date)
    }

    if (department && department !== 'all') {
      whereClause.staff = {
        department: department
      }
    }

    const shifts = await prisma.shift.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    })

    return NextResponse.json(shifts)
  } catch (error) {
    console.error('Error fetching shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { staffId, date, startTime, endTime } = body as ShiftInput

    if (!staffId || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get staff department
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: { department: true }
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      )
    }

    const shift = await prisma.shift.create({
      data: {
        staffId,
        date: new Date(date),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        department: staff.department
      },
      include: {
        staff: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('Error creating shift:', error)
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
} 