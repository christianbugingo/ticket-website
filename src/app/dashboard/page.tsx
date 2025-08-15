"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  User,
  Settings,
  Ticket,
  LogOut,
  ArrowRight,
  Calendar,
  Bus,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  avatarUrl: string;
  memberSince: string;
  totalBookings: number;
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
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;

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
          setUpcomingBookings(bookingsData.upcoming || []);
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
            You need to sign in to access your dashboard.
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
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
              Welcome back, {user.name}!
            </h1>
            <p className="text-muted-foreground mt-1">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar for Navigation */}
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

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Upcoming Trips</CardTitle>
                <CardDescription>
                  Here are your bookings for upcoming travels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <Card key={booking.id} className="bg-background">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 font-bold text-lg">
                              <span>{booking.from}</span>
                              <ArrowRight className="h-5 w-5 text-primary" />
                              <span>{booking.to}</span>
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1.5">
                                <Bus className="h-4 w-4" />
                                {booking.agency}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(booking.date).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" }
                                )}{" "}
                                at {booking.time}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href="/dashboard/booking-history">
                              View Ticket
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    <Button
                      className="w-full mt-4"
                      asChild
                      style={{
                        backgroundColor: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                      }}
                    >
                      <Link href="/">Book Another Trip</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <p>You have no upcoming bookings.</p>
                    <Button
                      className="mt-4"
                      asChild
                      style={{
                        backgroundColor: "hsl(var(--accent))",
                        color: "hsl(var(--accent-foreground))",
                      }}
                    >
                      <Link href="/">Book a Trip</Link>
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
