"use client";

import { useState, useEffect } from "react";
import type { z } from "zod";
import { Lightbulb, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchSchema } from "./search-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface AIRecommendationsProps {
  searchParams: z.infer<typeof SearchSchema>;
  searchHistory: string[];
}

// Mock recommendations data for now
const mockRecommendations = {
  recommendations: [
    {
      route: "Take the express route via main highway",
      reason: "Fastest route with best road conditions",
      estimatedTime: "2.5 hours",
    },
    {
      route: "Consider early morning departure (6:00 AM)",
      reason: "Less traffic and better punctuality",
      estimatedTime: "Reduced delays",
    },
    {
      route: "Book premium seats for better comfort",
      reason: "Long journey route with enhanced amenities",
      estimatedTime: "Same duration, better experience",
    },
  ],
  travelTips: [
    "Carry valid ID for intercity travel",
    "Arrive 15 minutes before departure",
    "Keep your ticket handy for verification",
  ],
};

export function AIRecommendations({
  searchParams,
  searchHistory,
}: AIRecommendationsProps) {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  if (loading) {
    return (
      <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <CardTitle className="text-lg">AI Travel Recommendations</CardTitle>
          </div>
          <CardDescription>
            Getting personalized recommendations for your journey...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>Recommendations Unavailable</AlertTitle>
        <AlertDescription>
          Unable to load AI recommendations at the moment. Please try again
          later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-primary/5">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">AI Travel Recommendations</CardTitle>
        </div>
        <CardDescription>
          Smart suggestions for your journey from {searchParams.departure} to{" "}
          {searchParams.arrival}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Route Recommendations */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Route Insights
            </h4>
            <div className="space-y-3">
              {mockRecommendations.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-3 bg-background/50 rounded-lg border border-accent/10"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="text-xs">
                      Tip {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{rec.route}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {rec.reason}
                      </p>
                      <p className="text-xs text-accent mt-1">
                        {rec.estimatedTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Travel Tips */}
          <div>
            <h4 className="font-medium mb-3">Travel Tips</h4>
            <div className="space-y-2">
              {mockRecommendations.travelTips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                  {tip}
                </div>
              ))}
            </div>
          </div>

          {/* Based on search history */}
          {searchHistory.length > 0 && (
            <div className="pt-3 border-t border-accent/10">
              <p className="text-xs text-muted-foreground">
                Based on your recent searches and travel patterns
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
