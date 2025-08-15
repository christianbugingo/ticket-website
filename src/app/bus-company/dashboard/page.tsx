"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Bus,
  Route,
  Ticket,
  DollarSign,
  Plus,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyStats {
  totalBuses: number;
  totalRoutes: number;
  totalBookings: number;
  monthlyRevenue: number;
  activeSchedules: number;
}

interface RecentBooking {
  id: number;
  seatNumber: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  schedule: {
    departure: string;
    arrival: string;
    price: number;
    route: { origin: string; destination: string } | null;
  };
}

interface CompanyInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  licenseNumber: string;
  buses?: unknown[];
  routes?: unknown[];
}

export default function BusCompanyDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<CompanyStats>({
    totalBuses: 0,
    totalRoutes: 0,
    totalBookings: 0,
    monthlyRevenue: 0,
    activeSchedules: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  const fetchCompanyData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch company information and statistics
      const [companyRes, bookingsRes] = await Promise.all([
        fetch("/api/bus-company/profile"),
        fetch("/api/bus-company/bookings"),
      ]);

      if (companyRes.ok) {
        const company = await companyRes.json();
        setCompanyInfo(company);

        // Mock stats for now - replace with real data when API is ready
        setStats({
          totalBuses: company.buses?.length || 0,
          totalRoutes: company.routes?.length || 0,
          totalBookings: 0,
          monthlyRevenue: 0,
          activeSchedules: 0,
        });
      }

      if (bookingsRes.ok) {
        const bookings = await bookingsRes.json();
        setRecentBookings(bookings.slice(0, 10));

        // Calculate stats from bookings
        const totalRevenue = bookings.reduce(
          (sum: number, booking: RecentBooking) =>
            sum + (booking.schedule?.price || 0),
          0
        );

        setStats((prev) => ({
          ...prev,
          totalBookings: bookings.length,
          monthlyRevenue: totalRevenue,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch company data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session) {
      router.push("/bus-company/login");
      return;
    }

    // Check if user is a company owner
    if (session.user?.role !== "COMPANY_OWNER") {
      router.push("/");
      return;
    }

    fetchCompanyData();
  }, [session, router, fetchCompanyData]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access the company dashboard.
          </p>
          <Link href="/bus-company/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (session.user?.role !== "COMPANY_OWNER") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You need bus company owner privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <Building className="h-8 w-8" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                {companyInfo?.name || "Company Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                Manage your fleet, routes, and bookings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Buses</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBuses}</div>
              <p className="text-xs text-muted-foreground">Active fleet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Routes
              </CardTitle>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRoutes}</div>
              <p className="text-xs text-muted-foreground">Operating routes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Bookings
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monthly Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.monthlyRevenue.toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Schedules
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSchedules}</div>
              <p className="text-xs text-muted-foreground">Running today</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage your bus company operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/bus-company/buses/add">
                <Button
                  className="w-full h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Bus className="h-6 w-6" />
                  Add New Bus
                </Button>
              </Link>
              <Link href="/bus-company/routes">
                <Button
                  className="w-full h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Route className="h-6 w-6" />
                  Manage Routes
                </Button>
              </Link>
              <Link href="/bus-company/schedules">
                <Button
                  className="w-full h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Calendar className="h-6 w-6" />
                  Add Schedule
                </Button>
              </Link>
              <Link href="/bus-company/bookings">
                <Button
                  className="w-full h-20 flex-col gap-2"
                  variant="outline"
                >
                  <Ticket className="h-6 w-6" />
                  View Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Latest bookings for your buses
                </CardDescription>
              </div>
              <Link href="/bus-company/bookings">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Passenger</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Seat</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">#{booking.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.schedule.route
                        ? `${booking.schedule.route.origin} → ${booking.schedule.route.destination}`
                        : "Route not specified"}
                    </TableCell>
                    <TableCell>{booking.seatNumber}</TableCell>
                    <TableCell>
                      {booking.schedule.price.toLocaleString()} RWF
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "CONFIRMED"
                            ? "default"
                            : booking.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {recentBookings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Company Status */}
        {companyInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Company Status</CardTitle>
              <CardDescription>
                Your company information and approval status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Company Name
                  </p>
                  <p className="text-lg">{companyInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge
                    variant={
                      companyInfo.status === "APPROVED"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {companyInfo.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    License Number
                  </p>
                  <p className="text-lg">{companyInfo.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact
                  </p>
                  <p className="text-lg">{companyInfo.phone}</p>
                </div>
              </div>
              {companyInfo.status === "PENDING" && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Your company registration is pending admin approval.
                    You&apos;ll receive an email once approved.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
