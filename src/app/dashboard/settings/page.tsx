
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, Ticket, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    initials: "JD",
    avatarUrl: "https://placehold.co/100x100.png",
    phoneNumber: "0788123456",
    homeAddress: "KG 123 St"
};

const settingsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
  homeAddress: z.string().min(5, "Home address must be at least 5 characters."),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
}).refine(data => {
    if (data.newPassword && !data.currentPassword) return false;
    return true;
}, {
    message: "Current password is required to set a new one.",
    path: ["currentPassword"],
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AccountSettingsPage() {
    const pathname = usePathname();
    const { toast } = useToast();

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            fullName: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            homeAddress: user.homeAddress,
        }
    });

    function onSubmit(data: SettingsFormValues) {
        console.log(data);
        toast({
            title: "Settings Updated!",
            description: "Your account details have been successfully saved.",
        });
    }

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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your personal details here.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="homeAddress" render={({ field }) => (
                                            <FormItem><FormLabel>Home Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Leave blank if you don't want to change it.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={form.control} name="currentPassword" render={({ field }) => (
                                            <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="newPassword" render={({ field }) => (
                                            <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                                
                                <div className="flex justify-end">
                                    <Button type="submit">Save Changes</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
}
