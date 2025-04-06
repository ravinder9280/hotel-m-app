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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Search, UserCheck, UserX, Loader2, Clock, Download } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Attendance {
  id: string;
  staffId: string;
  staff: {
    firstName: string;
    lastName: string;
    department: string;
  };
  date: string;
  checkIn: string;
  checkOut: string | null;
  status: "Present" | "Absent" | "Late" | "Leave";
  leaveType?: "Annual" | "Sick" | "Personal" | "Other";
  leaveReason?: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
}

interface MonthlyStats {
  present: number;
  absent: number;
  late: number;
  leave: number;
  attendanceRate: number;
}

export default function AttendancePage() {
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [department, setDepartment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [attendanceStatus, setAttendanceStatus] = useState<"Present" | "Absent" | "Late" | "Leave">("Present");
  const [checkInTime, setCheckInTime] = useState<string>(format(new Date(), "HH:mm"));
  const [leaveType, setLeaveType] = useState<"Annual" | "Sick" | "Personal" | "Other">("Annual");
  const [leaveReason, setLeaveReason] = useState<string>("");
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    attendanceRate: 0,
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/attendance?date=${date}&department=${department}&search=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setAttendance(data);
      calculateMonthlyStats(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error("Failed to fetch attendance records");
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
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error("Failed to fetch staff list");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchStaff();
  }, [date, department, searchQuery]);

  const calculateMonthlyStats = (records: Attendance[]) => {
    const monthStart = startOfMonth(new Date(date));
    const monthEnd = endOfMonth(new Date(date));
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd }).length;

    const monthlyRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    const stats = {
      present: monthlyRecords.filter(a => a.status === "Present").length,
      absent: monthlyRecords.filter(a => a.status === "Absent").length,
      late: monthlyRecords.filter(a => a.status === "Late").length,
      leave: monthlyRecords.filter(a => a.status === "Leave").length,
      attendanceRate: 0,
    };

    const totalExpected = staff.length * monthDays;
    const totalPresent = stats.present + stats.late;
    stats.attendanceRate = (totalPresent / totalExpected) * 100;

    setMonthlyStats(stats);
  };

  const handleMarkAttendance = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsMarkingAttendance(true);

    try {
      const response = await fetch('/api/staff/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staffId: selectedStaff,
          date: date,
          checkIn: `${date}T${checkInTime}`,
          status: attendanceStatus,
          leaveType: attendanceStatus === "Leave" ? leaveType : undefined,
          leaveReason: attendanceStatus === "Leave" ? leaveReason : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark attendance');

      toast.success("Attendance marked successfully");
      fetchAttendance();
      setSelectedStaff("");
      setAttendanceStatus("Present");
      setCheckInTime(format(new Date(), "HH:mm"));
      setLeaveType("Annual");
      setLeaveReason("");
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error("Failed to mark attendance");
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/staff/attendance/report?date=${date}&department=${department}`);
      if (!response.ok) throw new Error('Failed to generate report');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${format(new Date(date), "yyyy-MM")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error("Failed to download report");
    }
  };

  const filteredAttendance = attendance.filter(record => 
    (department === "all" || record.staff.department === department) &&
    (searchQuery === "" || 
      `${record.staff.firstName} ${record.staff.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <CalendarIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Mark Attendance</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleMarkAttendance} className="space-y-4">
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={attendanceStatus} onValueChange={(value: "Present" | "Absent" | "Late" | "Leave") => setAttendanceStatus(value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Present">Present</SelectItem>
                      <SelectItem value="Absent">Absent</SelectItem>
                      <SelectItem value="Late">Late</SelectItem>
                      <SelectItem value="Leave">Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {attendanceStatus === "Leave" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="leaveType">Leave Type</Label>
                      <Select value={leaveType} onValueChange={(value: "Annual" | "Sick" | "Personal" | "Other") => setLeaveType(value)} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Annual">Annual Leave</SelectItem>
                          <SelectItem value="Sick">Sick Leave</SelectItem>
                          <SelectItem value="Personal">Personal Leave</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="leaveReason">Reason</Label>
                      <Input
                        id="leaveReason"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Enter leave reason"
                        required
                      />
                    </div>
                  </>
                )}
                {attendanceStatus !== "Absent" && attendanceStatus !== "Leave" && (
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check In Time</Label>
                    <Input
                      type="time"
                      id="checkIn"
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      required
                    />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isMarkingAttendance}>
                  {isMarkingAttendance ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking...
                    </>
                  ) : (
                    'Mark Attendance'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{monthlyStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{monthlyStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{monthlyStats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave</CardTitle>
            <CalendarIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{monthlyStats.leave}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Attendance Records</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-[200px]"
              />
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
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[200px]"
                />
              </div>
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
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Leave Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{`${record.staff.firstName} ${record.staff.lastName}`}</TableCell>
                    <TableCell>{record.staff.department}</TableCell>
                    <TableCell>{record.checkIn ? format(new Date(record.checkIn), 'HH:mm') : "-"}</TableCell>
                    <TableCell>{record.checkOut ? format(new Date(record.checkOut), 'HH:mm') : "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.status === "Present" 
                          ? "bg-green-100 text-green-800"
                          : record.status === "Late"
                          ? "bg-yellow-100 text-yellow-800"
                          : record.status === "Leave"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell>{record.leaveType || "-"}</TableCell>
                    <TableCell>{record.leaveReason || "-"}</TableCell>
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