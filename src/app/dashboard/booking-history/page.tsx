"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  Ticket,
  LogOut,
  ArrowRight,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  avatarUrl: string;
}

interface UserBooking {
  id: number;
  ticketId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  amount: number;
  status: string;
  agency: string;
  agencyLogo?: string;
  seatNumber: string;
}

export default function BookingHistoryPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allBookings, setAllBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session || !session.user?.email) return;

      try {
        // Fetch user profile
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        }

        // Fetch user bookings
        const bookingsRes = await fetch("/api/user/bookings");
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setAllBookings(bookingsData.all || []);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: User },
    {
      href: "/dashboard/booking-history",
      label: "Booking History",
      icon: Ticket,
    },
    { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
  ];

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-4">
            You need to sign in to access your booking history.
          </p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Loading your booking history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
          <Avatar className="h-24 w-24 border-2 border-primary">
            <AvatarImage
              src={user.avatarUrl}
              alt={user.name}
              data-ai-hint="user avatar"
            />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-4xl font-bold text-primary">
              {user.name}&apos;s Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account and view your bookings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.href}
                      variant={pathname === link.href ? "secondary" : "ghost"}
                      className="justify-start gap-3"
                      asChild
                    >
                      <Link href={link.href}>
                        <link.icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="justify-start gap-3 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
                <CardDescription>
                  A record of all your past and upcoming trips.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allBookings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-mono text-xs">
                            {booking.ticketId}
                          </TableCell>
                          <TableCell className="font-medium">
                            {booking.from}{" "}
                            <ArrowRight className="inline h-4 w-4" />{" "}
                            {booking.to}
                          </TableCell>
                          <TableCell>
                            {new Date(booking.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "Upcoming"
                                  ? "default"
                                  : booking.status === "Completed"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Ticket
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <p>You have no booking history yet.</p>
                    <Button
                      className="mt-4"
                      asChild
                      style={{
                        backgroundColor: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                      }}
                    >
                      <Link href="/">Book Your First Trip</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}