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
    const search = searchParams.get('search') || ''

    const attendance = await prisma.attendance.findMany({
      where: {
        date: date ? new Date(date) : undefined,
        staff: {
          department: department && department !== 'all' ? department : undefined,
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        staff: true,
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Failed to fetch attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const attendance = await prisma.attendance.create({
      data: {
        staffId: body.staffId,
        date: new Date(body.date),
        checkIn: new Date(body.checkIn),
        checkOut: body.checkOut ? new Date(body.checkOut) : null,
        status: body.status,
      },
      include: {
        staff: true,
      },
    })

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Failed to create attendance:', error)
    return NextResponse.json(
      { error: 'Failed to create attendance' },
      { status: 500 }
    )
  }
} 