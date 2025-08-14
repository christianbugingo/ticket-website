// lib/types.ts
import { Schedule, Route, Bus, BusCompany } from "@prisma/client"

export type ScheduleWithRelations = Schedule & {
  route: Route | null
  bus: Bus & {
    company: BusCompany
  }
}