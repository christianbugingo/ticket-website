import Image from "next/image";
import { Bus, Target, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            About ITIKE
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Revolutionizing bus travel across Rwanda, one ticket at a time.
          </p>
        </div>

        <div className="mt-12">
          <Image
            src="https://placehold.co/1200x500.png"
            alt="A scenic road in Rwanda"
            width={1200}
            height={600}
            className="rounded-lg shadow-lg"
            data-ai-hint="scenic road rwanda"
          />
        </div>

        <div className="mt-16 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Our Story</h2>
              <p className="mt-4 text-muted-foreground">
                ITIKE was born from a simple idea: to make booking bus tickets in Rwanda as easy and seamless as possible. Frustrated by long queues and uncertain travel plans, our founders envisioned a platform that would connect passengers with bus agencies digitally, providing real-time information, transparent pricing, and a hassle-free booking experience.
              </p>
            </div>
            <div className="flex justify-center">
                <Image src="https://placehold.co/400x300.png" alt="Founders" width={400} height={300} className="rounded-lg" data-ai-hint="team working" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <span className="text-3xl">Our Mission</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                Our mission is to simplify inter-district travel for everyone in Rwanda. We aim to provide a reliable, efficient, and user-friendly platform that empowers travelers and supports local transport businesses. We are committed to leveraging technology to enhance convenience, safety, and accessibility in the public transport sector.
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Why Choose Us?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                        <Bus className="h-8 w-8" />
                    </div>
                    <CardTitle>Wide Network</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    We partner with major bus agencies to cover all districts in Rwanda, offering you the most comprehensive choice of routes and times.
                </CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                        <Users className="h-8 w-8" />
                    </div>
                    <CardTitle>User-Focused</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    From our AI-powered recommendations to our simple booking process, every feature is designed with you in mind.
                </CardContent>
            </Card>
             <Card className="text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
                        <Target className="h-8 w-8" />
                    </div>
                    <CardTitle>Reliability</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Get real-time seat availability and instant confirmations. What you see is what you get.
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
