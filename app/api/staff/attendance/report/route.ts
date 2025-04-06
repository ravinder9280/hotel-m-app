import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const department = searchParams.get('department')

    const monthStart = startOfMonth(new Date(date || new Date()))
    const monthEnd = endOfMonth(new Date(date || new Date()))

    const attendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
        staff: {
          department: department && department !== 'all' ? department : undefined,
        },
      },
      include: {
        staff: true,
      },
      orderBy: [
        { date: 'asc' },
        { staff: { firstName: 'asc' } },
      ],
    })

    // Generate CSV content
    const headers = ['Date', 'Staff Name', 'Department', 'Check In', 'Check Out', 'Status', 'Leave Type', 'Leave Reason']
    const rows = attendance.map(record => [
      format(new Date(record.date), 'yyyy-MM-dd'),
      `${record.staff.firstName} ${record.staff.lastName}`,
      record.staff.department,
      record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : '',
      record.checkOut ? format(new Date(record.checkOut), 'HH:mm') : '',
      record.status,
      record.leaveType || '',
      record.leaveReason || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    // Create response with CSV file
    const response = new NextResponse(csvContent)
    response.headers.set('Content-Type', 'text/csv')
    response.headers.set('Content-Disposition', `attachment; filename=attendance-report-${format(monthStart, 'yyyy-MM')}.csv`)

    return response
  } catch (error) {
    console.error('Failed to generate attendance report:', error)
    return NextResponse.json(
      { error: 'Failed to generate attendance report' },
      { status: 500 }
    )
  }
} 