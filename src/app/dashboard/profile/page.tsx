
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, Ticket, LogOut, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from 'next/navigation';

// In a real application, this data would come from your authentication context or an API call.
const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    initials: "JD",
    avatarUrl: "https://placehold.co/100x100.png",
    memberSince: "January 2024",
    phoneNumber: "0788123456",
    homeAddress: "KG 123 St, Kigali",
    dateOfBirth: "1990-05-15"
};

export default function ProfilePage() {
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
                    {/* Left Sidebar for Navigation */}
                    <div className="lg:col-span-1">
                        <Card>
                             <CardContent className="p-2">
                               <nav className="flex flex-col gap-1">
                                    {navLinks.map(link => (
                                        <Button key={link.href} variant={pathname.startsWith(link.href) && link.href !== "/dashboard" ? "secondary" : pathname === link.href ? "secondary" : "ghost"} className="justify-start gap-3" asChild>
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

                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <CardTitle>User Profile</CardTitle>
                                    <CardDescription>Your personal information.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/dashboard/settings">Edit Profile</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                               <div className="space-y-4">
                                   <div className="flex items-center">
                                       <Mail className="h-5 w-5 text-muted-foreground mr-4"/>
                                       <div>
                                           <div className="text-sm text-muted-foreground">Email</div>
                                           <div className="font-medium">{user.email}</div>
                                       </div>
                                   </div>
                                    <Separator/>
                                    <div className="flex items-center">
                                       <Phone className="h-5 w-5 text-muted-foreground mr-4"/>
                                       <div>
                                           <div className="text-sm text-muted-foreground">Phone Number</div>
                                           <div className="font-medium">{user.phoneNumber}</div>
                                       </div>
                                   </div>
                                    <Separator/>
                                    <div className="flex items-center">
                                       <MapPin className="h-5 w-5 text-muted-foreground mr-4"/>
                                       <div>
                                           <div className="text-sm text-muted-foreground">Home Address</div>
                                           <div className="font-medium">{user.homeAddress}</div>
                                       </div>
                                   </div>
                                   <Separator/>
                                    <div className="flex items-center">
                                       <Calendar className="h-5 w-5 text-muted-foreground mr-4"/>
                                       <div>
                                           <div className="text-sm text-muted-foreground">Date of Birth</div>
                                           <div className="font-medium">{new Date(user.dateOfBirth).toLocaleDateString()}</div>
                                       </div>
                                   </div>
                               </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

