import { motion } from 'framer-motion';
// @ts-ignore
import { ALL_MUSCLE_GROUPS, MUSCLE_GROUP_ICONS, MUSCLE_GROUP_COLORS } from '../../data/exercises';

// Fallback type if import fails
type MuscleGroup = string;

type CategoryGridProps = {
  onSelect: (category: MuscleGroup) => void;
  selectedCategory: MuscleGroup | null;
};

export default function CategoryGrid({ onSelect, selectedCategory }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 p-4">
      {(ALL_MUSCLE_GROUPS as string[]).map((category) => {
        const isSelected = selectedCategory === category;
        // @ts-ignore
        const icon = MUSCLE_GROUP_ICONS[category] || '💪';
        
        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-colors ${
              isSelected
                ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 text-zinc-400'
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="category-selection"
                className="absolute inset-0 rounded-2xl border-2 border-lime-400"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="text-3xl mb-2 z-10">{icon}</span>
            <span className="text-xs font-bold uppercase tracking-wider z-10 text-center">
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
