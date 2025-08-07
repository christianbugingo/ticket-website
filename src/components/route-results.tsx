"use client";

import type { z } from "zod";
import Image from "next/image";
import { Clock, Users, Tag, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Route } from "../app/page";
import type { SearchSchema } from "./search-form";
import { Badge } from "./ui/badge";

interface RouteResultsProps {
  routes: Route[];
  onSelectRoute: (route: Route) => void;
  searchParams: z.infer<typeof SearchSchema>;
}

export function RouteResults({ routes, onSelectRoute, searchParams }: RouteResultsProps) {
  return (
    <div className="space-y-6">
       <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5">
            <CardTitle className="text-xl">
                {searchParams.departure} <ArrowRight className="inline mx-2 h-5 w-5"/> {searchParams.arrival}
            </CardTitle>
            <CardDescription>
                Showing results for {searchParams.passengers} passenger(s) on {searchParams.travelDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardDescription>
        </CardHeader>
      </Card>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No routes found for the selected criteria.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <Card key={route.id} className="transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center p-4 gap-4">
                <div className="flex items-center gap-4 col-span-1">
                  <Image src={route.agencyLogoUrl} alt={route.agency} width={40} height={40} className="rounded-full" data-ai-hint="logo" />
                  <span className="font-bold">{route.agency}</span>
                </div>

                <div className="flex justify-around items-center col-span-1 md:col-span-2 text-center">
                    <div>
                        <p className="text-lg font-bold">{route.departureTime}</p>
                        <p className="text-sm text-muted-foreground">{searchParams.departure}</p>
                    </div>
                     <div className="flex flex-col items-center">
                        <Clock className="h-4 w-4 text-muted-foreground mb-1"/>
                        <p className="text-xs text-muted-foreground">{route.duration}</p>
                    </div>
                    <div>
                        <p className="text-lg font-bold">{route.arrivalTime}</p>
                        <p className="text-sm text-muted-foreground">{searchParams.arrival}</p>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end text-center md:text-right col-span-1">
                    <p className="text-xl font-bold text-primary">{route.price.toLocaleString()} RWF</p>
                    <p className="text-xs text-muted-foreground">per passenger</p>
                </div>
              </div>
              <CardFooter className="bg-primary/5 p-3 flex justify-between items-center">
                <Badge variant={route.availableSeats < 10 ? 'destructive' : 'secondary'} className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> {route.availableSeats} seats left
                </Badge>
                <Button onClick={() => onSelectRoute(route)} style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
                  Book Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
