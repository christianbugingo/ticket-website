"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, Bus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const busCompanyRegisterSchema = z
  .object({
    companyName: z
      .string()
      .min(2, "Company name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    phone: z.string().min(10, "Phone number must be at least 10 digits."),
    address: z.string().min(10, "Address must be at least 10 characters."),
    licenseNumber: z.string().min(5, "License number is required."),
    description: z.string().optional(),
    contactPersonName: z.string().min(2, "Contact person name is required."),
    contactPersonPhone: z.string().min(10, "Contact person phone is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type BusCompanyRegisterFormValues = z.infer<typeof busCompanyRegisterSchema>;

export default function BusCompanyRegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<BusCompanyRegisterFormValues>({
    resolver: zodResolver(busCompanyRegisterSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      licenseNumber: "",
      description: "",
      contactPersonName: "",
      contactPersonPhone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: BusCompanyRegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bus-company/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.companyName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          licenseNumber: data.licenseNumber,
          description: data.description,
          contactPersonName: data.contactPersonName,
          contactPersonPhone: data.contactPersonPhone,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast({
        title: "Registration submitted!",
        description:
          "Your bus company registration has been submitted for review. We'll contact you soon.",
      });

      router.push("/bus-company/login");
    } catch (error) {
      toast({
        title: "Registration failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-6 shadow-lg">
              <Building className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Partner with ITIKE
            </h1>
            <p className="mt-2 text-muted-foreground">
              Register your bus company to start offering your services on our
              platform
            </p>
          </div>

          {/* Registration Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bus className="h-5 w-5" />
                Company Registration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Fill in your company details to get started
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Company Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ABC Bus Company"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="licenseNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>License Number *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="LIC123456"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="info@company.com"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Phone *</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="0781234567"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Address *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Kigali, Rwanda"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your bus company..."
                              {...field}
                              disabled={isLoading}
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Contact Person
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPersonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPersonPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person Phone *</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="0787654321"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Account Security */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">
                      Account Security
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create a strong password"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                  disabled={isLoading}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  placeholder="Confirm your password"
                                  {...field}
                                  disabled={isLoading}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  disabled={isLoading}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting Registration...
                      </div>
                    ) : (
                      "Submit Registration"
                    )}
                  </Button>
                </form>
              </Form>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <span className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <Link
                  href="/bus-company/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in here
                </Link>
              </div>

              {/* Back to main site */}
              <div className="mt-8 pt-4 border-t border-muted text-center">
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to ITIKE
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
