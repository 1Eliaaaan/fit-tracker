"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutLog from "@/components/workout-log"
import WeightTracker from "@/components/weight-tracker"
import ProgressTracker from "@/components/progress-tracker"
import { ThemeToggle } from "@/components/theme-toggle"
import { Dumbbell, LogOut, BarChart3, CalendarIcon } from "lucide-react"

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  if (!isClient) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-10 bg-background">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FitTrack</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <button
            className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
            onClick={() => {
              localStorage.removeItem("isLoggedIn")
              router.push("/login")
            }}
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </header>
      <main className="flex-1 container py-6 md:py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Mi Progreso</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Calendario
              </CardTitle>
              <CardDescription>Selecciona una fecha para ver o registrar tu entrenamiento</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                {date
                  ? date.toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Selecciona una fecha"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="workout" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="workout" className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    <span className="hidden sm:inline">Entrenamiento</span>
                  </TabsTrigger>
                  <TabsTrigger value="weight" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Peso Corporal</span>
                  </TabsTrigger>
                  <TabsTrigger value="progress" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Progreso</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="workout">
                  <WorkoutLog date={date} />
                </TabsContent>
                <TabsContent value="weight">
                  <WeightTracker date={date} />
                </TabsContent>
                <TabsContent value="progress">
                  <ProgressTracker />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container">FitTrack &copy; {new Date().getFullYear()} - Tu compañero de entrenamiento</div>
      </footer>
    </div>
  )
}

