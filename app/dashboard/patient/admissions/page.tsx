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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BedDouble, Plus, Search, Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Admission {
  id: string;
  patientId: string;
  patientName: string;
  roomNumber: string;
  admissionDate: string;
  dischargeDate: string | null;
  status: string;
  notes?: string;
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAdmission, setIsAddingAdmission] = useState(false);
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

  const fetchAdmissions = async (search = "") => {
    try {
      const response = await fetch(`/api/admissions?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch admissions');
      const data = await response.json();
      setAdmissions(data);
    } catch (error) {
      console.error('Error fetching admissions:', error);
      toast.error("Failed to fetch admissions");
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
    fetchAdmissions(searchQuery);
    fetchPatients();
  }, [searchQuery]);

  const handleAddAdmission = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingAdmission(true);

    try {
      const formData = new FormData(event.currentTarget);
      const admissionData = {
        patientId: formData.get('patientId'),
        roomNumber: formData.get('roomNumber'),
        notes: formData.get('notes'),
      };

      const response = await fetch('/api/admissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(admissionData),
      });

      if (!response.ok) throw new Error('Failed to add admission');

      toast.success("Admission added successfully");
      fetchAdmissions(searchQuery);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding admission:', error);
      toast.error("Failed to add admission");
    } finally {
      setIsAddingAdmission(false);
    }
  };

  const handleDischarge = async (id: string) => {
    try {
      const response = await fetch(`/api/admissions/${id}/discharge`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to discharge patient');

      toast.success("Patient discharged successfully");
      fetchAdmissions(searchQuery);
    } catch (error) {
      console.error('Error discharging patient:', error);
      toast.error("Failed to discharge patient");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Discharged':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BedDouble className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Admissions</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Admission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Admission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAdmission} className="space-y-4">
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
                <Label htmlFor="roomNumber">Room Number</Label>
                <Input
                  id="roomNumber"
                  name="roomNumber"
                  placeholder="Enter room number"
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
              <Button type="submit" className="w-full" disabled={isAddingAdmission}>
                {isAddingAdmission ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Admission'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Admission List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search admissions..."
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
                  <TableHead>Room Number</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Discharge Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admissions.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell>{admission.patientName}</TableCell>
                    <TableCell>{admission.roomNumber}</TableCell>
                    <TableCell>{format(new Date(admission.admissionDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {admission.dischargeDate 
                        ? format(new Date(admission.dischargeDate), 'MMM d, yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(admission.status)}`}>
                        {admission.status}
                      </span>
                    </TableCell>
                    <TableCell>{admission.notes || '-'}</TableCell>
                    <TableCell>
                      {admission.status === 'Active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDischarge(admission.id)}
                        >
                          Discharge
                        </Button>
                      )}
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