
"use client"

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bus, Clock, PlusCircle, MoreHorizontal, Edit, Trash2, Route } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RWANDA_DISTRICTS } from '@/lib/constants';

const mockJourneys = [
  { id: "JNY001", from: "Kigali", to: "Musanze", departureTime: "08:00", price: 3500, status: "On Time" },
  { id: "JNY002", from: "Kigali", to: "Rubavu", departureTime: "09:30", price: 4000, status: "Delayed" },
  { id: "JNY003", from: "Huye", to: "Kigali", departureTime: "11:00", price: 3000, status: "On Time" },
  { id: "JNY004", from: "Kigali", to: "Nyagatare", departureTime: "14:00", price: 4500, status: "Cancelled" },
]

export default function CompanyDashboardPage() {
  const [journeys, setJourneys] = useState(mockJourneys);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
       <div className="max-w-6xl mx-auto">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Bus className="h-6 w-6"/>
                        Volcano Express Dashboard
                    </CardTitle>
                    <CardDescription>Manage your routes, schedules, and bookings.</CardDescription>
                </div>
                 <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Add New Journey
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle>Add New Journey</DialogTitle>
                        <DialogDescription>
                            Fill in the details for the new transport journey. Click save when you're done.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="from" className="text-right">From</Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select departure" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RWANDA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="to" className="text-right">To</Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select arrival" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {RWANDA_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="departureTime" className="text-right">Time</Label>
                                <Input id="departureTime" type="time" className="col-span-3" />
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="price" className="text-right">Price (RWF)</Label>
                                <Input id="price" type="number" placeholder="e.g. 3500" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button type="submit" onClick={() => setIsDialogOpen(false)}>Save Journey</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Route className="inline h-4 w-4 mr-2" />Route</TableHead>
                            <TableHead><Clock className="inline h-4 w-4 mr-2" />Departure</TableHead>
                            <TableHead>Price (RWF)</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {journeys.map((journey) => (
                            <TableRow key={journey.id}>
                                <TableCell className="font-medium">{journey.from} to {journey.to}</TableCell>
                                <TableCell>{journey.departureTime}</TableCell>
                                <TableCell>{journey.price.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={
                                        journey.status === 'On Time' ? 'secondary'
                                        : journey.status === 'Delayed' ? 'default'
                                        : 'destructive'
                                    }>{journey.status}</Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem><Edit className="mr-2 h-4 w-4"/>Edit Details</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Journey</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
                Showing {journeys.length} active journeys.
            </CardFooter>
        </Card>
       </div>
    </div>
  );
}
