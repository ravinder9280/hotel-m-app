"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  status: string;
  appointments: Array<{
    dateTime: string;
  }>;
}

export default function PatientRecordsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingPatient, setIsAddingPatient] = useState(false);

  const fetchPatients = async (search = "") => {
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error("Failed to fetch patients. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(searchQuery);
  }, [searchQuery]);

  const handleAddPatient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingPatient(true);

    try {
      const formData = new FormData(event.currentTarget);
      const patientData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
      };

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) throw new Error('Failed to add patient');

      toast.success("Patient added successfully");

      fetchPatients(searchQuery);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding patient:', error);
      toast.error("Failed to add patient. Please try again.");
    } finally {
      setIsAddingPatient(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Patient Records</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required />
              </div>
              <Button type="submit" className="w-full" disabled={isAddingPatient}>
                {isAddingPatient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAddingPatient ? "Adding Patient..." : "Add Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>{patient.id}</TableCell>
                    <TableCell className="font-medium">
                      {`${patient.firstName} ${patient.lastName}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(patient.dateOfBirth), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {patient.appointments[0]
                        ? format(new Date(patient.appointments[0].dateTime), 'MMM d, yyyy')
                        : 'No visits'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          patient.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {patient.status}
                      </span>
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