import { useState } from 'react';
import { CalculatorIcon } from '@heroicons/react/24/outline';

export default function WeightConverter() {
  const [pounds, setPounds] = useState('');
  const [kilograms, setKilograms] = useState('');

  const handlePoundsChange = (value: string) => {
    setPounds(value);
    if (value === '') {
      setKilograms('');
      return;
    }
    const lbs = parseFloat(value);
    if (!isNaN(lbs)) {
      setKilograms((lbs * 0.45359237).toString());
    }
  };

  const handleKilogramsChange = (value: string) => {
    setKilograms(value);
    if (value === '') {
      setPounds('');
      return;
    }
    const kg = parseFloat(value);
    if (!isNaN(kg)) {
      setPounds((kg / 0.45359237).toString());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
        <CalculatorIcon className="h-6 w-6 mr-2 text-green-500" />
        Weight Converter
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pounds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pounds (lbs)
          </label>
          <input
            type="number"
            id="pounds"
            value={pounds}
            onChange={(e) => handlePoundsChange(e.target.value)}
            placeholder="Enter weight in pounds"
            step="any"
            min="0"
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </div>
        <div>
          <label htmlFor="kilograms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kilograms (kg)
          </label>
          <input
            type="number"
            id="kilograms"
            value={kilograms}
            onChange={(e) => handleKilogramsChange(e.target.value)}
            placeholder="Enter weight in kilograms"
            step="any"
            min="0"
            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Conversion rate: 1 lb = 0.45359237 kg
      </p>
    </div>
  );
} 