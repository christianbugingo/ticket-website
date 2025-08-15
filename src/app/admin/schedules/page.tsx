// app/admin/schedules/page.tsx
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ScheduleTable } from "@/components/schedule-table";

export const revalidate = 0; // No caching

export default async function SchedulesPage() {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users
  if (!session?.user) {
    redirect("/sign-in");
  }

  // Check admin role - need to fetch user from database to get role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        bus: {
          include: {
            company: true,
          },
        },
        route: {
          select: {
            origin: true,
            destination: true,
          },
        },
      },
      orderBy: {
        departure: "asc",
      },
    });

    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Manage Schedules</h1>
        <ScheduleTable schedules={schedules} />
      </div>
    );
  } catch (error) {
    console.error("Failed to load schedules:", error);
    return (
      <div className="p-4 text-red-600">
        Failed to load schedule data. Please try again later.
      </div>
    );
  }
}
