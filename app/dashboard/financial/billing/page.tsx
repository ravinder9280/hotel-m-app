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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Search, Loader2, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon, FileText, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Bill {
  id: string;
  patientId: string;
  patientName: string;
  amount: number;
  dueDate: string;
  status: string;
  createdAt: string;
  notes?: string;
  payments?: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  notes?: string;
}

interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
}

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingAmount: 0,
    pendingCount: 0,
    overdueAmount: 0,
    overdueCount: 0,
  });
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchBills = async (search = "") => {
    try {
      const response = await fetch(`/api/bills?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
      
      // Calculate stats from the bills data
      const stats = data.reduce((acc: BillingStats, bill: Bill) => {
        if (bill.status === 'Paid') {
          acc.totalRevenue += bill.amount;
        } else if (bill.status === 'Pending') {
          acc.pendingAmount += bill.amount;
          acc.pendingCount += 1;
        } else if (bill.status === 'Overdue') {
          acc.overdueAmount += bill.amount;
          acc.overdueCount += 1;
        }
        return acc;
      }, {
        totalRevenue: 0,
        pendingAmount: 0,
        pendingCount: 0,
        overdueAmount: 0,
        overdueCount: 0,
      });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error("Failed to fetch bills");
    } finally {
      setLoading(false);
    }
  };

  const fetchBillDetails = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`);
      if (!response.ok) throw new Error('Failed to fetch bill details');
      const data = await response.json();
      setSelectedBill(data);
    } catch (error) {
      console.error('Error fetching bill details:', error);
      toast.error("Failed to fetch bill details");
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchBills(searchQuery);
    fetchPatients();
  }, [searchQuery]);

  const handleAddBill = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingBill(true);

    try {
      const formData = new FormData(event.currentTarget);
      const billData = {
        patientId: formData.get('patientId'),
        amount: parseFloat(formData.get('amount') as string),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes'),
      };

      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) throw new Error('Failed to add bill');

      toast.success("Bill added successfully");
      fetchBills(searchQuery);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error("Failed to add bill");
    } finally {
      setIsAddingBill(false);
    }
  };

  const handleViewDetails = async (bill: Bill) => {
    await fetchBillDetails(bill.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (billId: string, newStatus: string) => {
    setUpdatingStatus(billId);
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update bill status');

      toast.success("Bill status updated successfully");
      fetchBills(searchQuery);
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast.error("Failed to update bill status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <DollarSign className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Bill</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient</Label>
                <Select name="patientId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Optional notes"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAddingBill}>
                {isAddingBill ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Bill'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From paid bills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCount} pending invoices
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.overdueAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueCount} overdue invoices
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Bill List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.patientName}</TableCell>
                    <TableCell>${bill.amount.toFixed(2)}</TableCell>
                    <TableCell>{format(new Date(bill.dueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Select
                        value={bill.status}
                        onValueChange={(value) => handleStatusChange(bill.id, value)}
                        disabled={updatingStatus === bill.id}
                      >
                        <SelectTrigger className={`w-[120px] ${getStatusColor(bill.status)}`}>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{format(new Date(bill.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(bill)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Bill Details</DialogTitle>
                          </DialogHeader>
                          {selectedBill && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Patient</Label>
                                  <p className="font-medium">{selectedBill.patientName}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Amount</Label>
                                  <p className="font-medium">${selectedBill.amount.toFixed(2)}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Due Date</Label>
                                  <p className="font-medium">{format(new Date(selectedBill.dueDate), 'MMM d, yyyy')}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Status</Label>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedBill.status)}`}>
                                    {selectedBill.status}
                                  </span>
                                </div>
                              </div>

                              {selectedBill.notes && (
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Notes</Label>
                                  <p className="text-sm">{selectedBill.notes}</p>
                                </div>
                              )}

                              {selectedBill.payments && selectedBill.payments.length > 0 && (
                                <div className="space-y-4">
                                  <h3 className="font-medium">Payment History</h3>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {selectedBill.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                          <TableCell>{format(new Date(payment.paymentDate), 'MMM d, yyyy')}</TableCell>
                                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                                          <TableCell>{payment.paymentMethod}</TableCell>
                                          <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(payment.status)}`}>
                                              {payment.status}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedBill(null)}>
                                  Close
                                </Button>
                              </DialogFooter>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 