"use client";

import type { z } from "zod";
import { useState } from "react";
import {
  CreditCard,
  Smartphone,
  Ticket,
  Calendar,
  Users,
  Bus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { Route } from "../app/page";
import type { SearchSchema } from "./search-form";
import { Separator } from "./ui/separator";

interface PaymentFormProps {
  route: Route;
  searchParams: z.infer<typeof SearchSchema>;
  onPay: (paymentData: {
    paymentMethod: "mtn_mobile_money" | "credit_card";
    paymentDetails: {
      phoneNumber?: string;
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }) => void;
}

export function PaymentForm({ route, searchParams, onPay }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<
    "mtn_mobile_money" | "credit_card"
  >("mtn_mobile_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const total = route.price * searchParams.passengers;

  const handlePayment = () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const paymentDetails =
      paymentMethod === "mtn_mobile_money"
        ? { phoneNumber }
        : { cardNumber, expiryDate, cvv };

    onPay({
      paymentMethod,
      paymentDetails,
    });
  };

  const isFormValid =
    paymentMethod === "mtn_mobile_money"
      ? phoneNumber.length >= 10
      : cardNumber.length >= 16 && expiryDate.length >= 5 && cvv.length >= 3;

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Confirm and Pay</CardTitle>
        <CardDescription>
          Review your trip details and choose a payment method.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Trip Summary
          </h3>
          <div className="space-y-3 text-sm p-4 bg-background rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Bus className="h-4 w-4" /> Agency
              </span>
              <span className="font-medium">{route.agency}</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Route
              </span>
              <span className="font-medium">
                {searchParams.departure} to {searchParams.arrival}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Date
              </span>
              <span className="font-medium">
                {searchParams.travelDate.toLocaleDateString()} at{" "}
                {route.departureTime}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" /> Passengers
              </span>
              <span className="font-medium">{searchParams.passengers}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Payment Method
          </h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              setPaymentMethod(value as "mtn_mobile_money" | "credit_card")
            }
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <RadioGroupItem
                value="mtn_mobile_money"
                id="momo"
                className="peer sr-only"
              />
              <Label
                htmlFor="momo"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Smartphone className="mb-3 h-6 w-6" />
                MTN Mobile Money
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="credit_card"
                id="card"
                className="peer sr-only"
              />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <CreditCard className="mb-3 h-6 w-6" />
                Credit Card
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Details */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-primary">
            Payment Details
          </h3>
          {paymentMethod === "mtn_mobile_money" ? (
            <div className="space-y-3">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="07X XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="text"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch p-6 bg-primary/5">
        <div className="flex justify-between items-center text-xl font-bold mb-4">
          <span>Total:</span>
          <span className="text-primary">{total.toLocaleString()} RWF</span>
        </div>
        <Button
          onClick={handlePayment}
          size="lg"
          style={{
            backgroundColor: "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
          }}
          disabled={!isFormValid || isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </CardFooter>
    </Card>
  );
}
