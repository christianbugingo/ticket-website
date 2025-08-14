// components/route-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import { Route } from "@prisma/client"

interface RouteTableProps {
  routes: (Route & {
    busCompany: {
      name: string
    }
  })[]
}

export function RouteTable({ routes }: RouteTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Origin</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Distance (km)</TableHead>
          <TableHead>Duration (hrs)</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {routes.map((route) => (
          <TableRow key={route.id}>
            <TableCell className="font-medium">{route.origin}</TableCell>
            <TableCell>{route.destination}</TableCell>
            <TableCell>{route.distance}</TableCell>
            <TableCell>{route.duration}</TableCell>
            <TableCell>{route.busCompany.name}</TableCell>
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