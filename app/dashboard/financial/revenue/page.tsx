"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, Calendar as CalendarIcon, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
}

interface RevenueData {
  date: string;
  amount: number;
  source: string;
}

export default function RevenuePage() {
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [stats, setStats] = useState<RevenueStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [chartData, setChartData] = useState<ChartData<"line">>({
    labels: [],
    datasets: [],
  });

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/revenue?timeframe=${timeframe}`);
      if (!response.ok) throw new Error('Failed to fetch revenue data');
      const data = await response.json();
      
      setRevenueData(data.revenueData);
      setStats(data.stats);

      // Prepare chart data
      const labels = data.revenueData.map((item: RevenueData) => 
        format(new Date(item.date), 'MMM d')
      );
      const amounts = data.revenueData.map((item: RevenueData) => item.amount);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: amounts,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error("Failed to fetch revenue data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
  }, [timeframe]);

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <ArrowUpRight className="h-4 w-4" />
    ) : (
      <ArrowDownRight className="h-4 w-4" />
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Revenue Overview</h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
              <SelectItem value="year">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All time revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.yearlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold flex items-center ${getGrowthColor(stats.revenueGrowth)}`}>
              {getGrowthIcon(stats.revenueGrowth)}
              {Math.abs(stats.revenueGrowth).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="h-[300px]">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `$${value}`,
                        },
                      },
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenueData.slice(0, 5).map((item) => (
                    <TableRow key={item.date}>
                      <TableCell>{format(new Date(item.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{item.source}</TableCell>
                      <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 