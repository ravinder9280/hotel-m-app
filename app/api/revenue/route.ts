import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subDays, startOfDay, endOfDay } from 'date-fns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month';

    // Calculate date ranges based on timeframe
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    switch (timeframe) {
      case 'week':
        startDate = startOfDay(subDays(now, 7));
        endDate = endOfDay(now);
        previousStartDate = startOfDay(subDays(startDate, 7));
        previousEndDate = endOfDay(subDays(startDate, 1));
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        previousStartDate = startOfMonth(subMonths(now, 1));
        previousEndDate = endOfMonth(subMonths(now, 1));
        break;
      case 'quarter':
        startDate = startOfMonth(subMonths(now, 3));
        endDate = endOfMonth(now);
        previousStartDate = startOfMonth(subMonths(startDate, 3));
        previousEndDate = endOfMonth(subMonths(startDate, 1));
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        previousStartDate = startOfYear(subMonths(now, 12));
        previousEndDate = endOfYear(subMonths(now, 12));
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        previousStartDate = startOfMonth(subMonths(now, 1));
        previousEndDate = endOfMonth(subMonths(now, 1));
    }

    // Fetch payments for the current period
    const currentPayments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Fetch payments for the previous period
    const previousPayments = await prisma.payment.findMany({
      where: {
        date: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
    });

    // Calculate total revenue
    const totalRevenue = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    // Calculate monthly revenue
    const monthlyRevenue = await prisma.payment.aggregate({
      where: {
        date: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate yearly revenue
    const yearlyRevenue = await prisma.payment.aggregate({
      where: {
        date: {
          gte: startOfYear(now),
          lte: endOfYear(now),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate revenue growth
    const currentPeriodTotal = currentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const previousPeriodTotal = previousPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const revenueGrowth = previousPeriodTotal === 0 
      ? 100 
      : ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100;

    // Format revenue data for the chart
    const revenueData = currentPayments.map(payment => ({
      date: payment.date.toISOString(),
      amount: payment.amount,
      source: payment.source,
    }));

    return NextResponse.json({
      stats: {
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        yearlyRevenue: yearlyRevenue._sum.amount || 0,
        revenueGrowth,
      },
      revenueData,
    });
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
} 