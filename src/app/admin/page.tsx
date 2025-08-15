"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Bus,
  Ticket,
  DollarSign,
  MoreHorizontal,
  Plus,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  totalBuses: number;
  totalCompanies: number;
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
    bus: { plateNumber: string; company: { name: string } };
    route: { origin: string; destination: string } | null;
  };
}

interface AnalyticsData {
  name: string;
  revenue: number;
  bookings: number;
}

const chartConfig = {
  revenue: {
    label: "Revenue (RWF)",
    color: "hsl(var(--primary))",
  },
  bookings: {
    label: "Bookings",
    color: "hsl(var(--accent))",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalBuses: 0,
    totalCompanies: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all data needed for dashboard using the existing API routes
      const [bookingsRes, companiesRes, busesRes] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/admin/companies"),
        fetch("/api/admin/buses"),
      ]);

      const bookings = bookingsRes.ok ? await bookingsRes.json() : [];
      const companies = companiesRes.ok ? await companiesRes.json() : [];
      const buses = busesRes.ok ? await busesRes.json() : [];

      // Calculate stats from real data
      const totalRevenue = bookings.reduce(
        (sum: number, booking: RecentBooking) =>
          sum + (booking.schedule?.price || 0),
        0
      );

      // Get unique users from bookings
      const uniqueUsers = new Set(
        bookings.map((booking: RecentBooking) => booking.user?.email)
      ).size;

      setStats({
        totalUsers: uniqueUsers,
        totalBookings: bookings.length,
        totalRevenue,
        totalBuses: buses.length,
        totalCompanies: companies.length,
      });

      setRecentBookings(bookings.slice(0, 5));

      // Generate monthly analytics data
      const monthlyData = generateMonthlyAnalytics(bookings);
      setAnalyticsData(monthlyData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateMonthlyAnalytics = (
    bookings: RecentBooking[]
  ): AnalyticsData[] => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentYear = new Date().getFullYear();

    return months.map((month) => {
      const monthBookings = bookings.filter((booking: RecentBooking) => {
        const bookingDate = new Date(booking.createdAt);
        return (
          bookingDate.getFullYear() === currentYear &&
          months[bookingDate.getMonth()] === month
        );
      });

      return {
        name: month,
        revenue: monthBookings.reduce(
          (sum: number, booking: RecentBooking) =>
            sum + (booking.schedule?.price || 0),
          0
        ),
        bookings: monthBookings.length,
      };
    });
  };

  useEffect(() => {
    // Check if user is admin
    if (session && session.user?.email !== "admin@itike.rw") {
      router.push("/");
      return;
    }

    if (session) {
      fetchDashboardData();
    }
  }, [session, router, fetchDashboardData]);

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access the admin dashboard.
          </p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (session.user?.email !== "admin@itike.rw") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
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
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Welcome, Admin. Here&apos;s an overview of your platform.
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">From all bookings</p>
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
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Bus Companies
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Operating companies
              </p>
            </CardContent>
          </Card>
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
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Analytics</CardTitle>
            <CardDescription>
              Revenue and bookings overview for {new Date().getFullYear()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  <Bar dataKey="bookings" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Latest bookings from users</CardDescription>
              </div>
              <Link href="/admin/schedules">
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
                  <TableHead>User</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>{booking.schedule.bus.company.name}</TableCell>
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
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Update Status</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {recentBookings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin/buses/add">
                <Button className="w-full" variant="outline">
                  <Bus className="mr-2 h-4 w-4" />
                  Add New Bus
                </Button>
              </Link>
              <Link href="/admin/routes">
                <Button className="w-full" variant="outline">
                  <Ticket className="mr-2 h-4 w-4" />
                  Manage Routes
                </Button>
              </Link>
              <Link href="/admin/schedules">
                <Button className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Schedule
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                View All Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
