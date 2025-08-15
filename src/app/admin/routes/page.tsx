// app/admin/routes/page.tsx
import { RouteTable } from "@/components/route-table";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function RoutesPage() {
  const session = await getServerSession(authOptions);

  // Only allow admin access
  if (session?.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const routes = await prisma.route.findMany({
    include: {
      company: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      origin: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Routes</h1>
        <Button asChild>
          <Link href="/admin/routes/new">Add New Route</Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <RouteTable routes={routes} />
      </div>
    </div>
  );
}
