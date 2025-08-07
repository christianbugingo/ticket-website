"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Users, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RWANDA_DISTRICTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const SearchSchema = z.object({
  departure: z.string().min(1, "Departure location is required."),
  arrival: z.string().min(1, "Arrival location is required."),
  travelDate: z.date({
    required_error: "A travel date is required.",
  }),
  passengers: z.coerce.number().min(1, "At least one passenger is required.").max(50, "Maximum 50 passengers allowed."),
}).refine(data => data.departure !== data.arrival, {
  message: "Departure and arrival locations cannot be the same.",
  path: ["arrival"],
});

interface SearchFormProps {
  onSearch: (data: z.infer<typeof SearchSchema>) => void;
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const form = useForm<z.infer<typeof SearchSchema>>({
    resolver: zodResolver(SearchSchema),
    defaultValues: {
      passengers: 1,
      travelDate: new Date(),
    },
  });

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)}>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              <FormField
                control={form.control}
                name="departure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/>From</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select departure" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RWANDA_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="arrival"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground"/>To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select arrival" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RWANDA_DISTRICTS.map((district) => (
                          <SelectItem key={district} value={district}>{district}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="travelDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-muted-foreground"/>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="passengers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/>Passengers</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Number of passengers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-primary/5 p-4">
            <Button type="submit" className="w-full" size="lg" style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}>
              <Search className="mr-2 h-5 w-5" />
              Search Buses
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
