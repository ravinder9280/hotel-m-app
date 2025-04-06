import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const department = searchParams.get('department')

    const shifts = await prisma.shift.findMany({
      where: {
        date: date ? new Date(date) : undefined,
        staff: {
          department: department && department !== 'all' ? department : undefined,
        },
      },
      include: {
        staff: true,
      },
      orderBy: { date: 'desc' },
    })

    // Add department to each shift for frontend use
    const shiftsWithDepartment = shifts.map(shift => ({
      ...shift,
      department: shift.staff.department,
    }))

    return NextResponse.json(shiftsWithDepartment)
  } catch (error) {
    console.error('Failed to fetch shifts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shifts' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const staff = await prisma.staff.findUnique({
      where: { id: body.staffId },
      select: { department: true },
    })

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      )
    }

    // Validate that end time is after start time
    const startTime = new Date(body.startTime)
    const endTime = new Date(body.endTime)
    
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    const shift = await prisma.shift.create({
      data: {
        staffId: body.staffId,
        date: new Date(body.date),
        startTime: startTime,
        endTime: endTime,
      },
      include: {
        staff: true,
      },
    })

    // Add department to the response for frontend use
    const responseShift = {
      ...shift,
      department: staff.department,
    }

    return NextResponse.json(responseShift)
  } catch (error) {
    console.error('Failed to create shift:', error)
    return NextResponse.json(
      { error: 'Failed to create shift' },
      { status: 500 }
    )
  }
} 