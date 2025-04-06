import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Payment {
  id: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  status: string;
  billId: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get daily revenue
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        paymentDate: 'asc'
      }
    });

    // Format the data
    const revenueData = payments.map((payment: Payment) => ({
      id: payment.id,
      amount: payment.amount,
      date: payment.paymentDate.toISOString(),
      source: payment.paymentMethod,
      status: payment.status
    }));

    // Get monthly revenue
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    // Get yearly revenue
    const yearlyRevenue = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: start,
          lte: end
        }
      },
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      daily: revenueData,
      monthly: {
        total: monthlyRevenue._sum?.amount || 0,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      yearly: {
        total: yearlyRevenue._sum?.amount || 0,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      }
    });
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 