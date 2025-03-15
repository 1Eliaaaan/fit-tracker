'use client';

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Dumbbell, BarChart2, Calendar, LineChart, Instagram, Twitter, Mail } from "lucide-react";

// Componente de Característica
const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <motion.div 
    className="bg-[#222222] p-6 rounded-xl border border-[#333333] flex flex-col items-center text-center"
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="mb-4 text-[#00C4B4]">
      <Icon size={32} />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

// Componente de Testimonio
const Testimonial = ({ quote, author, role }: { quote: string, author: string, role: string }) => (
  <motion.div 
    className="bg-[#222222] p-6 rounded-xl border border-[#333333]"
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <p className="text-gray-300 italic mb-4">"{quote}"</p>
    <div className="flex items-center">
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-[#00C4B4] mr-3 flex items-center justify-center text-white font-bold">
        {author.charAt(0)}
      </div>
      <div>
        <p className="font-semibold text-white">{author}</p>
        <p className="text-gray-400 text-sm">{role}</p>
      </div>
    </div>
  </motion.div>
);

// Capturas de pantalla simuladas de la aplicación
const Screenshot = ({ title }: { title: string }) => (
  <div className="bg-[#2A2A2A] rounded-lg overflow-hidden border border-[#333333] shadow-xl">
    <div className="h-6 bg-[#333333] flex items-center px-4">
      <div className="flex space-x-2">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
      </div>
    </div>
    <div className="p-4 flex items-center justify-center h-40">
      <p className="text-[#00C4B4] text-center">{title}</p>
    </div>
  </div>
);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1A1A1A] font-['Poppins',sans-serif] text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 md:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00C4B4]/10 to-transparent opacity-20"></div>
        </div>
        
        <div className="z-10 max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#00C4B4] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Fit Tracker: Tu Compañero de Entrenamiento Definitivo
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Registra, analiza y optimiza tus entrenamientos con facilidad.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link href="/login">
              <motion.button 
                className="bg-[#00C4B4] hover:bg-[#00A396] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg shadow-[#00C4B4]/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                ¡Empieza Hoy!
              </motion.button>
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="animate-bounce">
            <svg className="h-6 w-6 text-gray-400" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-[#131313]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Funcionalidades Principales</h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Diseñado para ayudarte a maximizar tus entrenamientos con herramientas intuitivas y poderosas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={Dumbbell} 
              title="Registro Detallado de Ejercicios" 
              description="Anota cada serie y repetición con precisión."
            />
            <FeatureCard 
              icon={LineChart} 
              title="Dashboard Intuitivo" 
              description="Visualiza tu progreso en un solo vistazo."
            />
            <FeatureCard 
              icon={BarChart2} 
              title="Estadísticas Personalizadas" 
              description="Descubre tus fortalezas y áreas de mejora."
            />
            <FeatureCard 
              icon={Calendar} 
              title="Calendario Interactivo" 
              description="Planifica tus entrenamientos semana a semana."
            />
          </div>
        </div>
      </section>
      
      {/* App Screenshots */}
      <section className="py-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Un Vistazo a Fit Tracker</h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Una interfaz elegante y funcional para maximizar tu experiencia de entrenamiento.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Screenshot title="Dashboard" />
            <Screenshot title="Estadísticas" />
            <Screenshot title="Seguimiento de Peso" />
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 px-4 md:px-8 bg-[#131313]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Lo Que Dicen Nuestros Usuarios</h2>
          <p className="text-gray-400 text-center mb-12 max-w-3xl mx-auto">
            Descubre cómo Fit Tracker está transformando la forma en que las personas entrenan.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Testimonial 
              quote="Fit Tracker me ha ayudado a seguir mi progreso como nunca antes. ¡Es indispensable!" 
              author="Juan Pérez" 
              role="Usuario desde 2022"
            />
            <Testimonial 
              quote="El calendario y las estadísticas me mantienen motivada cada día." 
              author="Ana Gómez" 
              role="Entrenadora Personal"
            />
            <Testimonial 
              quote="La mejor herramienta para llevar mi entrenamiento al siguiente nivel." 
              author="Carlos López" 
              role="Atleta Amateur"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para Transformar tu Entrenamiento?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Únete a miles de usuarios que ya están transformando su entrenamiento.
          </p>
          
          <Link href="/login">
            <motion.button 
              className="bg-[#00C4B4] hover:bg-[#00A396] text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg shadow-[#00C4B4]/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Compra Ahora
            </motion.button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 px-4 md:px-8 bg-[#0D0D0D] border-t border-[#333333]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-gray-400">© 2023 Fit Tracker. Todos los derechos reservados.</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:soporte@fittracker.com" className="text-gray-400 hover:text-[#00C4B4] transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00C4B4] transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#00C4B4] transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

