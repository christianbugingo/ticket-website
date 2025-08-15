"use client";

import { useState } from "react";
import type { z } from "zod";
import { Bus, ArrowLeft } from "lucide-react";
import { SearchForm, type SearchSchema } from "@/components/search-form";
import { RouteResults } from "@/components/route-results";
import { AIRecommendations } from "@/components/ai-recommendations";
import { PaymentForm } from "@/components/payment-form";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export type Route = {
  id: string;
  agency: string;
  agencyLogoUrl: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
  scheduleId: number;
  busId: number;
  routeId: number | null;
};

type Step = "search" | "results" | "payment" | "confirmed";

export default function Home() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("search");
  const [searchParams, setSearchParams] = useState<z.infer<
    typeof SearchSchema
  > | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (data: z.infer<typeof SearchSchema>) => {
    setIsLoading(true);
    try {
      setSearchParams(data);
      const searchString = `${data.departure} to ${
        data.arrival
      } on ${data.travelDate.toLocaleDateString()}`;
      setSearchHistory((prev) => [...prev, searchString].slice(-5));

      // Use the API utility for better error handling
      const searchResults = await api.searchRoutes({
        departure: data.departure,
        arrival: data.arrival,
        travelDate: data.travelDate.toISOString().split("T")[0],
        passengers: data.passengers,
      });

      setRoutes(searchResults);
      setStep("results");
    } catch (error) {
      console.error("Search failed:", error);
      toast({
        title: "Search Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to search routes. Please try again.",
        variant: "destructive",
      });
      // Set empty routes on error instead of mock data
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setStep("payment");
  };

  const handlePayment = async (paymentData: {
    paymentMethod: "mtn_mobile_money" | "credit_card";
    paymentDetails: {
      phoneNumber?: string;
      cardNumber?: string;
      expiryDate?: string;
      cvv?: string;
    };
  }) => {
    setIsLoading(true);
    try {
      if (!selectedRoute) return;

      await api.createBooking({
        scheduleId: selectedRoute.scheduleId,
        seatNumber: `A${Math.floor(Math.random() * 50) + 1}`, // Generate random seat for now
        paymentMethod: paymentData.paymentMethod,
        paymentDetails: paymentData.paymentDetails,
      });

      toast({
        title: "Booking Confirmed!",
        description: "Your booking has been successfully created.",
      });

      setStep("confirmed");
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Payment processing failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep("search");
    setSearchParams(null);
    setRoutes([]);
    setSelectedRoute(null);
  };

  const handleGoBack = () => {
    if (step === "payment") setStep("results");
    if (step === "results") setStep("search");
  };

  const renderStep = () => {
    switch (step) {
      case "search":
        return <SearchForm onSearch={handleSearch} isLoading={isLoading} />;
      case "results":
        return (
          <div className="space-y-8">
            <RouteResults
              routes={routes}
              onSelectRoute={handleSelectRoute}
              searchParams={searchParams!}
            />
            <AIRecommendations
              searchParams={searchParams!}
              searchHistory={searchHistory}
            />
          </div>
        );
      case "payment":
        return (
          <PaymentForm
            route={selectedRoute!}
            searchParams={searchParams!}
            onPay={handlePayment}
          />
        );
      case "confirmed":
        return (
          <BookingConfirmation
            route={selectedRoute!}
            searchParams={searchParams!}
            onReset={handleReset}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col items-center text-center mb-8">
          <div className="bg-primary text-primary-foreground rounded-full p-3 mb-4 shadow-lg">
            <Bus className="h-8 w-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary">
            ITIKE
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your trusted bus booking partner in Rwanda.
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="relative">
            {step !== "search" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="absolute -top-10 left-0 flex items-center gap-2 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            {renderStep()}
          </div>
        </main>
      </div>
    </div>
  );
}
