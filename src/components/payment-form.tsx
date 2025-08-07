"use client";

import type { z } from "zod";
import { useState } from "react";
import { CreditCard, Smartphone, Ticket, Calendar, Users, Bus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Route } from "../app/page";
import type { SearchSchema } from "./search-form";
import { Separator } from "./ui/separator";

interface PaymentFormProps {
  route: Route;
  searchParams: z.infer<typeof SearchSchema>;
  onPay: () => void;
}

export function PaymentForm({ route, searchParams, onPay }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const total = route.price * searchParams.passengers;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Confirm and Pay</CardTitle>
        <CardDescription>Review your trip details and choose a payment method.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-4 text-primary">Trip Summary</h3>
            <div className="space-y-3 text-sm p-4 bg-background rounded-lg border">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Bus className="h-4 w-4"/> Agency</span>
                    <span className="font-medium">{route.agency}</span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Ticket className="h-4 w-4"/> Route</span>
                    <span className="font-medium">{searchParams.departure} to {searchParams.arrival}</span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4"/> Date</span>
                    <span className="font-medium">{searchParams.travelDate.toLocaleDateString()} at {route.departureTime}</span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4"/> Passengers</span>
                    <span className="font-medium">{searchParams.passengers}</span>
                </div>
            </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">Payment Method</h3>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <RadioGroupItem value="momo" id="momo" className="peer sr-only" />
              <Label htmlFor="momo" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <Smartphone className="mb-3 h-6 w-6" />
                MTN Mobile Money
              </Label>
            </div>
            <div>
              <RadioGroupItem value="card" id="card" className="peer sr-only" />
              <Label htmlFor="card" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                <CreditCard className="mb-3 h-6 w-6" />
                Credit Card
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-6 bg-primary/5">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>Total:</span>
          <span className="text-primary">{total.toLocaleString()} RWF</span>
        </div>
        <Button onClick={onPay} size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
          Pay Now
        </Button>
      </CardFooter>
    </Card>
  );
}
