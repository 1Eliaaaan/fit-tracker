import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

type AISummaryCardProps = {
  summaryText: string | null;
  isLoading: boolean;
};

export default function AISummaryCard({ summaryText, isLoading }: AISummaryCardProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!summaryText || isLoading) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(summaryText.slice(0, i + 1));
      i++;
      if (i >= summaryText.length) {
        clearInterval(interval);
      }
    }, 20); // 20ms per character

    return () => clearInterval(interval);
  }, [summaryText, isLoading]);

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 border-l-4 border-l-lime-400/20 border-y border-r border-y-zinc-800 border-r-zinc-800 m-4 relative overflow-hidden">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-lime-400/10 p-2 rounded-xl text-lime-400">
          <Bot size={24} />
        </div>
        <h3 className="text-white font-bold text-lg">Análisis de la sesión</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <motion.div 
            className="h-4 bg-zinc-800 rounded-md w-full" 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="h-4 bg-zinc-800 rounded-md w-5/6" 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="h-4 bg-zinc-800 rounded-md w-4/6" 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      ) : (
        <div className="text-zinc-300 leading-relaxed min-h-[4rem]">
          {displayedText}
          {displayedText.length < (summaryText?.length || 0) && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-lime-400 ml-1 align-middle"
            />
          )}
        </div>
      )}
    </div>
  );
}
