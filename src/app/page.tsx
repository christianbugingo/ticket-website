"use client";

import { useState } from "react";
import type { z } from "zod";
import { Bus, Lightbulb, Ticket, CheckCircle2, ArrowLeft } from "lucide-react";
import { SearchForm, type SearchSchema } from "@/components/search-form";
import { RouteResults } from "@/components/route-results";
import { AIRecommendations } from "@/components/ai-recommendations";
import { PaymentForm } from "@/components/payment-form";
import { BookingConfirmation } from "@/components/booking-confirmation";
import { Button } from "@/components/ui/button";

export type Route = {
  id: string;
  agency: string;
  agencyLogoUrl: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  availableSeats: number;
};

type Step = "search" | "results" | "payment" | "confirmed";

export default function Home() {
  const [step, setStep] = useState<Step>("search");
  const [searchParams, setSearchParams] = useState<z.infer<
    typeof SearchSchema
  > | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const MOCK_ROUTES: Route[] = [
    {
      id: "1",
      agency: "Volcano Express",
      agencyLogoUrl: "https://placehold.co/40x40.png",
      departureTime: "08:00",
      arrivalTime: "10:30",
      duration: "2h 30m",
      price: 3500,
      availableSeats: 15,
    },
    {
      id: "2",
      agency: "Horizon Express",
      agencyLogoUrl: "https://placehold.co/40x40.png",
      departureTime: "09:30",
      arrivalTime: "12:00",
      duration: "2h 30m",
      price: 3400,
      availableSeats: 5,
    },
    {
      id: "3",
      agency: "Kigali Bus Services",
      agencyLogoUrl: "https://placehold.co/40x40.png",
      departureTime: "11:00",
      arrivalTime: "13:45",
      duration: "2h 45m",
      price: 3600,
      availableSeats: 22,
    },
    {
      id: "4",
      agency: "Virunga Express",
      agencyLogoUrl: "https://placehold.co/40x40.png",
      departureTime: "14:00",
      arrivalTime: "16:30",
      duration: "2h 30m",
      price: 3500,
      availableSeats: 10,
    },
  ];

  const handleSearch = async (data: z.infer<typeof SearchSchema>) => {
    setSearchParams(data);
    const searchString = `${data.departure} to ${
      data.arrival
    } on ${data.travelDate.toLocaleDateString()}`;
    setSearchHistory((prev) => [...prev, searchString].slice(-5)); // Keep last 5 searches

    try {
      // Call the real API
      const searchParams = new URLSearchParams({
        departure: data.departure,
        arrival: data.arrival,
        travelDate: data.travelDate.toISOString(),
        passengers: data.passengers.toString(),
      });

      const response = await fetch(`/api/routes/search?${searchParams}`);
      if (response.ok) {
        const apiRoutes = await response.json();
        setRoutes(apiRoutes);
      } else {
        // Fallback to mock data if API fails
        console.error("API call failed, using mock data");
        setRoutes(
          MOCK_ROUTES.map((r) => ({
            ...r,
            price: r.price + Math.floor(Math.random() * 500 - 250),
          }))
        );
      }
    } catch (error) {
      // Fallback to mock data if API fails
      console.error("API call failed, using mock data:", error);
      setRoutes(
        MOCK_ROUTES.map((r) => ({
          ...r,
          price: r.price + Math.floor(Math.random() * 500 - 250),
        }))
      );
    }

    setStep("results");
  };

  const handleSelectRoute = (route: Route) => {
    setSelectedRoute(route);
    setStep("payment");
  };

  const handlePayment = () => {
    // In a real app, payment processing would happen here.
    setStep("confirmed");
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
        return <SearchForm onSearch={handleSearch} />;
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

  const getStepInfo = () => {
    switch (step) {
      case "search":
        return { icon: <Bus className="h-6 w-6" />, title: "Search for a Bus" };
      case "results":
        return {
          icon: <Ticket className="h-6 w-6" />,
          title: "Available Routes",
        };
      case "payment":
        return {
          icon: <Lightbulb className="h-6 w-6" />,
          title: "Complete Your Booking",
        };
      case "confirmed":
        return {
          icon: <CheckCircle2 className="h-6 w-6" />,
          title: "Booking Confirmed",
        };
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
