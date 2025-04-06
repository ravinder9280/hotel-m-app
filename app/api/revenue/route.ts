import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  status: string;
  bill: {
    patient: {
      firstName: string;
      lastName: string;
    };
  };
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause = {};
    let orderByClause = {};

    if (startDate && endDate) {
      whereClause = {
        paymentDate: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
      orderByClause = {
        paymentDate: 'asc'
      };
    } else if (period === 'monthly') {
      const now = new Date();
      whereClause = {
        paymentDate: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      };
      orderByClause = {
        paymentDate: 'asc'
      };
    } else if (period === 'yearly') {
      const now = new Date();
      whereClause = {
        paymentDate: {
          gte: startOfYear(now),
          lte: endOfYear(now)
        }
      };
      orderByClause = {
        paymentDate: 'asc'
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: orderByClause,
      include: {
        bill: {
          include: {
            patient: true
          }
        }
      }
    });

    const monthlyRevenue = await prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      }
    });

    const yearlyRevenue = await prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      }
    });

    const revenueData = payments.map((payment: Payment) => ({
      id: payment.id,
      amount: payment.amount,
      date: payment.paymentDate.toISOString(),
      source: payment.paymentMethod,
      patientName: payment.bill.patient.firstName + ' ' + payment.bill.patient.lastName,
      status: payment.status
    }));

    return NextResponse.json({
      revenue: revenueData,
      summary: {
        monthlyRevenue: monthlyRevenue._sum?.amount || 0,
        yearlyRevenue: yearlyRevenue._sum?.amount || 0,
        totalPayments: payments.length
      }
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 