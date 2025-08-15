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
import { User, Settings, Ticket, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  initials: string;
  avatarUrl: string;
  memberSince: string;
  homeAddress?: string;
}

const settingsSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phoneNumber: z.string().min(10, "Please enter a valid phone number."),
    homeAddress: z
      .string()
      .min(5, "Home address must be at least 5 characters."),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message: "Current password is required to set a new one.",
      path: ["currentPassword"],
    }
  );

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      homeAddress: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);

          // Update form with user data
          form.reset({
            fullName: userData.name || "",
            email: userData.email || "",
            phoneNumber: userData.phone || "",
            homeAddress: userData.homeAddress || "KG 123 St, Kigali",
            currentPassword: "",
            newPassword: "",
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, form, toast]);

  async function onSubmit(data: SettingsFormValues) {
    setIsSubmitting(true);
    try {
      // Update profile
      const profileResponse = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          name: data.fullName,
          phone: data.phoneNumber,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const updatedUser = await profileResponse.json();
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));

      // Update password if provided
      if (data.newPassword && data.currentPassword) {
        const passwordResponse = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "password",
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.error || "Failed to update password");
        }

        // Clear password fields
        form.setValue("currentPassword", "");
        form.setValue("newPassword", "");
      }

      toast({
        title: "Success!",
        description: "Your account settings have been updated.",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update settings. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

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
            You need to sign in to access your settings.
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
          <p className="text-muted-foreground">Loading your settings...</p>
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
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your personal details below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="homeAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Leave blank if you don&apos;t want to change it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
