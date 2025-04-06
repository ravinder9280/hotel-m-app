import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [shifts, staff] = await Promise.all([
      prisma.shift.findMany({
        where: {
          date: today
        },
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
      }),
      prisma.staff.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          role: true,
          status: true
        }
      })
    ]);

    const departments = new Set(staff.map(s => s.department));
    const workload = Array.from(departments).map(dept => {
      const staffInDept = staff.filter(s => s.department === dept).length;
      const shiftsInDept = shifts.filter(s => s.staff.department === dept).length;
      const requiredStaff = Math.ceil(shiftsInDept * 0.7); // 70% coverage requirement
      const coverage = Math.min(Math.round((staffInDept / requiredStaff) * 100), 100);

      return {
        department: dept,
        requiredStaff,
        currentStaff: staffInDept,
        shiftsInDept,
        coverage
      };
    });

    return NextResponse.json({
      shifts,
      staff,
      departmentWorkload: workload
    });
  } catch (error) {
    console.error('Error fetching initial data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch initial data' },
      { status: 500 }
    );
  }
} 