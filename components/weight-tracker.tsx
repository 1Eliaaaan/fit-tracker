"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WeightEntry {
  date: string
  weight: number
}

interface WeightTrackerProps {
  date?: Date
}

export default function WeightTracker({ date }: WeightTrackerProps) {
  const [weight, setWeight] = useState<string>("")
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])

  // Load weight history from localStorage
  useEffect(() => {
    const savedWeightHistory = localStorage.getItem("weight-history")
    if (savedWeightHistory) {
      setWeightHistory(JSON.parse(savedWeightHistory))
    }
  }, [])

  // Find weight for current date
  useEffect(() => {
    if (date) {
      const dateKey = date.toISOString().split("T")[0]
      const existingEntry = weightHistory.find((entry) => entry.date === dateKey)
      if (existingEntry) {
        setWeight(existingEntry.weight.toString())
      } else {
        setWeight("")
      }
    }
  }, [date, weightHistory])

  const handleSaveWeight = () => {
    if (!date || !weight) return

    const dateKey = date.toISOString().split("T")[0]
    const weightValue = Number.parseFloat(weight)

    if (isNaN(weightValue)) return

    // Check if we already have an entry for this date
    const existingEntryIndex = weightHistory.findIndex((entry) => entry.date === dateKey)

    if (existingEntryIndex >= 0) {
      // Update existing entry
      const updatedHistory = [...weightHistory]
      updatedHistory[existingEntryIndex].weight = weightValue
      setWeightHistory(updatedHistory)
    } else {
      // Add new entry
      setWeightHistory([...weightHistory, { date: dateKey, weight: weightValue }])
    }
  }

  // Save weight history to localStorage when it changes
  useEffect(() => {
    if (weightHistory.length > 0) {
      localStorage.setItem("weight-history", JSON.stringify(weightHistory))
    }
  }, [weightHistory])

  // Prepare data for chart
  const chartData = [...weightHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
      weight: entry.weight,
    }))

  if (!date) {
    return <div>Selecciona una fecha para registrar tu peso</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="weight">Peso Corporal (kg)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ej: 75.5"
                  />
                  <Button onClick={handleSaveWeight}>Guardar</Button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Registra tu peso semanalmente para un mejor seguimiento de tu progreso.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="font-medium mb-2">Último registro:</div>
            {weightHistory.length > 0 ? (
              <div className="text-3xl font-bold">
                {weightHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].weight} kg
              </div>
            ) : (
              <div className="text-muted-foreground">No hay registros</div>
            )}
          </CardContent>
        </Card>
      </div>

      {chartData.length > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="font-medium mb-4">Progreso de Peso</div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#8884d8" name="Peso (kg)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

