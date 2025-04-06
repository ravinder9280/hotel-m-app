"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Users, Loader2, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

interface Shift {
  id: string;
  staffId: string;
  staff: {
    firstName: string;
    lastName: string;
    department: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  department: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
}

interface DepartmentWorkload {
  department: string;
  staffCount: number;
  requiredStaff: number;
  coverage: number;
}

export default function StaffRosterPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [department, setDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [departmentWorkload, setDepartmentWorkload] = useState<DepartmentWorkload[]>([]);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/shifts?date=${format(date || new Date(), "yyyy-MM-dd")}&department=${department}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setShifts(data);
      calculateDepartmentWorkload(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
      calculateDepartmentWorkload([]);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error("Failed to fetch staff list");
    }
  };

  useEffect(() => {
    fetchShifts();
    fetchStaff();
  }, [date, department]);

  const calculateDepartmentWorkload = (currentShifts: Shift[]) => {
    const departments = new Set(staff.map(s => s.department));
    const workload = Array.from(departments).map(dept => {
      const staffInDept = staff.filter(s => s.department === dept).length;
      const shiftsInDept = currentShifts.filter(s => s.department === dept).length;
      const requiredStaff = Math.ceil(staffInDept * 0.7); // 70% coverage requirement
      const coverage = (shiftsInDept / requiredStaff) * 100;

      return {
        department: dept,
        staffCount: staffInDept,
        requiredStaff,
        coverage: Math.min(coverage, 100),
      };
    });

    setDepartmentWorkload(workload);
  };

  const handleAddShift = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingShift(true);

    try {
      // Combine date and time into proper DateTime strings
      const [year, month, day] = shiftDate.split('-');
      const startDateTime = new Date(`${year}-${month}-${day}T${startTime}:00`);
      const endDateTime = new Date(`${year}-${month}-${day}T${endTime}:00`);

      const response = await fetch('/api/staff/shifts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: selectedStaff,
          date: shiftDate,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add shift');
      }

      toast.success("Shift added successfully");
      fetchShifts();
      setSelectedStaff("");
      setShiftDate(format(new Date(), "yyyy-MM-dd"));
      setStartTime("09:00");
      setEndTime("17:00");
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add shift");
    } finally {
      setIsAddingShift(false);
    }
  };

  const filteredShifts = shifts.filter(shift => 
    department === "all" || shift.department === department
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Staff Roster</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddShift} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isAddingShift}>
                {isAddingShift ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Shift'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Department Workload</CardTitle>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentWorkload.map((dept) => (
                <div key={dept.department} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.department}</span>
                    <span className="text-sm text-muted-foreground">
                      {dept.shiftsInDept} / {dept.requiredStaff} staff
                    </span>
                  </div>
                  <Progress value={dept.coverage} className="h-2" />
                  {dept.coverage < 70 && (
                    <div className="flex items-center gap-2 text-yellow-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Low coverage - Additional staff needed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{`${shift.staff.firstName} ${shift.staff.lastName}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {shift.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 