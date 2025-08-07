"use client";

import { useState, useEffect } from "react";
import type { z } from "zod";
import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { routeRecommendation, type RouteRecommendationOutput } from "@/ai/flows/route-recommendations";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchSchema } from "./search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AIRecommendationsProps {
  searchParams: z.infer<typeof SearchSchema>;
  searchHistory: string[];
}

export function AIRecommendations({ searchParams, searchHistory }: AIRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<RouteRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        const input = {
          departureDistrict: searchParams.departure,
          arrivalDistrict: searchParams.arrival,
          travelDate: searchParams.travelDate.toISOString().split("T")[0],
          numberOfPassengers: searchParams.passengers,
          searchHistory,
          // In a real app, this would be dynamic data from an API
          busAvailability: "Most buses are full in the morning, but seats are available in the afternoon. Weekend travel is heavy.",
        };
        const result = await routeRecommendation(input);
        setRecommendations(result);
      } catch (e) {
        console.error("Failed to get AI recommendations:", e);
        setError("Could not load AI recommendations at this time.");
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [searchParams, searchHistory]);

  return (
    <Card className="bg-card/50 border-primary/20 border-dashed">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-primary/10 text-primary p-2 rounded-full">
            <Lightbulb className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-primary">AI Recommendations</CardTitle>
            <CardDescription>Alternative routes and times based on your search.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
             <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {recommendations && recommendations.recommendations.length > 0 && (
          <ul className="space-y-4">
            {recommendations.recommendations.map((rec, index) => (
              <li key={index} className="p-4 bg-background rounded-lg shadow-sm border border-border">
                <p className="font-semibold text-primary">{rec.route} at {rec.time}</p>
                <p className="text-sm text-muted-foreground">{rec.reason}</p>
              </li>
            ))}
          </ul>
        )}
         {recommendations && recommendations.recommendations.length === 0 && (
            <p className="text-muted-foreground text-center">No alternative recommendations found.</p>
        )}
      </CardContent>
    </Card>
  );
}
