import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, format } from 'date-fns'

interface AttendanceRecord {
  id: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  staffId: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    role: string;
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const department = searchParams.get('department')

    const whereClause: any = {}

    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (department) {
      whereClause.staff = {
        department: department
      }
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        staff: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: true,
            role: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    const formattedRecords = attendanceRecords.map((record: AttendanceRecord) => ({
      id: record.id,
      staffId: record.staff.id,
      staffName: `${record.staff.firstName} ${record.staff.lastName}`,
      email: record.staff.email,
      department: record.staff.department,
      role: record.staff.role,
      date: record.date.toISOString(),
      status: record.status,
      checkIn: record.checkIn?.toISOString() || '',
      checkOut: record.checkOut?.toISOString() || ''
    }))

    return NextResponse.json(formattedRecords)
  } catch (error) {
    console.error('Error fetching attendance report:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance report' },
      { status: 500 }
    )
  }
} 