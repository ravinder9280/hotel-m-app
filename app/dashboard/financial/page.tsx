"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileText, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function FinancialDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <DollarSign className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/dashboard/financial/billing">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$24,500</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/financial/insurance">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance Claims</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                8 pending approval
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/financial/revenue">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                Compared to last quarter
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/financial/overdue">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$5,200</div>
              <p className="text-xs text-muted-foreground">
                15 overdue invoices
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Consultation</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$150.00</p>
                  <p className="text-xs text-muted-foreground">Today</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Jane Smith</p>
                  <p className="text-xs text-muted-foreground">Laboratory Test</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$75.00</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Robert Johnson</p>
                  <p className="text-xs text-muted-foreground">X-Ray</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$200.00</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insurance Claims Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Blue Cross</p>
                  <p className="text-xs text-muted-foreground">Claim #12345</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Approved
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Aetna</p>
                  <p className="text-xs text-muted-foreground">Claim #12346</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Pending
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Cigna</p>
                  <p className="text-xs text-muted-foreground">Claim #12347</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Rejected
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sarah Williams</p>
                  <p className="text-xs text-muted-foreground">Due: 5 days ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$350.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Michael Brown</p>
                  <p className="text-xs text-muted-foreground">Due: 10 days ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$180.00</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Emily Davis</p>
                  <p className="text-xs text-muted-foreground">Due: 15 days ago</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">$420.00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 