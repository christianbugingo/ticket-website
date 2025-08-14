"use client";

import type { z } from "zod";
import { CheckCircle2, Ticket, Calendar, Users, Bus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Route } from "../app/page";
import type { SearchSchema } from "./search-form";
import { Separator } from "./ui/separator";

interface BookingConfirmationProps {
  route: Route;
  searchParams: z.infer<typeof SearchSchema>;
  onReset: () => void;
}

export function BookingConfirmation({ route, searchParams, onReset }: BookingConfirmationProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl animate-in fade-in-50 zoom-in-95">
      <CardHeader className="text-center bg-primary/5 p-8">
        <div className="mx-auto bg-green-100 text-green-700 rounded-full p-3 w-fit">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl mt-4">Booking Confirmed!</CardTitle>
        <CardDescription>Your ticket has been sent to your email and SMS.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <h3 className="text-lg font-semibold mb-4 text-primary">Your Trip Details</h3>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4"/> Agency</span>
            <span className="font-medium">{route.agency}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2"><Ticket className="h-4 w-4"/> Route</span>
            <span className="font-medium">{searchParams.departure} to {searchParams.arrival}</span>
          </div>
           <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Date & Time</span>
            <span className="font-medium">{searchParams.travelDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {route.departureTime}</span>
          </div>
           <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Passengers</span>
            <span className="font-medium">{searchParams.passengers}</span>
          </div>
        </div>
        <Button onClick={onReset} className="w-full mt-8" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          Book Another Trip
        </Button>
      </CardContent>
    </Card>
  );
}
