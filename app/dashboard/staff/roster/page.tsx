"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Users, Loader2, Plus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import ErrorBoundary from "@/components/error-boundary";

interface Shift {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  staff: {
    firstName: string;
    lastName: string;
    department: string;
  };
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  role: string;
  status: string;
}

interface DepartmentWorkload {
  department: string;
  requiredStaff: number;
  currentStaff: number;
  shiftsInDept: number;
  coverage: number;
}

export default function StaffRosterPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [department, setDepartment] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isAddingShift, setIsAddingShift] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [shiftDate, setShiftDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [departmentWorkload, setDepartmentWorkload] = useState<DepartmentWorkload[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/staff/initial-data');
        if (!response.ok) throw new Error('Failed to fetch initial data');
        const data = await response.json();
        setShifts(data.shifts);
        setStaff(data.staff);
        setDepartmentWorkload(data.departmentWorkload);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load initial data');
        toast.error('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/staff/shifts?date=${format(date || new Date(), "yyyy-MM-dd")}&department=${department}`);
      if (!response.ok) throw new Error('Failed to fetch shifts');
      const data = await response.json();
      setShifts(data);
      calculateDepartmentWorkload(data, staff);
    } catch (error) {
      console.error('Error fetching shifts:', error);
      setError('Failed to fetch shifts');
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const calculateDepartmentWorkload = (shifts: Shift[], staff: Staff[]) => {
    const departments = new Set(staff.map(s => s.department));
    const workload: DepartmentWorkload[] = [];

    departments.forEach(dept => {
      const staffInDept = staff.filter(s => s.department === dept).length;
      const shiftsInDept = shifts.filter(s => s.staff.department === dept).length;
      const requiredStaff = Math.ceil(shiftsInDept * 0.7); // 70% coverage requirement
      const coverage = Math.min(Math.round((staffInDept / requiredStaff) * 100), 100);

      workload.push({
        department: dept,
        requiredStaff,
        currentStaff: staffInDept,
        shiftsInDept,
        coverage
      });
    });

    setDepartmentWorkload(workload);
  };

  const handleAddShift = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingShift(true);
    setError(null);

    try {
      const startDateTime = new Date(`${shiftDate}T${startTime}`);
      const endDateTime = new Date(`${shiftDate}T${endTime}`);

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
      setError(error instanceof Error ? error.message : "Failed to add shift");
      toast.error(error instanceof Error ? error.message : "Failed to add shift");
    } finally {
      setIsAddingShift(false);
    }
  };

  const filteredShifts = shifts.filter(shift => 
    department === "all" || shift.staff.department === department
  );

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate) fetchShifts();
                }}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Department Workload</CardTitle>
                <Select value={department} onValueChange={(value) => {
                  setDepartment(value);
                  fetchShifts();
                }}>
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
                        <div className="text-sm text-muted-foreground">
                          {shift.staff.department}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(shift.startTime), "HH:mm")} - {format(new Date(shift.endTime), "HH:mm")}
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
    </ErrorBoundary>
  );
} 