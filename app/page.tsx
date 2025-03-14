import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Dumbbell, Calendar, LineChart } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-10 bg-background">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">FitTrack</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <ThemeToggle />
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link href="/register">
            <Button variant="default" size="sm">
              Registrarse
            </Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Registra tus entrenamientos y progreso
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Lleva un seguimiento de tus ejercicios, series, repeticiones y peso. Monitorea tu progreso semanal.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8">
                    Comenzar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Registro de Ejercicios</h3>
                <p className="text-center text-muted-foreground">
                  Registra tus ejercicios, series, repeticiones y peso para cada entrenamiento.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Calendario Integrado</h3>
                <p className="text-center text-muted-foreground">
                  Organiza tus entrenamientos por fecha y mantén un registro histórico.
                </p>
              </div>

              <div className="flex flex-col items-center space-y-3 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <LineChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Análisis de Progreso</h3>
                <p className="text-center text-muted-foreground">
                  Visualiza tu progreso a lo largo del tiempo para cada ejercicio específico.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FitTrack. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Términos
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

