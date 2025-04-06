import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const staff = await prisma.staff.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      },
      orderBy: { joinDate: 'desc' },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Failed to fetch staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const staff = await prisma.staff.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        role: body.role,
        department: body.department,
        joinDate: new Date(body.joinDate),
        status: 'Active',
      },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Failed to create staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
} 