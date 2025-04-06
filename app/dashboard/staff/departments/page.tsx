"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Department {
  id: string;
  name: string;
  description: string;
  staffCount: number;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    description: "",
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddDepartment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAddingDepartment(true);

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDepartment),
      });

      if (!response.ok) throw new Error('Failed to add department');

      toast.success("Department added successfully");
      fetchDepartments();
      setNewDepartment({ name: "", description: "" });
    } catch (error) {
      console.error('Error adding department:', error);
      toast.error("Failed to add department");
    } finally {
      setIsAddingDepartment(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddDepartment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input
                  id="name"
                  value={newDepartment.name}
                  onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newDepartment.description}
                  onChange={(e) => setNewDepartment({ ...newDepartment, description: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isAddingDepartment}>
                {isAddingDepartment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Department'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <Card key={department.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{department.name}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {department.description}
                </p>
                <p className="text-sm font-medium">
                  {department.staffCount} staff members
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}