"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Info } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { PRESET_EXERCISES } from "@/lib/exercises"
import { Badge } from "@/components/ui/badge"

interface Series {
  id: string
  reps: number
  weight: number
}

interface Exercise {
  id: string
  name: string
  series: Series[]
}

interface WorkoutData {
  date: string
  exercises: Exercise[]
}

interface ProgressPoint {
  date: string
  formattedDate: string
  maxWeight: number
  avgWeight: number
  totalVolume: number
}

export default function ProgressTracker() {
  const [open, setOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [progressData, setProgressData] = useState<ProgressPoint[]>([])
  const [allExercises, setAllExercises] = useState<string[]>([])
  const [chartMetric, setChartMetric] = useState<"maxWeight" | "avgWeight" | "totalVolume">("maxWeight")

  // Collect all unique exercise names from localStorage
  useEffect(() => {
    const exerciseSet = new Set<string>(PRESET_EXERCISES)

    // Get all keys from localStorage that start with "workout-"
    const workoutKeys = Object.keys(localStorage).filter((key) => key.startsWith("workout-"))

    // Extract all unique exercise names
    workoutKeys.forEach((key) => {
      try {
        const workoutData = JSON.parse(localStorage.getItem(key) || "[]") as Exercise[]
        workoutData.forEach((exercise) => {
          exerciseSet.add(exercise.name)
        })
      } catch (error) {
        console.error("Error parsing workout data:", error)
      }
    })

    setAllExercises(Array.from(exerciseSet).sort())
  }, [])

  // Calculate progress data when an exercise is selected
  useEffect(() => {
    if (!selectedExercise) {
      setProgressData([])
      return
    }

    const workoutKeys = Object.keys(localStorage)
      .filter((key) => key.startsWith("workout-"))
      .sort() // Sort by date

    const progressPoints: ProgressPoint[] = []

    workoutKeys.forEach((key) => {
      try {
        const dateKey = key.replace("workout-", "")
        const workoutData = JSON.parse(localStorage.getItem(key) || "[]") as Exercise[]

        // Find the selected exercise in this workout
        const exerciseData = workoutData.find((ex) => ex.name === selectedExercise)

        if (exerciseData && exerciseData.series.length > 0) {
          // Calculate metrics
          const weights = exerciseData.series.map((s) => s.weight).filter((w) => w > 0)
          const maxWeight = Math.max(...weights, 0)
          const avgWeight = weights.length > 0 ? weights.reduce((sum, w) => sum + w, 0) / weights.length : 0

          // Calculate total volume (weight × reps)
          const totalVolume = exerciseData.series.reduce((sum, s) => {
            return sum + s.weight * s.reps
          }, 0)

          // Format date for display
          const formattedDate = new Date(dateKey).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          })

          progressPoints.push({
            date: dateKey,
            formattedDate,
            maxWeight,
            avgWeight,
            totalVolume,
          })
        }
      } catch (error) {
        console.error("Error calculating progress data:", error)
      }
    })

    setProgressData(progressPoints)
  }, [selectedExercise])

  const getChartLabel = () => {
    switch (chartMetric) {
      case "maxWeight":
        return "Peso Máximo (kg)"
      case "avgWeight":
        return "Peso Promedio (kg)"
      case "totalVolume":
        return "Volumen Total (kg)"
    }
  }

  const getMetricDescription = () => {
    switch (chartMetric) {
      case "maxWeight":
        return "El peso más alto que has levantado en cada sesión de entrenamiento."
      case "avgWeight":
        return "El promedio de peso de todas las series realizadas en cada sesión."
      case "totalVolume":
        return "La suma de (peso × repeticiones) de todas las series, un indicador clave del trabajo total realizado."
    }
  }

  const getProgressTrend = () => {
    if (progressData.length < 2) return null

    const firstPoint = progressData[0][chartMetric]
    const lastPoint = progressData[progressData.length - 1][chartMetric]

    const percentChange = ((lastPoint - firstPoint) / firstPoint) * 100

    if (percentChange > 0) {
      return {
        text: `+${percentChange.toFixed(1)}% de mejora`,
        type: "positive",
      }
    } else if (percentChange < 0) {
      return {
        text: `${percentChange.toFixed(1)}% de disminución`,
        type: "negative",
      }
    } else {
      return {
        text: "Sin cambios",
        type: "neutral",
      }
    }
  }

  const trend = getProgressTrend()

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Seguimiento de Progreso</CardTitle>
          <CardDescription>Selecciona un ejercicio para ver tu progreso a lo largo del tiempo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between w-full md:w-[300px]"
                >
                  {selectedExercise ? selectedExercise : "Seleccionar ejercicio..."}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full md:w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar ejercicio..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron ejercicios.</CommandEmpty>
                    <CommandGroup>
                      {allExercises.map((exercise) => (
                        <CommandItem
                          key={exercise}
                          value={exercise}
                          onSelect={(currentValue) => {
                            setSelectedExercise(currentValue === selectedExercise ? "" : currentValue)
                            setOpen(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", selectedExercise === exercise ? "opacity-100" : "opacity-0")}
                          />
                          {exercise}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={chartMetric === "maxWeight" ? "default" : "outline"}
                onClick={() => setChartMetric("maxWeight")}
                size="sm"
                className="transition-all"
              >
                Peso Máximo
              </Button>
              <Button
                variant={chartMetric === "avgWeight" ? "default" : "outline"}
                onClick={() => setChartMetric("avgWeight")}
                size="sm"
                className="transition-all"
              >
                Peso Promedio
              </Button>
              <Button
                variant={chartMetric === "totalVolume" ? "default" : "outline"}
                onClick={() => setChartMetric("totalVolume")}
                size="sm"
                className="transition-all"
              >
                Volumen Total
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                      <span className="sr-only">Información sobre la métrica</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{getMetricDescription()}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedExercise && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedExercise}</CardTitle>
              {trend && (
                <Badge
                  variant={
                    trend.type === "positive" ? "default" : trend.type === "negative" ? "destructive" : "outline"
                  }
                >
                  {trend.text}
                </Badge>
              )}
            </div>
            <CardDescription>{getChartLabel()} a lo largo del tiempo</CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="formattedDate" padding={{ left: 10, right: 10 }} />
                    <YAxis domain={["auto", "auto"]} />
                    <RechartsTooltip
                      formatter={(value) => [
                        `${value} ${chartMetric === "totalVolume" ? "kg" : "kg"}`,
                        getChartLabel(),
                      ]}
                      labelFormatter={(label) => `Fecha: ${label}`}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={chartMetric}
                      name={getChartLabel()}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "hsl(var(--primary))" }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos suficientes para mostrar el progreso de este ejercicio.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedExercise && progressData.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Historial de {selectedExercise}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Fecha</th>
                    <th className="text-right py-2 px-4">Peso Máximo</th>
                    <th className="text-right py-2 px-4">Peso Promedio</th>
                    <th className="text-right py-2 px-4">Volumen Total</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-2 px-4">{entry.formattedDate}</td>
                      <td className="text-right py-2 px-4">{entry.maxWeight.toFixed(1)} kg</td>
                      <td className="text-right py-2 px-4">{entry.avgWeight.toFixed(1)} kg</td>
                      <td className="text-right py-2 px-4">{entry.totalVolume.toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

