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
import { FileText, Plus, Search, Loader2, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  claimNumber: string;
  insuranceProvider: string;
  amount: number;
  status: string;
  submittedDate: string;
  processedDate?: string;
  notes?: string;
}

interface InsuranceStats {
  totalClaims: number;
  approvedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
}

export default function InsuranceClaimsPage() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingClaim, setIsAddingClaim] = useState(false);
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [stats, setStats] = useState<InsuranceStats>({
    totalClaims: 0,
    approvedAmount: 0,
    pendingAmount: 0,
    rejectedAmount: 0,
  });

  const fetchClaims = async (search = "") => {
    try {
      const response = await fetch(`/api/insurance?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setClaims(data);
      
      // Calculate stats from the claims data
      const stats = data.reduce((acc: InsuranceStats, claim: InsuranceClaim) => {
        acc.totalClaims += 1;
        if (claim.status === 'Approved') {
          acc.approvedAmount += claim.amount;
        } else if (claim.status === 'Pending') {
          acc.pendingAmount += claim.amount;
        } else if (claim.status === 'Rejected') {
          acc.rejectedAmount += claim.amount;
        }
        return acc;
      }, {
        totalClaims: 0,
        approvedAmount: 0,
        pendingAmount: 0,
        rejectedAmount: 0,
      });
      
      setStats(stats);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast.error("Failed to fetch claims");
    } finally {
      setLoading(false);
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
    fetchClaims(searchQuery);
    fetchPatients();
  }, [searchQuery]);

  const handleAddClaim = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingClaim(true);

    try {
      const formData = new FormData(event.currentTarget);
      const claimData = {
        patientId: formData.get('patientId'),
        claimNumber: formData.get('claimNumber'),
        insuranceProvider: formData.get('insuranceProvider'),
        amount: parseFloat(formData.get('amount') as string),
        submittedDate: formData.get('submittedDate'),
        notes: formData.get('notes'),
      };

      const response = await fetch('/api/insurance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      if (!response.ok) throw new Error('Failed to add claim');

      toast.success("Insurance claim added successfully");
      fetchClaims(searchQuery);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding claim:', error);
      toast.error("Failed to add claim");
    } finally {
      setIsAddingClaim(false);
    }
  };

  const handleViewDetails = async (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Insurance Claims</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Insurance Claim</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClaim} className="space-y-4">
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
                <Label htmlFor="claimNumber">Claim Number</Label>
                <Input
                  id="claimNumber"
                  name="claimNumber"
                  placeholder="Enter claim number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  name="insuranceProvider"
                  placeholder="Enter insurance provider"
                  required
                />
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
                <Label htmlFor="submittedDate">Submitted Date</Label>
                <Input
                  id="submittedDate"
                  name="submittedDate"
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
              <Button type="submit" className="w-full" disabled={isAddingClaim}>
                {isAddingClaim ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Claim'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              All insurance claims
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Claims</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Approved claim amounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Pending claim amounts
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Claims</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.rejectedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Rejected claim amounts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Claims List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search claims..."
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
                  <TableHead>Claim Number</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>{claim.patientName}</TableCell>
                    <TableCell>{claim.claimNumber}</TableCell>
                    <TableCell>{claim.insuranceProvider}</TableCell>
                    <TableCell>${claim.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(claim.submittedDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(claim)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Claim Details</DialogTitle>
                          </DialogHeader>
                          {selectedClaim && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Patient</Label>
                                  <p className="font-medium">{selectedClaim.patientName}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Claim Number</Label>
                                  <p className="font-medium">{selectedClaim.claimNumber}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Insurance Provider</Label>
                                  <p className="font-medium">{selectedClaim.insuranceProvider}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Amount</Label>
                                  <p className="font-medium">${selectedClaim.amount.toFixed(2)}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Status</Label>
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedClaim.status)}`}>
                                    {selectedClaim.status}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Submitted Date</Label>
                                  <p className="font-medium">{format(new Date(selectedClaim.submittedDate), 'MMM d, yyyy')}</p>
                                </div>
                                {selectedClaim.processedDate && (
                                  <div className="space-y-2">
                                    <Label className="text-sm text-muted-foreground">Processed Date</Label>
                                    <p className="font-medium">{format(new Date(selectedClaim.processedDate), 'MMM d, yyyy')}</p>
                                  </div>
                                )}
                              </div>

                              {selectedClaim.notes && (
                                <div className="space-y-2">
                                  <Label className="text-sm text-muted-foreground">Notes</Label>
                                  <p className="text-sm">{selectedClaim.notes}</p>
                                </div>
                              )}

                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedClaim(null)}>
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