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
import { Calendar as CalendarIcon, Plus, Search, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  status: string;
  type: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [patients, setPatients] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

  const fetchAppointments = async (search = "") => {
    try {
      const response = await fetch(`/api/appointments?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error("Failed to fetch appointments");
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
    fetchAppointments(searchQuery);
    fetchPatients();
  }, [searchQuery]);

  const handleAddAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingAppointment(true);

    try {
      const formData = new FormData(event.currentTarget);
      const appointmentData = {
        patientId: formData.get('patientId'),
        dateTime: formData.get('dateTime'),
        type: formData.get('type'),
        notes: formData.get('notes'),
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) throw new Error('Failed to add appointment');

      toast.success("Appointment added successfully");
      fetchAppointments(searchQuery);
      (event.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast.error("Failed to add appointment");
    } finally {
      setIsAddingAppointment(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
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
                <Label htmlFor="dateTime">Date & Time</Label>
                <Input
                  id="dateTime"
                  name="dateTime"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Check-up">Check-up</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Consultation">Consultation</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  name="notes"
                  placeholder="Optional notes"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAddingAppointment}>
                {isAddingAppointment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Appointment'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Appointment List</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>{appointment.patientName}</TableCell>
                    <TableCell>{format(new Date(appointment.dateTime), 'MMM d, yyyy h:mm a')}</TableCell>
                    <TableCell>{appointment.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </TableCell>
                    <TableCell>{appointment.notes || '-'}</TableCell>
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