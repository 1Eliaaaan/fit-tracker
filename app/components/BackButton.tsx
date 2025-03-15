'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import React from 'react';

export default function BackButton() {
  // Solución para el error de TypeScript con Lucide icons
  const ArrowLeftIcon = ArrowLeft as React.ElementType;

  return (
    <Link href="/dashboard" className="inline-flex">
      <motion.button
        className="fixed top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg border border-[#333333] shadow-md hover:bg-[#222222] hover:border-[#00C4B4] transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Volver a inicio"
      >
        <ArrowLeftIcon size={16} />
        <span className="text-sm md:text-base">Volver a Inicio</span>
      </motion.button>
    </Link>
  );
} 