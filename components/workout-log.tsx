"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, PlusCircle, MinusCircle, Search } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { PRESET_EXERCISES } from "@/lib/exercises"

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

interface WorkoutLogProps {
  date?: Date
}

export default function WorkoutLog({ date }: WorkoutLogProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [newExerciseName, setNewExerciseName] = useState<string>("")
  const [open, setOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<string>("")

  // Load exercises for the selected date
  useEffect(() => {
    if (date) {
      const dateKey = date.toISOString().split("T")[0]
      const savedExercises = localStorage.getItem(`workout-${dateKey}`)
      if (savedExercises) {
        setExercises(JSON.parse(savedExercises))
      } else {
        setExercises([])
      }
    }
  }, [date])

  // Save exercises when they change
  useEffect(() => {
    if (date && exercises.length > 0) {
      const dateKey = date.toISOString().split("T")[0]
      localStorage.setItem(`workout-${dateKey}`, JSON.stringify(exercises))
    }
  }, [exercises, date])

  const handleAddExercise = () => {
    const exerciseName = selectedExercise || newExerciseName
    if (exerciseName.trim() === "") return

    setExercises([
      ...exercises,
      {
        id: Date.now().toString(),
        name: exerciseName,
        series: [],
      },
    ])

    setNewExerciseName("")
    setSelectedExercise("")
  }

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id))

    if (date && exercises.length === 1) {
      const dateKey = date.toISOString().split("T")[0]
      localStorage.removeItem(`workout-${dateKey}`)
    }
  }

  const handleAddSeries = (exerciseId: string) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            series: [
              ...exercise.series,
              {
                id: Date.now().toString(),
                reps: 0,
                weight: 0,
              },
            ],
          }
        }
        return exercise
      }),
    )
  }

  const handleRemoveSeries = (exerciseId: string, seriesId: string) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            series: exercise.series.filter((series) => series.id !== seriesId),
          }
        }
        return exercise
      }),
    )
  }

  const handleSeriesChange = (exerciseId: string, seriesId: string, field: "reps" | "weight", value: number) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            series: exercise.series.map((series) => {
              if (series.id === seriesId) {
                return {
                  ...series,
                  [field]: value,
                }
              }
              return series
            }),
          }
        }
        return exercise
      }),
    )
  }

  if (!date) {
    return <div>Selecciona una fecha para registrar tu entrenamiento</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex space-x-2">
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
                    {PRESET_EXERCISES.map((exercise) => (
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
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative w-full">
            <Input
              placeholder="O escribe un ejercicio personalizado"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
            />
          </div>
          <Button onClick={handleAddExercise}>
            <Plus className="mr-2 h-4 w-4" /> Añadir
          </Button>
        </div>
      </div>

      {exercises.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {exercises.map((exercise) => (
            <AccordionItem key={exercise.id} value={exercise.id}>
              <AccordionTrigger className="hover:bg-muted px-4 rounded-md">
                <div className="flex items-center justify-between w-full">
                  <span>{exercise.name}</span>
                  <span className="text-muted-foreground text-sm">
                    {exercise.series.length} {exercise.series.length === 1 ? "serie" : "series"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Button variant="outline" size="sm" onClick={() => handleAddSeries(exercise.id)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Serie
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar Ejercicio
                      </Button>
                    </div>

                    {exercise.series.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[80px]">Serie</TableHead>
                            <TableHead>Repeticiones</TableHead>
                            <TableHead>Peso (kg)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {exercise.series.map((series, index) => (
                            <TableRow key={series.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  value={series.reps || ""}
                                  onChange={(e) =>
                                    handleSeriesChange(
                                      exercise.id,
                                      series.id,
                                      "reps",
                                      Number.parseInt(e.target.value) || 0,
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={series.weight || ""}
                                  onChange={(e) =>
                                    handleSeriesChange(
                                      exercise.id,
                                      series.id,
                                      "weight",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveSeries(exercise.id, series.id)}
                                >
                                  <MinusCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay series registradas para este ejercicio
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          No hay ejercicios registrados para esta fecha
        </div>
      )}
    </div>
  )
}

