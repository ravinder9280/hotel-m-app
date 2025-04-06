"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Users, 
  UserCog, 
  DollarSign,
  Calendar,
  BedDouble,
  FileText,
  ClipboardList,
  UserCheck,
  PieChart,
  Settings
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const navigation = [
    {
      name: 'Patient Dashboard',
      icon: Users,
      children: [
        { name: 'Patient Records', href: '/dashboard/patient/records', icon: FileText },
        { name: 'Appointments', href: '/dashboard/patient/appointments', icon: Calendar },
        { name: 'Admissions', href: '/dashboard/patient/admissions', icon: BedDouble },
      ]
    },
    {
      name: 'Staff Dashboard',
      icon: UserCog,
      children: [
        { name: 'Staff Roster', href: '/dashboard/staff/roster', icon: ClipboardList },
        { name: 'Attendance', href: '/dashboard/staff/attendance', icon: UserCheck },
        { name: 'Department Overview', href: '/dashboard/staff/departments', icon: PieChart },
      ]
    },
    {
      name: 'Financial Dashboard',
      icon: DollarSign,
      children: [
        { name: 'Billing', href: '/dashboard/financial/billing', icon: FileText },
        { name: 'Insurance Claims', href: '/dashboard/financial/insurance', icon: FileText },
        { name: 'Revenue', href: '/dashboard/financial/revenue', icon: PieChart },
      ]
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    }
  ]

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r",
      expanded ? "w-64" : "w-16"
    )}>
      <div className="p-4 flex justify-between items-center">
        <h1 className={cn(
          "font-bold text-xl transition-all",
          expanded ? "opacity-100" : "opacity-0 w-0"
        )}>
          HMS
        </h1>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-accent rounded-lg"
        >
          {expanded ? "←" : "→"}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-2">
        {navigation.map((item) => (
          <div key={item.name}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                  pathname === item.href ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn(
                  "transition-all",
                  expanded ? "opacity-100" : "opacity-0 w-0"
                )}>
                  {item.name}
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3 px-3 py-2 text-muted-foreground">
                <item.icon className="h-5 w-5" />
                <span className={cn(
                  "transition-all font-medium",
                  expanded ? "opacity-100" : "opacity-0 w-0"
                )}>
                  {item.name}
                </span>
              </div>
            )}

            {expanded && item.children && (
              <div className="ml-6 mt-2 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm",
                      pathname === child.href ? "bg-primary/80" : "hover:bg-accent/50"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <span>{child.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar