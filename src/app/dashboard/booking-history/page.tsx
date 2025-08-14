
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, Ticket, LogOut, ArrowRight, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    initials: "JD",
    avatarUrl: "https://placehold.co/100x100.png",
};

const allBookings = [
    { id: "TKT-123XYZ", from: "Kigali", to: "Musanze", date: "2024-08-15", amount: 3500, status: "Upcoming" },
    { id: "TKT-456ABC", from: "Huye", to: "Kigali", date: "2024-08-22", amount: 3000, status: "Upcoming" },
    { id: "TKT-789DEF", from: "Kigali", to: "Rubavu", date: "2024-07-10", amount: 4000, status: "Completed" },
    { id: "TKT-101GHI", from: "Nyagatare", to: "Kigali", date: "2024-06-05", amount: 4500, status: "Completed" },
    { id: "TKT-112JKL", from: "Kigali", to: "Huye", date: "2024-05-20", amount: 3000, status: "Cancelled" },
];

export default function BookingHistoryPage() {
    const pathname = usePathname();

    const navLinks = [
        { href: "/dashboard", label: "Dashboard", icon: User },
        { href: "/dashboard/booking-history", label: "Booking History", icon: Ticket },
        { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                 <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-4xl font-bold text-primary">{user.name}'s Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage your account and view your bookings.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <Card>
                             <CardContent className="p-2">
                               <nav className="flex flex-col gap-1">
                                    {navLinks.map(link => (
                                        <Button key={link.href} variant={pathname === link.href ? "secondary" : "ghost"} className="justify-start gap-3" asChild>
                                           <Link href={link.href}>
                                                <link.icon className="h-5 w-5" />
                                                {link.label}
                                           </Link>
                                        </Button>
                                    ))}
                                    <Separator className="my-2"/>
                                    <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive">
                                        <LogOut className="h-5 w-5"/>
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
                                <CardDescription>A record of all your past and upcoming trips.</CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                                <TableCell className="font-mono text-xs">{booking.id}</TableCell>
                                                <TableCell className="font-medium">{booking.from} <ArrowRight className="inline h-4 w-4"/> {booking.to}</TableCell>
                                                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        booking.status === 'Upcoming' ? 'default'
                                                        : booking.status === 'Completed' ? 'secondary'
                                                        : 'destructive'
                                                    }>{booking.status}</Badge>
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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
