# 🏋️ FitTrack v2 — Tu Compañero de Entrenamiento Inteligente

FitTrack v2 es una aplicación moderna y utilitaria para el seguimiento de entrenamientos, nutrición y descanso en tiempo real, diseñada tanto para móvil como para escritorio, con acompañamiento interactivo, cronómetro a prueba de reinicios de RAM, análisis y embeddings semánticos con OpenAI.

---

## ⚡ Novedades y Módulos

### 1. 🛡️ Flujo de Entrenamiento a Prueba de Cierres de RAM
- **Cronómetro basado en Timestamp**: En vez de almacenar contadores volátiles en memoria, se guarda `restStartedAt` con marcas de tiempo en `localStorage`. Si el sistema operativo de tu celular cierra el navegador por falta de RAM, al volver a abrirlo calcula la diferencia de tiempo real y continúa el conteo exacto sin perder un solo segundo.
- **Persistencia total de sesión**: Si el teléfono se apaga o recargas la página, vuelves exactamente a la misma fase (`executing_set`, `resting`, `selecting_exercise`), con las series y valores previos intactos.
- **Edición granular de series finalizadas**: Corrige reps, peso o tiempo de descanso de series previas sin reactivar el cronómetro.

### 2. 📅 Historial con Vista de Calendario y Lista
- **Selector de Vista**: Cambia entre **Lista Semanal** y **Calendario Mensual**.
- **Días entrenados resaltados**: Cada día con sesión completada se destaca con borde verde lima e ícono de fuego 🔥.
- **Detalle al toque**: Toca cualquier día para ver las sesiones, volumen acumulado, lista de ejercicios y análisis de IA.

### 3. 🍲 Nutrición & Comida (Chat Libre + IA Estructurada + Embeddings)
- **Registro conversacional**: Escribe lo que comiste en lenguaje natural (ej. *"Hoy de almuerzo comí 200g de arroz, 150g de carne molida, ensalada de tomate y jugo de maracuyá"*).
- **Extracción inteligente**: La IA detecta el tipo de comida (*desayuno, almuerzo, merienda, cena, snack*), extrae los ingredientes individuales, porciones estimadas, calorías y macronutrientes (P/C/G).
- **Embeddings semánticos**: Cada comida genera un vector en `pgvector` (`text-embedding-3-small`) para memoria semántica a largo plazo.
- **Feedback bajo demanda**: Botón **`✨ Pedir Análisis IA`** para evaluar tu ingesta calórica y proteica contra tus objetivos solo cuando lo solicites, sin gastar tokens innecesarios.

### 4. 🌙 Descanso & Sueño (Recuperación)
- **Registro diario**: Horas de sueño (con controles `+` y `−`), calificación de calidad (Mala, Regular, Buena, Excelente), hora de acostarse/despertar y notas de descanso.
- **Métricas**: Promedio de horas de los últimos 7 días e historial de las últimas 2 semanas.
- **Feedback de recuperación bajo demanda**: Botón **`✨ Pedir Análisis IA`** que correlaciona tu descanso con la fatiga y el volumen de entrenamiento muscular.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS v3 (tema oscuro industrial zinc-950 con acento lima eléctrica `#a3e635`) + Framer Motion
- **Iconografía**: Lucide React
- **Estado Global**: Zustand (con middleware persist para rescate de sesión y cronómetro)
- **Consultas & Caché**: TanStack Query (React Query)
- **Base de Datos & Auth**: Supabase (PostgreSQL + RLS + pgvector)
- **Inteligencia Artificial**: OpenAI GPT-4o-mini + text-embedding-3-small via Supabase Edge Functions

---

## 🗄️ Configuración de Base de Datos en Supabase

1. Ejecuta primero `supabase/schema_v2.sql` (tablas de perfiles, sesiones, series y vistas).
2. Ejecuta `supabase/schema_v3_nutrition_sleep.sql` (tablas de nutrición con pgvector, sueño y feedback de IA).

---

## 🤖 Supabase Edge Functions

Para desplegar las 3 funciones en tu proyecto:
```bash
npx supabase functions deploy generate-workout-summary --no-verify-jwt
npx supabase functions deploy parse-meal --no-verify-jwt
npx supabase functions deploy ai-advisor --no-verify-jwt
```

Y asegurar tu OpenAI API Key en el servidor:
```bash
npx supabase secrets set OPENAI_API_KEY=tu_clave_de_openai
```
