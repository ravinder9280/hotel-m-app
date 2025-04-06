import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')

    const whereClause = department && department !== 'all' 
      ? { department } 
      : {}

    const staff = await prisma.staff.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        email: true,
        status: true
      },
      orderBy: {
        lastName: 'asc'
      }
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, department, status } = body

    if (!firstName || !lastName || !email || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingStaff = await prisma.staff.findUnique({
      where: { email }
    })

    if (existingStaff) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    const staff = await prisma.staff.create({
      data: {
        firstName,
        lastName,
        email,
        department,
        status: status || 'active'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        department: true,
        email: true,
        status: true
      }
    })

    return NextResponse.json(staff, { status: 201 })
  } catch (error) {
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    )
  }
} 