// components/schedule-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2,Bus } from "lucide-react"
import { ScheduleWithRelations } from "@/lib/types" // We'll define this type next
import { Bus as BusType } from "@prisma/client"

interface ScheduleTableProps {
  schedules: ScheduleWithRelations[]
  buses:  BusType[]
}

export function ScheduleTable({ schedules }: ScheduleTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Route</TableHead>
          <TableHead>Bus</TableHead>
          <TableHead>Departure</TableHead>
          <TableHead>Arrival</TableHead>
          <TableHead>Price (RWF)</TableHead>
          <TableHead>Seats Available</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.map((schedule) => (
          <TableRow key={schedule.id}>
            <TableCell className="font-medium">
              {schedule.route?.origin} → {schedule.route?.destination}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-muted-foreground" />
                {schedule.bus.plateNumber}
              </div>
            </TableCell>
            <TableCell>
              {new Date(schedule.departure).toLocaleString()}
            </TableCell>
            <TableCell>
              {new Date(schedule.arrival).toLocaleString()}
            </TableCell>
            <TableCell>{schedule.price.toLocaleString()}</TableCell>
            <TableCell>{schedule.availableSeats}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}